import { AuctionApi } from "../apiClient";
import { filterListings } from "./filtering.js";

const auctionApi = new AuctionApi();

function renderAllListings(listings) {
  const listingsGrid = document.querySelector(".listings-grid");
  if (!listingsGrid) {
    console.error("Listings grid not found");
    return;
  }
  listingsGrid.innerHTML = ""; // Clear existing listings

  if (!Array.isArray(listings) || listings.length === 0) {
    listingsGrid.innerHTML = "<p>No listings available.</p>";
    return;
  }

  console.log("Rendering listings:", listings);

  listings.forEach((listing) => {
    // Render all listings. If no media is present, use a placeholder image.
    const imageSrc =
      listing.media && Array.isArray(listing.media) && listing.media[0]?.url
        ? listing.media[0].url
        : "/src/images/GoldenBid-icon.png"; // fallback placeholder
    const imageAlt =
      listing.media && listing.media[0]?.alt
        ? listing.media[0].alt
        : listing.title || "Listing image";

    // Proceed to render the listing
    const listingContainer = document.createElement("div");
    listingContainer.className =
      "container flex flex-col bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md rounded-md mb-8 ";

    const title = document.createElement("h1");
    title.className =
      "listing-title text-xl font-semibold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-2 max-w-full overflow-hidden text-ellipsis";
    title.textContent = listing.title;

    const seller = document.createElement("a");
    seller.className =
      "listing-seller text-md font-regular text-[var(--main-blue)] font-['Playfair_Display',serif] mb-4";
    seller.textContent = `Seller: ${listing.seller.name}`;
    seller.href = `/profile/index.html?id=${listing.seller.name}`;

    const link = document.createElement("a");
    // fix query string: id=...& _seller=true
    link.href = `/single-listing/index.html?id=${listing.id}&_seller=true`;

    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = imageAlt;
    img.className = "listing-image h-48 w-full object-cover";

    const endsAt = document.createElement("span");
    endsAt.className = "listing-ends-at block mt-2 text-sm text-red-600";
    const now = new Date();
    const endsDate = new Date(listing.endsAt);
    if (endsDate <= now) {
      endsAt.textContent = "Auction ended";
    } else {
      endsAt.textContent = `Ends at: ${endsDate.toLocaleString()}`;
    }

    const bids = document.createElement("span");
    bids.className = "listing-bids";
    bids.textContent = `${listing._count?.bids || 0} bids`;

    link.appendChild(title);
    link.appendChild(seller);
    link.appendChild(img);
    listingContainer.appendChild(link);
    listingsGrid.appendChild(listingContainer);
    listingContainer.appendChild(endsAt);
    listingContainer.appendChild(bids);
  });
}

let allListings = [];

async function handleListingsView() {
  allListings = await auctionApi.getAllListings();
  if (!Array.isArray(allListings)) allListings = [];
  // Default: show active listings (endsAt in future) first
  const now = new Date();
  allListings.sort((a, b) => {
    const aActive = a.endsAt ? new Date(a.endsAt) > now : false;
    const bActive = b.endsAt ? new Date(b.endsAt) > now : false;
    if (aActive === bActive) return 0;
    return aActive ? -1 : 1;
  });

  renderAllListings(allListings);
}

handleListingsView();

// Filtering UI logic
document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const statusFilter = document.getElementById("status-filter");
  const sortFilter = document.getElementById("sort-filter");

  function sortListings(listings, sortType) {
    let sorted = [...listings];
    switch (sortType) {
      case "newest":
        sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.created) - new Date(b.created));
        break;
      case "most-bids":
        sorted.sort((a, b) => (b._count?.bids || 0) - (a._count?.bids || 0));
        break;
      case "least-bids":
        sorted.sort((a, b) => (a._count?.bids || 0) - (b._count?.bids || 0));
        break;
      default:
        break;
    }
    return sorted;
  }

  function applyFilters() {
    const search = searchBar ? searchBar.value : "";
    const status = statusFilter ? statusFilter.value : "all";
    const sortType = sortFilter ? sortFilter.value : "newest";
    let filtered = filterListings(allListings, { search, status });
    filtered = sortListings(filtered, sortType);
    renderAllListings(filtered);
  }

  if (searchBar) {
    searchBar.addEventListener("input", applyFilters);
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }
  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }
});
