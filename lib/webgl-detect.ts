/**
 * Detect if WebGL is available in the current browser environment.
 * Returns false if WebGL context creation fails or is unsupported.
 */
export function isWebGLAvailable(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const canvas = document.createElement("canvas");
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
    } catch (e) {
        return false;
    }
}

/**
 * Detect if WebGL2 is available.
 */
export function isWebGL2Available(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const canvas = document.createElement("canvas");
        return !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
    } catch (e) {
        return false;
    }
}
