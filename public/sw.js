const CACHE_NAME = "aira-lab-shell-v3";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = ["/", OFFLINE_URL];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                    return Promise.resolve(false);
                })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

// Non-blocking fetch: keep navigation and Next.js client-side routes blazing fast
self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    // For offline fallback only on full document navigation if network completely fails
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(async () => {
                const cached = await caches.match(request);
                return cached || caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    // Static assets cache-first with network update
    if (request.url.includes("/icon.svg") || request.url.includes("/apple-icon.svg")) {
        event.respondWith(
            caches.match(request).then((cached) => {
                return cached || fetch(request).then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
                    return response;
                });
            })
        );
    }
});

// ══ NATIVE SYSTEM PUSH NOTIFICATIONS (OUTSIDE APPLICATION / LOCK SCREEN) ══
self.addEventListener("push", (event) => {
    let payload = {
        title: "AiRA Lab Alert",
        body: "You have a new update in AiRA Lab.",
        url: "/",
        icon: "/icon.svg",
    };

    if (event.data) {
        try {
            payload = event.data.json();
        } catch {
            payload.body = event.data.text();
        }
    }

    const options = {
        body: payload.body || payload.message || "New announcement posted",
        icon: payload.icon || "/icon.svg",
        badge: "/icon.svg",
        vibrate: [300, 100, 300, 100, 300],
        tag: payload.id || `aira-notif-${Date.now()}`,
        renotify: true,
        requireInteraction: true,
        silent: false,
        data: {
            url: payload.url || payload.link || "/",
            dateOfArrival: Date.now(),
        },
        actions: [
            { action: "open", title: "Open App 🚀" },
            { action: "dismiss", title: "Dismiss" }
        ],
    };

    event.waitUntil(
        self.registration.showNotification(payload.title || "AiRA Lab", options)
    );
});

// ══ HANDLE NOTIFICATION CLICK (OPENS APP DIRECTLY FROM LOCK SCREEN / DESKTOP) ══
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "dismiss") {
        return;
    }

    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ("focus" in client && client.url.includes(self.location.origin)) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
