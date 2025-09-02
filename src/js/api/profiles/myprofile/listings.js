import { data } from "autoprefixer";
import { AuctionApi } from "../../apiClient";

const auctionApi = new AuctionApi();

const username = localStorage.getItem("name"); // Get the username from local storage

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
      "container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md";

    const title = document.createElement("h1");
    title.className =
      "listing-title text-xl font-semibold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-2";
    title.textContent = listing.title;

    const link = document.createElement("a");
    link.href = `/single-listing/index.html?id=${listing.id}?_seller=true`;

    const bidContainer = document.createElement("div");
    bidContainer.className = "listing-bid-container mt-4";

    const updateBtn = document.createElement("button");
    updateBtn.className = "listing-update-btn cursor-pointer border-3 border-[var(--main-gold)] shadow-lg z-10 px-2 py-1 rounded-md font-['Playfair_Display',serif] text-sm bg-[var(--main-blue)] text-[var(--main-gold)] flex float-right";
    updateBtn.textContent = "Update Listing";
    updateBtn.addEventListener("click", () => {
      window.location.href = `/auth/listings/update/index.html?id=${listing.id}`;
      // Handle update listing logic
    });

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
    bids.className =
      "listing-bids font-['Inter',sans-serif] text-sm text-[var(--text-color)]";
    bids.textContent = `${listing.data?._count?.bids || 0} bids`;

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
    bidContainer.appendChild(endsAt);
    bidContainer.appendChild(bids);
    bidContainer.appendChild(updateBtn);
    listingContainer.appendChild(bidContainer);
    listingsGrid.appendChild(listingContainer);
  });
}

let allListings = [];

async function handleListingsView() {
  const result = await auctionApi.getListingsByLoggedInUser(username);
  // If API returns {data: [...]}, use result.data
  allListings = result.data || result;
  renderAllListings(allListings);
}

document.addEventListener("DOMContentLoaded", handleListingsView);
