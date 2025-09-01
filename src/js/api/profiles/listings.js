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
      "container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md m-4";

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

// const sellerListings = urlParams.get("name");

// const listings = await auctionApi.getAllListingsByName("name");
// async function fetchAndRenderListings(name) {
//   try {
//     const listings = await auctionApi.getAllListingsByName(name);
//     renderListings(listings.data);
//   } catch (error) {
//     console.error("Error fetching listings:", error);
//   }
// }
// fetchAndRenderListings();

// console.log("Seller listings:", sellerListings);

// function renderListings(listings) {
//   const userListingsContainer = document.querySelector(".user-listings");

//   if (!Array.isArray(listings) || listings.length === 0) {
//     userListingsContainer.innerHTML =
//       "<p class='text-center text-lg text-gray-500 mt-6 mb-20'>No listings yet.</p>";
//     return;
//   }

//   listings.forEach((listing) => {
//     // Only render listings with a valid image URL
//     if (
//       listing.media &&
//       Array.isArray(listing.media) &&
//       listing.media.length > 0 &&
//       listing.media[0].url
//     ) {
//       const listingItem = document.createElement("div");
//       listingItem.className =
//         "listing-item flex flex-col justify-center items-center rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--card-background)] border-3 border-[var(--main-gold)] shadow-lg min-h-50 min-w-150";

//       const listingTitle = document.createElement("h3");
//       listingTitle.className = "listing-title text-xl font-bold";
//       listingTitle.textContent = `${listing.data.title}` || "Untitled Listing";

//       userListingsContainer.appendChild(listingItem);
//       listingItem.appendChild(listingTitle);
//     }
//   });
// }
