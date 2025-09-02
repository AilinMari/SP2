import { AuctionApi } from "../../js/api/apiClient";

const auctionApi = new AuctionApi();

const token = localStorage.getItem("token");

const loginLink = document.querySelector(".login-link");
const signUpLink = document.querySelector(".sign-up");
const or = document.querySelector(".or");
const logoutButton = document.querySelector("#logout");
const homeLink = document.querySelector(".home");
const profileLink = document.querySelector(".profile");
const myBidsLink = document.querySelector(".my-bids");

if (token) {
  loginLink.style.display = "none";
  signUpLink.style.display = "none";
  or.style.display = "none";
  logoutButton.style.display = "block";
  homeLink.style.display = "block";
  profileLink.style.display = "block";
  myBidsLink.style.display = "block";
} else {
  loginLink.style.display = "block";
  signUpLink.style.display = "block";
  logoutButton.style.display = "none";
  homeLink.style.display = "none";
  profileLink.style.display = "none";
  myBidsLink.style.display = "none";
}

// Add a hamburger button for small screens and toggle mobile menu
try {
  const navbarEl = document.querySelector(".navbar");
  if (navbarEl) {
    const btn = document.createElement("button");
    btn.className = "hamburger-btn";
    btn.setAttribute("aria-label", "Toggle menu");
    btn.setAttribute("aria-expanded", "false");

    // Create three-line hamburger markup (three spans) for animation to X
    btn.innerHTML = `
      <span class="line line1" aria-hidden="true"></span>
      <span class="line line2" aria-hidden="true"></span>
      <span class="line line3" aria-hidden="true"></span>
    `;

    // Insert the button as the last child so it's visible on the right
    navbarEl.appendChild(btn);

    // Helpers for focus trap and keyboard handling
    const navLinks = navbarEl.querySelector(".nav-links");
    let previouslyFocused = null;
    let onKeyDown;

    function openMenu() {
      navbarEl.classList.add("mobile-open");
      btn.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      // focus trap: focus first focusable inside navLinks
      previouslyFocused = document.activeElement;
      if (navLinks) {
        const focusable = navLinks.querySelectorAll(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length) focusable[0].focus();
      }

      // Key handling: ESC to close and trap Tab inside menu
      onKeyDown = (e) => {
        if (e.key === "Escape") {
          closeMenu();
          return;
        }
        if (e.key === "Tab" && navLinks) {
          const focusable = Array.from(
            navLinks.querySelectorAll(
              'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => !el.disabled);
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener("keydown", onKeyDown);
    }

    function closeMenu() {
      navbarEl.classList.remove("mobile-open");
      btn.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      if (onKeyDown) document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused) previouslyFocused.focus();
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = navbarEl.classList.contains("mobile-open");
      if (open) closeMenu();
      else openMenu();
    });

    // Close the menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !navbarEl.contains(e.target) &&
        navbarEl.classList.contains("mobile-open")
      ) {
        closeMenu();
      }
    });
  }
} catch (err) {
  // Non-fatal: keep navbar behavior working even if script runs early or elements missing
  console.warn("Hamburger menu not initialized", err);
}
