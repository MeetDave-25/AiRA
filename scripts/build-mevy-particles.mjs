// Bakes public/wolf.glb (a ~950k-triangle static mesh, 34 MB) into a tiny particle cloud for the
// homepage "Mevy, made of light" section.
//
//   node scripts/build-mevy-particles.mjs [count]
//
// Output: public/mevy-particles.bin
//   uint32 count
//   int16  positions[count * 3]   (normalised to roughly -1..1, Y up, height = 2)
//   uint8  colors[count * 3]      (sampled from the base-colour texture)

import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const COUNT = Number(process.argv[2] || 60000);
const SRC = "public/wolf.glb";
const OUT = "public/mevy-particles.bin";

const glb = readFileSync(SRC);
const jsonLen = glb.readUInt32LE(12);
const gltf = JSON.parse(glb.subarray(20, 20 + jsonLen).toString("utf8"));
const binStart = 20 + jsonLen + 8;
const bin = glb.subarray(binStart);

const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const READERS = {
    5126: [4, (dv, o) => dv.getFloat32(o, true)],
    5125: [4, (dv, o) => dv.getUint32(o, true)],
    5123: [2, (dv, o) => dv.getUint16(o, true)],
    5121: [1, (dv, o) => dv.getUint8(o)],
    5122: [2, (dv, o) => dv.getInt16(o, true)],
    5120: [1, (dv, o) => dv.getInt8(o)],
};

function readAccessor(index) {
    const acc = gltf.accessors[index];
    const view = gltf.bufferViews[acc.bufferView];
    const n = COMPONENTS[acc.type];
    const [size, read] = READERS[acc.componentType];
    const stride = view.byteStride || n * size;
    const base = (view.byteOffset || 0) + (acc.byteOffset || 0);
    const dv = new DataView(bin.buffer, bin.byteOffset + base, view.byteLength - (acc.byteOffset || 0));
    const out = new Float64Array(acc.count * n);
    // Normalised integer UVs are rare, but handle them so colours stay correct.
    const norm = acc.normalized ? { 5121: 255, 5123: 65535, 5120: 127, 5122: 32767 }[acc.componentType] || 1 : 1;
    for (let i = 0; i < acc.count; i++) {
        for (let c = 0; c < n; c++) out[i * n + c] = read(dv, i * stride + c * size) / norm;
    }
    return out;
}

async function loadTexture(materialIndex) {
    const mat = gltf.materials?.[materialIndex];
    const texIndex = mat?.pbrMetallicRoughness?.baseColorTexture?.index;
    if (texIndex == null) return null;
    const tex = gltf.textures[texIndex];
    const source = tex.source ?? tex.extensions?.EXT_texture_webp?.source;
    const img = gltf.images[source];
    const view = gltf.bufferViews[img.bufferView];
    const bytes = bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return { data, w: info.width, h: info.height };
}

// Every triangle from every primitive, with world positions, UVs and its texture.
const tris = [];
let totalArea = 0;
for (const mesh of gltf.meshes) {
    for (const prim of mesh.primitives) {
        const pos = readAccessor(prim.attributes.POSITION);
        const uv = prim.attributes.TEXCOORD_0 != null ? readAccessor(prim.attributes.TEXCOORD_0) : null;
        const idx = prim.indices != null ? readAccessor(prim.indices) : Float64Array.from({ length: pos.length / 3 }, (_, i) => i);
        const texture = await loadTexture(prim.material);
        for (let t = 0; t < idx.length; t += 3) {
            const a = idx[t], b = idx[t + 1], c = idx[t + 2];
            const ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2];
            const ux = pos[b * 3] - ax, uy = pos[b * 3 + 1] - ay, uz = pos[b * 3 + 2] - az;
            const vx = pos[c * 3] - ax, vy = pos[c * 3 + 1] - ay, vz = pos[c * 3 + 2] - az;
            const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
            const area = 0.5 * Math.hypot(cx, cy, cz);
            if (!(area > 0)) continue;
            totalArea += area;
            tris.push({ a, b, c, pos, uv, texture, cum: totalArea });
        }
    }
}
console.log(`triangles: ${tris.length}, sampling ${COUNT} points`);

// Seeded RNG so rebuilds are stable.
let seed = 1337;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const positions = new Float64Array(COUNT * 3);
const colors = new Uint8Array(COUNT * 3);
for (let i = 0; i < COUNT; i++) {
    // Area-weighted triangle pick (binary search on the cumulative area).
    const r = rand() * totalArea;
    let lo = 0, hi = tris.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (tris[mid].cum < r) lo = mid + 1; else hi = mid;
    }
    const tri = tris[lo];
    let u = rand(), v = rand();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const w = 1 - u - v;
    for (let k = 0; k < 3; k++) {
        positions[i * 3 + k] = tri.pos[tri.a * 3 + k] * w + tri.pos[tri.b * 3 + k] * u + tri.pos[tri.c * 3 + k] * v;
    }
    let rgb = [200, 200, 220];
    if (tri.uv && tri.texture) {
        const tu = tri.uv[tri.a * 2] * w + tri.uv[tri.b * 2] * u + tri.uv[tri.c * 2] * v;
        const tv = tri.uv[tri.a * 2 + 1] * w + tri.uv[tri.b * 2 + 1] * u + tri.uv[tri.c * 2 + 1] * v;
        const { data, w: tw, h: th } = tri.texture;
        const px = Math.min(tw - 1, Math.max(0, Math.floor((((tu % 1) + 1) % 1) * tw)));
        const py = Math.min(th - 1, Math.max(0, Math.floor((((tv % 1) + 1) % 1) * th)));
        const o = (py * tw + px) * 4;
        rgb = [data[o], data[o + 1], data[o + 2]];
    }
    colors.set(rgb, i * 3);
}

// Normalise: centre on the bounding box, scale so the model is 2 units tall.
const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < COUNT; i++) for (let k = 0; k < 3; k++) {
    min[k] = Math.min(min[k], positions[i * 3 + k]);
    max[k] = Math.max(max[k], positions[i * 3 + k]);
}
const size = max.map((m, k) => m - min[k]);
console.log("bbox size (x, y, z):", size.map((s) => s.toFixed(3)).join(", "));
const centre = min.map((m, k) => (m + max[k]) / 2);
const scale = 2 / size[1];

const out = Buffer.alloc(4 + COUNT * 6 + COUNT * 3);
out.writeUInt32LE(COUNT, 0);
for (let i = 0; i < COUNT * 3; i++) {
    const k = i % 3;
    const n = (positions[i] - centre[k]) * scale; // ~ -1..1 on Y, may exceed 1 on X/Z for wide poses
    out.writeInt16LE(Math.round(Math.max(-1.6, Math.min(1.6, n)) / 1.6 * 32767), 4 + i * 2);
}
Buffer.from(colors.buffer).copy(out, 4 + COUNT * 6);
writeFileSync(OUT, out);
console.log(`wrote ${OUT}: ${(out.length / 1024).toFixed(0)} KB`);
