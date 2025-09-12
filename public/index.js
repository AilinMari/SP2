import { AuctionApi } from "/js/apiClient.js";
import { attachCountdown, detachCountdown } from "/js/utils/countdown.js";
import { filterListings } from "/js/listings/filtering.js";
import { initListingFilters } from "/js/listings/filterControls.js";
import { mountCarousel } from "/js/ui/carousel.js";
import { renderAllListings } from "/js/listings/allListingsRenderer.js";
import { renderActiveCarousel } from "/js/listings/activeCarousel.js";
import { initProfileSearch } from "/js/profiles/searchProfiles.js";

const auctionApi = new AuctionApi();

// `renderAllListings` moved to /js/listings/allListingsRenderer.js

// ...existing code... (renderActiveCarousel moved to /js/listings/activeCarousel.js)

let allListings = [];
// Configure how many pages the index should fetch on initial load.
// Set to a number (e.g., 1,2,3) to limit pages, or 0 for all pages.
// Change this value directly in code to adjust initial load behavior.
const INITIAL_MAX_PAGES = 12; // default: fetch 12 pages on load
// Configure how many newest active listings to show in the main grid
const INITIAL_GRID_LIMIT = 4;

async function handleListingsView() {
  // show a simple loading state while we fetch potentially many pages
  const listingsGrid = document.querySelector(".listings-grid");
  if (listingsGrid) listingsGrid.innerHTML = "<p>Loading listings...</p>";

  const maxPages =
    INITIAL_MAX_PAGES && Number(INITIAL_MAX_PAGES) > 0
      ? Number(INITIAL_MAX_PAGES)
      : Infinity;

  // helper that (re)renders UI from the current allListings array
  function renderFromListings() {
    if (!Array.isArray(allListings)) return;
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

    // Compute tag counts and top tags
    const tagCounts = {};
    activeListings.forEach((l) => {
      const tags = l.tags || l.data?.tags || [];
      if (!Array.isArray(tags)) return;
      tags.forEach((t) => {
        const key = (
          typeof t === "string" ? t : t.name || String(t)
        ).toLowerCase();
        tagCounts[key] = (tagCounts[key] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((t) => t[0]);

    // render side carousels
    const mostBidsRoot = document.querySelector(".tag-carousels");
    if (mostBidsRoot) {
      mostBidsRoot.innerHTML = "";
      topTags.forEach((tag) => {
        const section = document.createElement("section");
        section.className = "tag-carousel mb-6";
        const heading = document.createElement("h3");
        heading.textContent = `${tag}`;
        heading.className =
          "text-lg font-inter text-[var(--main-gold)] uppercase border-b-2 border-[var(--main-blue)] mb-2 pb-6";
        section.appendChild(heading);

        const carouselHost = document.createElement("div");
        carouselHost.className = "tag-carousel-host";

        const items = activeListings.filter((l) => {
          const tags = l.tags || l.data?.tags || [];
          if (!Array.isArray(tags)) return false;
          return tags.some(
            (t) =>
              (typeof t === "string"
                ? t
                : t.name || String(t)
              ).toLowerCase() === tag
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
          gap: 5,
        });

        section.appendChild(carouselHost);
        mostBidsRoot.appendChild(section);
      });
    }

    if (topBids.length) renderActiveCarousel(topBids);

    // Main grid: show only newest active listings (exclude expired)
    const newestActive = activeListings
      .slice()
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, INITIAL_GRID_LIMIT);
    renderAllListings(newestActive);
  }

  // Incremental fetch: render pages as they arrive
  if (typeof auctionApi.getAllListingsPaged === "function") {
    allListings = [];
    await auctionApi.getAllListingsPaged(
      { limit: 100, maxPages },
      (pageData, pageNum) => {
        // append page items
        allListings.push(...(Array.isArray(pageData) ? pageData : []));
        // after the first page, replace loading state with rendered content
        renderFromListings();
      }
    );
  } else {
    // fallback to previous full-fetch behavior
    if (typeof auctionApi.getAllListingsAll === "function") {
      allListings = await auctionApi.getAllListingsAll({
        limit: 100,
        maxPages,
      });
    } else {
      allListings = await auctionApi.getAllListings();
    }
    renderFromListings();
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
