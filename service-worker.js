const CACHE_NAME = "multilog-cache-v4";

const ARQUIVOS_CACHE = [
  "/",
  "/index.html",

  "/operator/index.html",

  "/css/base.css",
  "/css/app.css",
  "/css/toast.css",
  "/css/loading.css",
  "/css/buttons.css",
  "/css/cards.css",
  "/css/inputs.css",
  "/css/operator.css",

  "/js/config.js",
  "/js/api.js",
  "/js/auth.js",
  "/js/offline.js",
  "/js/toast.js",
  "/js/loading.js",
  "/js/index.js",

  "/operator/js/operator-ui.js",
  "/operator/js/operator-wizard.js",
  "/operator/js/operator.js",

  "/manifest.json"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(ARQUIVOS_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if(request.method !== "GET"){
    return;
  }

  const url = new URL(request.url);

  if(url.origin !== self.location.origin){
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if(
          response &&
          response.ok
        ){
          const copia = response.clone();

          caches
            .open(CACHE_NAME)
            .then(cache => {
              cache.put(request, copia);
            });
        }

        return response;
      })
      .catch(async () => {
        const respostaCache = await caches.match(
          request,
          {
            ignoreSearch: true
          }
        );

        if(respostaCache){
          return respostaCache;
        }

        if(
          request.mode === "navigate" &&
          url.pathname.startsWith("/operator")
        ){
          return caches.match(
            "/operator/index.html"
          );
        }

        if(request.mode === "navigate"){
          return caches.match(
            "/index.html"
          );
        }

        return Response.error();
      })
  );
});
