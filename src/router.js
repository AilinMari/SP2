// // src/router.js
// const routes = [];
// let notFound = () => `<h1 class="text-2xl font-bold">404 – Not found</h1>`;

// export function registerRoute(path, loader, options = {}) {
//   // path kan ha parametre: "/single-listing/:id"
//   const paramNames = [];
//   const regex = new RegExp(
//     "^" +
//       path
//         .replace(/\/+$/, "")
//         .replace(/:[^/]+/g, (m) => {
//           paramNames.push(m.slice(1));
//           return "([^/]+)";
//         }) +
//       "$"
//   );
//   routes.push({ regex, paramNames, loader, options });
// }

// export function setNotFound(loader) {
//   notFound = loader;
// }

// function parseLocation() {
//   // "#/login" -> "/login"
//   const raw = location.hash.replace(/^#/, "");
//   return raw === "" ? "/" : raw.replace(/\/+$/, ""); // normaliser trailing slash
// }

// async function render() {
//   const path = parseLocation();
//   const match = routes.find((r) => r.regex.test(path));

//   const el = document.getElementById("app");
//   if (!match) {
//     el.innerHTML = await Promise.resolve(notFound());
//     return;
//   }

//   // auth-guard?
//   if (match.options?.guard && !match.options.guard()) {
//     location.hash = "#/login";
//     return;
//   }

//   const values = match.regex.exec(path).slice(1);
//   const params = Object.fromEntries(match.paramNames.map((n, i) => [n, values[i]]));

//   const result = await Promise.resolve(match.loader({ params, path }));
//   if (typeof result === "string") {
//     el.innerHTML = result;
//   } else if (result && typeof result === "object") {
//     // { html, onMount }
//     el.innerHTML = result.html || "";
//     if (typeof result.onMount === "function") result.onMount();
//   }

//   window.scrollTo({ top: 0, behavior: "auto" });
// }

// export function initRouter() {
//   window.addEventListener("hashchange", render);
//   window.addEventListener("load", render);
// }

// export function navigate(to) {
//   location.hash = to.startsWith("#") ? to : `#${to}`;
// }