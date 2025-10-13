// Basic service worker - cache-first for static assets, network-first for /api
const CACHE_NAME = 'xd-secure-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/about.html',
  '/dashboard.html',
  '/manifest.json',
  '/assets/app-icon-48.svg',
  '/assets/app-icon-192.svg',
  '/assets/app-icon-512.svg',
  '/assets/preview.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API requests - network first (so stats update)
  if (url.pathname.startsWith('/api') || url.pathname === '/generate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
    return;
  }

  // For everything else, try cache first
  event.respondWith(caches.match(event.request).then(res => res || fetch(event.request)));
});
