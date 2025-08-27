import { Container } from "postcss";
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
    // Only render listings with a valid image URL
    if (
      listing.media &&
      Array.isArray(listing.media) &&
      listing.media.length > 0 &&
      listing.media[0].url
    ) {
      const listingContainer = document.createElement("div");
      listingContainer.className =
        "container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md m-4";

      const title = document.createElement("h1");
      title.className =
        "listing-title text-xl font-semibold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-2";
      title.textContent = listing.title;

      const seller = document.createElement("h2");
      seller.className =
        "listing-seller text-md font-regular text-[var(--main-blue)] font-['Playfair_Display',serif] mb-4";
      seller.textContent = `Seller: ${listing.seller.name}`;

      const link = document.createElement("a");
      link.href = `/single-listing/index.html?id=${listing.id}?_seller=true`;

      const img = document.createElement("img");
      img.src = listing.media[0].url;
      img.alt = listing.media[0].alt || listing.title || "Listing image";
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
      bids.textContent = `${listing._count.bids} bids`;

      link.appendChild(title);
    //   link.appendChild(seller);
      link.appendChild(img);
      listingContainer.appendChild(link);
      listingsGrid.appendChild(listingContainer);
      listingContainer.appendChild(endsAt);
      listingContainer.appendChild(bids);
    }
  });
}

let allListings = [];

async function handleListingsView() {
  allListings = await auctionApi.getAllListings();
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
