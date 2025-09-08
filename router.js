// // Simple hash router
// // Patterns map to lazy page renderers
// const routes = [
//     { pattern: /^#/?$/, load: async () => { const m = await import('../listings.js'); await m.render(); } },
//     { pattern: /^#/listing/([\w-]+)$/, load: async (match) => { const m = await import('../listings/singleListing.js'); await m.render(match?.[1]  ''); } },
//     { pattern: /^#/profile$/, load: async () => { const m = await import('../myprofile/profile.js'); await m.render(); } },
//     { pattern: /^#/auth$/, load: async () => { const m = await import('../auth/login.js'); await m.render(); } },
//     { pattern: /^#/create$/, load: async () => { const m = await import('../pages/CreateEdit.js'); await m.renderCreate(); } },
//     { pattern: /^#/edit/([\w-]+)$/, load: async (match) => { const m = await import('../pages/CreateEdit.js'); await m.renderEdit(match?.[1]  ''); } }
// ];
// export function startRouter() {
//     const go = async () => {
//         const hash = location.hash || '#/';
//         for (const r of routes) {
//             const match = r.pattern.exec(hash);
//             if (match) {
//                 await r.load(match);
//                 return;
//             }
//         }
//         location.hash = '#/';
//     };
//     window.addEventListener('hashchange', go);
//     go();
// }