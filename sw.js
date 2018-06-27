const sleep = (ms) => new Promise(resolve => {
    setTimeout(resolve, ms);
});

addEventListener('install', e => {
  e.waitUntil(
  caches.open('v1')
    .then(cache => cache.addAll([
      '/',
    ]))
  .then(self.skipWaiting())
  );
});

addEventListener('activate', e => {
  clients.claim();
});

addEventListener('fetch', e => {
  let request = e.request;
  if (!request.url.startsWith(location.origin)) {
    return;
  }
  e.respondWith(
    caches.match(request).then(res => res || fetch(request).then(res =>
        caches.open('v1').then(cache => (cache.put(request, res.clone()), res.clone()))
    ))
  );
});