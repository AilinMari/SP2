import { data } from "autoprefixer";
import { AuctionApi } from "../../apiClient";

const auctionApi = new AuctionApi();


const listings = await auctionApi.getListingsByLoggedInUser();


async function fetchAndRenderListings(name) {
  try {
    const listings = await auctionApi.getListingsByLoggedInUser(name);
    renderListings(listings.data);
  } catch (error) {
    console.error("Error fetching listings:", error);
  }
}
fetchAndRenderListings();

console.log("User listings:", listings);

function renderListings(listings) {
  const userListingsContainer = document.querySelector(".user-listings");

  if (!Array.isArray(listings) || listings.length === 0) {
    userListingsContainer.innerHTML =
      "<p class='text-center text-lg text-gray-500 mt-6 mb-20'>No listings yet.</p>";
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
      const listingItem = document.createElement("div");
      listingItem.className =
        "listing-item flex flex-col justify-center items-center rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--card-background)] border-3 border-[var(--main-gold)] shadow-lg min-h-50 min-w-150";

      const listingTitle = document.createElement("h3");
      listingTitle.className = "listing-title text-xl font-bold";
      listingTitle.textContent = `${listing.data.title}` || "Untitled Listing";

      userListingsContainer.appendChild(listingItem);
      listingItem.appendChild(listingTitle);
    }
  });
}

renderListings(listings);
