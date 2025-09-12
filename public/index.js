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

async function handleListingsView() {
  // show a simple loading state while we fetch potentially many pages
  const listingsGrid = document.querySelector(".listings-grid");
  if (listingsGrid) listingsGrid.innerHTML = "<p>Loading listings...</p>";

  // fetch all pages and aggregate results
  if (typeof auctionApi.getAllListingsAll === "function") {
    allListings = await auctionApi.getAllListingsAll({ limit: 100 });
  } else {
    allListings = await auctionApi.getAllListings();
  }
  if (!Array.isArray(allListings)) allListings = [];
  // Sort by created date descending so newest listings appear first
  allListings.sort((a, b) => new Date(b.created) - new Date(a.created));
  // Show a "Most bids" carousel first (most popular) but only from active listings
  // Determine active listings (ends in the future), then sort by bids desc and take top N.
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

  // Render the top-bids carousel (only active listings)
  // (rendered later after tag carousels are created)

  // --- New: build carousels for top tags ---
  // Compute tag usage from active listings
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

  const mostBidsRoot = document.querySelector(".most-bids");
  if (mostBidsRoot) {
    mostBidsRoot.innerHTML = "";
    // For each top tag, create a titled carousel
    topTags.forEach((tag) => {
      const section = document.createElement("section");
      section.className = "tag-carousel mb-6";
      const heading = document.createElement("h3");
      heading.textContent = `#${tag}`;
      heading.className = "text-lg font-semibold mb-2 text-[var(--main-blue)]";
      section.appendChild(heading);

      const carouselHost = document.createElement("div");
      carouselHost.className = "tag-carousel-host";

      // find listings that contain this tag and are active
      const items = activeListings.filter((l) => {
        const tags = l.tags || l.data?.tags || [];
        if (!Array.isArray(tags)) return false;
        return tags.some(
          (t) =>
            (typeof t === "string" ? t : t.name || String(t)).toLowerCase() ===
            tag
        );
      });

      // renderItem for mountCarousel
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

  // render active carousel (keep newest/more-bids carousel at top of sidebar)
  if (topBids.length) renderActiveCarousel(topBids);

  // Remove carousel items from the grid to avoid duplicates
  const shownIds = new Set(topBids.map((l) => l.id || l._id));
  // include ids from tag carousels
  topTags &&
    topTags.forEach((tag) => {
      // find items for this tag
      activeListings.forEach((l) => {
        const tags = l.tags || l.data?.tags || [];
        if (!Array.isArray(tags)) return;
        const found = tags.some(
          (t) =>
            (typeof t === "string" ? t : t.name || String(t)).toLowerCase() ===
            tag
        );
        if (found) shownIds.add(l.id || l._id);
      });
    });
  const remaining = allListings.filter((l) => !shownIds.has(l.id || l._id));

  // Render the remaining listings in the grid (sorted newest first)
  renderAllListings(
    remaining.length
      ? remaining.sort((a, b) => new Date(b.created) - new Date(a.created))
      : []
  );
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
