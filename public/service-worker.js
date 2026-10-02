const CACHE_NAME = "zed-gift-shop-v1";
const OFFLINE_URL = "/offline";

const assetsToCache = [
  "/",
  "/shop",
  "/gifts",
  "/collections",
  "/about",
  "/contact",
  "/faq",
  "/track",
  "/wishlist",
  "/gift-finder",
  "/gift-builder",
  "/deals",
  "/personalized",
  "/login",
  "/register",
  "/checkout",
  "/policies/privacy",
  "/policies/terms",
  "/manifest.webmanifest",
  "/sitemap.xml",
  "/robots.txt",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip full Firebase/Supabase endpoints
  if (event.request.url.includes("__/firebasestorage")) return;
  if (event.request.url.includes("supabase")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available, otherwise fetch
      if (cachedResponse) {
        return cachedResponse;
      }

      // For navigation requests, return offline page
      if (event.request.mode === "navigate") {
        return caches.match(OFFLINE_URL);
      }

      // For other requests, fetch from network
      try {
        return fetch(event.request);
      } catch (e) {
        console.log("Fetch failed, serving offline fallback:", e);
        return caches.match(OFFLINE_URL);
      }
    })
  );
});