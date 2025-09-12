import { AuctionApi } from "/js/apiClient.js";
import { renderAllListings } from "/js/listings/allListingsRenderer.js";
import { renderActiveCarousel } from "/js/listings/activeCarousel.js";
import { mountCarousel } from "/js/ui/carousel.js";
import { initListingFilters } from "/js/listings/filterControls.js";
import { initProfileSearch } from "/js/profiles/searchProfiles.js";

const auctionApi = new AuctionApi();

let allListings = [];

async function renderListingsUI() {
  // Sort by created date descending so newest listings appear first
  allListings.sort((a, b) => new Date(b.created) - new Date(a.created));
  const now = new Date();
  const topCount = 10;

  const activeListings = allListings.filter((l) => {
    const ends = l.endsAt
      ? new Date(l.endsAt)
      : l.data?.endsAt
      ? new Date(l.data.endsAt)
      : null;
    return ends && ends > now;
  });

  const topBids = activeListings
    .slice()
    .sort((a, b) => (b._count?.bids || 0) - (a._count?.bids || 0))
    .slice(0, topCount);

  // Build tag carousels from activeListings
  const tagCounts = {};
  activeListings.forEach((l) => {
    const tags = l.tags || l.data?.tags || [];
    if (!Array.isArray(tags)) return;
    tags.forEach((t) => {
      const key = (typeof t === "string" ? t : t.name || String(t)).toLowerCase();
      tagCounts[key] = (tagCounts[key] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((t) => t[0]);

  const mostBidsRoot = document.querySelector(".most-bids");
  if (mostBidsRoot) {
    mostBidsRoot.innerHTML = "";
    topTags.forEach((tag) => {
      const section = document.createElement("section");
      section.className = "tag-carousel mb-6";
      const heading = document.createElement("h3");
      heading.textContent = `#${tag}`;
      heading.className = "text-lg font-semibold mb-2 text-[var(--main-blue)]";
      section.appendChild(heading);

      const carouselHost = document.createElement("div");
      carouselHost.className = "tag-carousel-host";

      const items = activeListings.filter((l) => {
        const tags = l.tags || l.data?.tags || [];
        if (!Array.isArray(tags)) return false;
        return tags.some(
          (t) => (typeof t === "string" ? t : t.name || String(t)).toLowerCase() === tag
        );
      });

      const renderItem = (listing) => {
        const item = document.createElement("div");
        const id = listing.id || listing._id || "";
        const link = document.createElement("a");
        link.href = id ? `/single-listing.html?id=${id}` : "#";
        const img = document.createElement("img");
        img.loading = "lazy";
        img.src = listing?.media?.[0]?.url || "/images/GoldenBid-icon.png";
        img.alt = listing?.title || "Listing image";
        img.className = "w-full h-40 object-cover rounded mb-2";
        const title = document.createElement("div");
        title.className = "text-sm font-semibold text-[var(--main-blue)]";
        title.textContent = listing?.title || "Untitled";
        link.appendChild(img);
        link.appendChild(title);
        item.appendChild(link);
        return item;
      };

      mountCarousel(carouselHost, items, renderItem, {
        itemWidth: "300px",
        gap: 12,
      });

      section.appendChild(carouselHost);
      mostBidsRoot.appendChild(section);
    });
  }

  if (topBids.length) renderActiveCarousel(topBids);

  // Remove carousel items from the grid to avoid duplicates
  const shownIds = new Set(topBids.map((l) => l.id || l._id));
  topTags &&
    topTags.forEach((tag) => {
      activeListings.forEach((l) => {
        const tags = l.tags || l.data?.tags || [];
        if (!Array.isArray(tags)) return;
        const found = tags.some(
          (t) => (typeof t === "string" ? t : t.name || String(t)).toLowerCase() === tag
        );
        if (found) shownIds.add(l.id || l._id);
      });
    });

  // For the main grid we show newest active listings (search will replace these results)
  const mainGridLimit = 8; // show only a few items on front page
  const newestActive = activeListings.slice(0, mainGridLimit);
  renderAllListings(newestActive, { limit: mainGridLimit });
}

async function handleListingsView() {
  // show a simple loading state while we fetch the first page fast
  const listingsGrid = document.querySelector(".listings-grid");
  if (listingsGrid) listingsGrid.innerHTML = "<p>Loading listings...</p>";

  // try {
  //   allListings = await auctionApi.getAllListings();
  // } catch (err) {
  //   console.error("Failed to fetch initial listings page:", err);
  //   allListings = [];
  // }

  // render from whatever we have quickly
  await renderListingsUI();

  // Start background fetch of all pages but don't block initial render
  if (typeof auctionApi.getAllListingsAll === "function") {
    // Limit background fetch to a few pages to avoid long load times while still
    // improving search coverage. Adjust maxPages as needed (e.g., 3 pages).
    auctionApi
      .getAllListingsAll({ limit: 100, maxPages: 12 })
      .then((full) => {
        if (Array.isArray(full) && full.length > (allListings?.length || 0)) {
          allListings = full;
          // If the user has an active search/filter, re-run filters so their view updates.
          // Otherwise re-render the default listings UI with the full dataset.
          const searchBar = document.getElementById("search-bar");
          if (searchBar && searchBar.value && searchBar.value.trim().length > 0) {
            // trigger the input listener to re-run filters
            searchBar.dispatchEvent(new Event("input", { bubbles: true }));
          } else {
            renderListingsUI().catch((err) =>
              console.error("Error re-rendering after full fetch:", err)
            );
          }
        }
      })
      .catch((err) => console.error("Background fetch failed:", err));
  }
}

handleListingsView();

// Listen for a one-off 'listings:updated' event so the page refreshes when a new listing is created
window.addEventListener("listings:updated", (e) => {
  // Only refresh if the listings grid exists on the current page (we're on listings view)
  const listingsGrid = document.querySelector(".listings-grid");
  if (!listingsGrid) return;

  // Re-run the handler to fetch fresh pages and re-render
  handleListingsView().catch((err) =>
    console.error("Failed to refresh listings after update:", err)
  );
});


// Filtering UI logic
document.addEventListener("DOMContentLoaded", () => {
  // Wire up listing filters (moves the long filtering logic into its own module)
  initListingFilters({
    getListings: () => allListings,
    renderAll: renderAllListings,
  });
  // Wire up profile search input -> dropdown results
  initProfileSearch({
    inputSelector: "#profile-search",
    resultsContainer: "#profile-results",
  });
});
