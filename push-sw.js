// GGD notifications helper. It only shows the alerts the news robot sends; it never caches the app, so updates always arrive.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : "" }; }
  const opt = { body: d.body || "", icon: "icon.png", badge: "icon.png", data: { url: d.url || "./" } };
  if (d.tag) { opt.tag = d.tag; opt.renotify = true; }
  e.waitUntil(self.registration.showNotification(d.title || "GGD", opt));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of wins) {
      if (c.url.startsWith(self.registration.scope)) { await c.focus(); c.postMessage({ ggdOpen: url }); return; }
    }
    await self.clients.openWindow(url);
  })());
});
