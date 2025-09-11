import { AuctionApi } from "/js/apiClient.js";

const api = new AuctionApi();

// Call this to wire a search input and container to the profiles search endpoint.
export function initProfileSearch({ inputSelector, resultsContainer }) {
  const input = document.querySelector(inputSelector);
  const container = document.querySelector(resultsContainer);
  if (!input || !container) return;

  let profiles = [];
  let selectedIndex = -1;

  container.setAttribute("role", "listbox");
  container.id = container.id || "profile-results";

  function clearResults() {
    profiles = [];
    selectedIndex = -1;
    container.innerHTML = "";
    container.classList.add("hidden");
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function setSelected(idx) {
    const items = Array.from(container.querySelectorAll("[role=option]"));
    if (items.length === 0) return;
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].classList.remove("profile-result--active");
      items[selectedIndex].setAttribute("aria-selected", "false");
    }
    selectedIndex = idx;
    if (selectedIndex < 0) selectedIndex = -1;
    if (selectedIndex >= 0 && items[selectedIndex]) {
      const el = items[selectedIndex];
      el.classList.add("profile-result--active");
      el.setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", el.id);
      // ensure visible
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function moveSelection(delta) {
    if (!profiles || profiles.length === 0) return;
    let next = selectedIndex + delta;
    if (next < 0) next = profiles.length - 1;
    if (next >= profiles.length) next = 0;
    setSelected(next);
  }

  function openSelected() {
    if (selectedIndex < 0 || !profiles[selectedIndex]) return;
    const p = profiles[selectedIndex];
    const url = `/user-profile.html?id=${encodeURIComponent(p.name)}`;
    window.location.href = url;
  }

  async function runSearch(q) {
    container.innerHTML = '<p class="p-2">Searching...</p>';
    container.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
    try {
      const res = await api.searchProfiles(q);
      const list = Array.isArray(res) ? res : res?.data || [];
      profiles = list;
      renderResults(container, list);
    } catch (err) {
      console.error("Profile search failed", err);
      container.innerHTML = "<p class='p-2'>Search failed. See console.</p>";
    }
  }

  input.addEventListener("input", (e) => {
    const q = e.target.value.trim();
    if (!q) return clearResults();
    runSearch(q);
  });

  input.addEventListener("keydown", (e) => {
    if (container.classList.contains("hidden")) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveSelection(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveSelection(-1);
        break;
      case "Enter":
        e.preventDefault();
        openSelected();
        break;
      case "Escape":
        e.preventDefault();
        clearResults();
        break;
      default:
        break;
    }
  });

  // click outside to close
  document.addEventListener("click", (ev) => {
    if (!input.contains(ev.target) && !container.contains(ev.target)) {
      clearResults();
    }
  });
}

function renderResults(container, profiles) {
  container.innerHTML = "";
  if (!profiles || profiles.length === 0) {
    container.innerHTML = "<p class='p-2'>No profiles found.</p>";
    container.classList.remove("hidden");
    return;
  }

  console.log("Rendering profile search results:", profiles);

  profiles.forEach((p, idx) => {
    const el = document.createElement("div");
    el.className =
      "profile-result p-2 border border-gray-300 flex items-center gap-2";
    el.id = `profile-result-${idx}`;
    el.setAttribute("role", "option");
    el.setAttribute("tabindex", "-1");
    el.setAttribute("aria-selected", "false");

    const a = document.createElement("a");
    a.href = `/user-profile.html?id=${encodeURIComponent(p.name)}`;
    a.textContent = p.name || p.username || "Unnamed";
    a.className = "font-semibold";

    if (p.avatar?.url) {
      const img = document.createElement("img");
      img.src = p.avatar.url;
      img.alt = p.name || "avatar";
      img.className = "w-3 h-3 object-cover rounded-full mt-4 mb-4 ml-2";
      el.appendChild(img);
      el.appendChild(a);
    }

    // mouse interactions
    el.addEventListener("mouseenter", () => {
      // find container's index and mark selection
      const items = Array.from(container.querySelectorAll("[role=option]"));
      const idx = items.indexOf(el);
      if (idx >= 0) {
        // set selection visually
        items.forEach((it) => it.classList.remove("profile-result--active"));
        el.classList.add("profile-result--active");
      }
    });

    el.addEventListener("click", () => {
      window.location.href = a.href;
    });

    container.appendChild(el);
  });
  container.classList.remove("hidden");
}
