import { AuctionApi } from "/js/apiClient.js";
import { attachCountdown, detachCountdown } from "/js/utils/countdown.js";
import { filterListings } from "/js/listings/filtering.js";
import { initListingFilters } from "/js/listings/filterControls.js";
import { mountCarousel } from "/js/ui/carousel.js";
import { renderAllListings } from "/js/listings/allListingsRenderer.js";
import { renderActiveCarousel } from "/js/listings/activeCarousel.js";

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
  if (topBids.length) renderActiveCarousel(topBids);

  // Remove carousel items from the grid to avoid duplicates
  const shownIds = new Set(topBids.map((l) => l.id || l._id));
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
});
