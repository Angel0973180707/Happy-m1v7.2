/* =========================
   幸福教養｜模組1｜m1v7.2
   PWA Service Worker（GitHub Pages 可用）
   策略：App Shell 快取 + 靜態檔案快取
========================= */

const CACHE_NAME = "m1v7-2-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// 安裝：預先快取核心檔案
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 啟用：清掉舊快取
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 取用：
// - 對「同網域」檔案：cache-first（快）
// - 若快取沒有：再去網路抓，抓到就更新快取
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 只處理同網域（避免干擾外部資源）
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => {
          // 若離線且抓不到：至少回首頁殼
          return caches.match("./index.html");
        });
    })
  );
});
