// import { registerRoute } from "/src/router.js";
// import { renderProfile } from "/src/js/api/profiles/myprofile/profile.js";
// import { renderListings } from "/src/js/api/listings/listings.js";
import "../css/style.css"; //  custom CSS
// import javascriptLogo from "./javascript.svg";
// import viteLogo from "/vite.svg";
// import { setupCounter } from "./counter.js";

// document.querySelector("#app").innerHTML = `
//   <div>
//     <a href="https://vite.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `;

// Runtime router bootstrap: dynamically load router and register routes to real modules
// async function bootstrapRouter() {
//   const router = await import("/src/router.js");
//   const { registerRoute } = router;

//   // Profile route
//   registerRoute(/^\/profile$/, ({ root }) =>
//     import("/src/js/api/profiles/myprofile/profile.js").then((m) => {
//       if (m.renderProfile) return m.renderProfile(root);
//       if (m.default) return m.default(root);
//     })
//   );

//   // Listings route
//   registerRoute(/^\/listings$/, ({ root }) =>
//     import("/src/js/api/listings/listings.js").then((m) => {
//       if (m.renderListings) return m.renderListings(root);
//       if (m.handleListingsView) return m.handleListingsView(root);
//     })
//   );

//   // Single listing route
//   registerRoute(/^\/listing\/(?<id>[^/]+)$/, ({ root, params }) =>
//     import("/src/js/api/listings/single-listing.js").then((m) => {
//       if (m.renderSingle) return m.renderSingle(root, params.id);
//       if (m.default) return m.default(root, params.id);
//     })
//   );
// }

// bootstrapRouter().catch((err) =>
//   console.error("Failed to load router or routes:", err)
// );

window.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.style.transition = "opacity 0.3s";
    overlay.style.opacity = "0";
    setTimeout(() => (overlay.style.display = "none"), 300);
  }
});
