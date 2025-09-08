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
      "container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md mb-8 max-w-md";

    const title = document.createElement("h1");
    title.className =
      "listing-title text-xl font-semibold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-2";
    title.textContent = listing.title;

    const link = document.createElement("a");
    link.href = `/singleListing.html?id=${listing.id}&_seller=true`;
    link.appendChild(title);
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
      img.className = "listing-image";

      // Optionally add description
      if (listing.description) {
        const desc = document.createElement("p");
        desc.className = "listing-desc text-md text-gray-700 mb-2";
        desc.textContent = listing.description;

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

        link.appendChild(img);
        listingContainer.appendChild(link);
        listingContainer.appendChild(desc);
        listingContainer.appendChild(endsAt);
        listingContainer.appendChild(bids);
        listingsGrid.appendChild(listingContainer);
      }
    }
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
