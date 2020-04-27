self.addEventListener('install', async event => {
    console.log('install event')
});

self.addEventListener('fetch', async event => {
    console.log('fetch event')
});
const cacheName = 'pwa-conf-v1';
const staticAssets = [
    './',
    './index.html',
    './js/game.js',
    './phaser.min.js',
    './sw.js',
    './images/birdsfly.png',
    './topPipe-blue.png',
    './bottomPipe-blue.png',
    './images/cloud.png',
    './images/tree.png',
    './images/mountain.png',
    './images/back_b3.png',
    './images/transparent-cloud.png',
    './images/sea.png',
    './images/blast.png',
    './images/frames.png',
    './images/bird_a.png',
    './images/a-b-group.png',
    './images/eagle.png',
    './images/angry-birds-little.png',
    './assets/sound/AngryBirdsThemeSong.mp3',
    './assets/sound/AngryBirdstheme.mp3',
    './assets/sound/explosion.mp3',
    './assets/sound/game-over-sound-effect.mp3'
];

self.addEventListener('install', async event => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
});

self.addEventListener('fetch', event => {
    const req = event.request;
    event.respondWith(cacheFirst(req));
});
async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(req);
    return cachedResponse || fetch(req);
}
