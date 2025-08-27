import { AuctionApi } from "../apiClient";

const auctionApi = new AuctionApi();

const urlParams = new URLSearchParams(window.location.search);

const listingId = urlParams.get("id");

async function getListingById() {
  try {
    let listing = await auctionApi.getListingById(listingId);
    return listing;
  } catch (error) {
    console.error("Error fetching listing", error);
  }
}

function renderSingleListing(listingId) {
  const listingContainer = document.querySelector(".single-listing-container");

  console.log("Fetching listing with ID:", listingId);

  const img = document.createElement("img");
  img.src = listingId.data.media[0].url;
  img.alt = listingId.data.media[0].alt;
  img.className = "listing-img";

  const title = document.createElement("h1");
  title.textContent = listingId.data.title;
  title.className =
    "listing-title text-4xl font-semibold mb-4 font-['Playfair_Display',serif] text-[var(--main-blue)]";

  const description = document.createElement("p");
  description.textContent = listingId.data.description;
  description.className =
    "listing-description text-sm text-[var(--text-color)] font-['Inter',sans-serif] mt-4 border-b-[1px] border-b-[var(--main-gold)]";

  const seller = document.createElement("p");
  seller.textContent = `Seller: ${listingId.data.seller.name}`;
  seller.className =
    "listing-seller text-lg text-[var(--text-color)] font-['Playfair_Display',serif] mt-4";

  const bidContainer = document.createElement("div");
  bidContainer.className = "listing-bid-container mt-4";

  const endsAt = document.createElement("span");
  endsAt.className = "listing-ends-at block mt-2 text-sm text-red-600";
  const now = new Date();
  const endsDate = new Date(listingId.data.endsAt);
  if (endsDate <= now) {
    endsAt.textContent = "Auction ended";
  } else {
    endsAt.textContent = `Ends at: ${endsDate.toLocaleString()}`;
  }

  const bids = document.createElement("span");
  bids.className = "listing-bids font-['Inter',sans-serif] text-sm text-[var(--text-color)]";
  bids.textContent = `${listingId.data._count.bids} bids`;

  listingContainer.appendChild(title);
  listingContainer.appendChild(seller);
  listingContainer.appendChild(img);
  listingContainer.appendChild(description);
  bidContainer.appendChild(bids);
  bidContainer.appendChild(endsAt);
  listingContainer.appendChild(bidContainer);
}

let singleListing = [];
async function handleSingleListingView() {
  singleListing = await getListingById();
  renderSingleListing(singleListing);
}
handleSingleListingView();
