const CACHE_NAME = "aira-lab-shell-v2";
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

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET" || url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    return cached || caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/icon") || url.pathname.startsWith("/apple-icon")) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const networkFetch = fetch(request)
                    .then((response) => {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
                        return response;
                    })
                    .catch(() => cached);

                return cached || networkFetch;
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
        body: payload.body || payload.message,
        icon: payload.icon || "/icon.svg",
        badge: "/icon.svg",
        vibrate: [200, 100, 200, 100, 200],
        tag: payload.id || `aira-notif-${Date.now()}`,
        renotify: true,
        data: {
            url: payload.url || payload.link || "/",
        },
        actions: [
            { action: "open", title: "View Details 🚀" },
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
                if ("focus" in client) {
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
