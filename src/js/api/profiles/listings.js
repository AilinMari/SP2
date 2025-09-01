import { data } from "autoprefixer";
import { AuctionApi } from "../apiClient";

const auctionApi = new AuctionApi();

const urlParams = new URLSearchParams(window.location.search);
const sellerName = urlParams.get("id");

function renderAllListings(listings) {
  const listingsGrid = document.querySelector(".user-listings");
  if (!listingsGrid) {
    console.error("Listings grid not found");
    return;
  }
  listingsGrid.innerHTML = ""; // Clear existing listings
  console.log("Rendering listings:", listings);

  if (!Array.isArray(listings) || listings.length === 0) {
    listingsGrid.innerHTML = "<p>No listings available.</p>";
    return;
  }

  listings.forEach((listing) => {
    const listingContainer = document.createElement("div");
    listingContainer.className =
      "container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md mb-8";

    const title = document.createElement("h1");
    title.className =
      "listing-title text-xl font-semibold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-2";
    title.textContent = listing.title;

    const link = document.createElement("a");
    link.href = `/single-listing/index.html?id=${listing.id}?_seller=true`;

    // Render image if available
    if (
      listing.media &&
      Array.isArray(listing.media) &&
      listing.media.length > 0 &&
      listing.media[0].url
    ) {
      const img = document.createElement("img");
      img.src = listing.media[0].url;
      img.alt = listing.media[0].alt || listing.title || "Listing image";
      img.className = "listing-image h-48 w-full object-cover mb-2";
      link.appendChild(img);
    }

    link.appendChild(title);
    listingContainer.appendChild(link);

    // Optionally add description
    if (listing.description) {
      const desc = document.createElement("p");
      desc.className = "listing-desc text-md text-gray-700 mb-2";
      desc.textContent = listing.description;
      listingContainer.appendChild(desc);
    }

    listingsGrid.appendChild(listingContainer);
  });
}

let allListings = [];

async function handleListingsView() {
  const result = await auctionApi.getAllListingsByName(sellerName);
  // If API returns {data: [...]}, use result.data
  allListings = result.data || result;
  renderAllListings(allListings);
}

document.addEventListener("DOMContentLoaded", handleListingsView);

