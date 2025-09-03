import { AuctionApi } from "../apiClient";

const auctionApi = new AuctionApi();

const urlParams = new URLSearchParams(window.location.search);

const listingId = urlParams.get("id");
const bids = urlParams.get("bids");
const seller = urlParams.get("seller");
console.log("seller:", seller);

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
  const mediaUrl =
    listingId.data?.media && listingId.data.media[0]?.url
      ? listingId.data.media[0].url
      : "/src/images/GoldenBid-icon.png";
  const mediaAlt =
    listingId.data?.media && listingId.data.media[0]?.alt
      ? listingId.data.media[0].alt
      : listingId.data?.title || "Listing image";
  img.src = mediaUrl;
  img.alt = mediaAlt;
  img.className = "listing-img";

  const title = document.createElement("h1");
  title.textContent = listingId.data.title;
  title.className =
    "listing-title text-4xl font-semibold mb-4 font-['Playfair_Display',serif] text-[var(--main-blue)] max-w-full overflow-hidden text-ellipsis";

  const description = document.createElement("p");
  description.textContent = listingId.data.description;
  description.className =
    "listing-description text-sm text-[var(--text-color)] font-['Inter',sans-serif] mt-4 border-b-[1px] border-b-[var(--main-gold)] ax-w-full overflow-hidden text-ellipsis";

  const seller = document.createElement("a");
  const sellerName = listingId.data?.seller?.name || "Unknown seller";
  seller.textContent = `Seller: ${sellerName}`;
  seller.className =
    "listing-seller text-lg text-[var(--text-color)] font-['Playfair_Display',serif] mt-4";
  seller.href = `/profile/index.html?id=${sellerName}`;

  const bidContainer = document.createElement("div");
  bidContainer.className = "listing-bid-container mt-4";
  // compute current and ends date once and use for button visibility and label
  const now = new Date();
  const endsDate = listingId.data?.endsAt
    ? new Date(listingId.data.endsAt)
    : null;

  const joinBidding = document.createElement("button");
  joinBidding.className =
    "join-bidding mt-2 px-4 py-2 bg-[var(--main-gold)] text-[var(--main-blue)] hover:bg-yellow-500 rounded font-semibold font-([inter, sans-serif]) float-right";
  joinBidding.textContent = "Start bidding now";
  // Hide the join button when auction has ended
  if (!endsDate || endsDate <= now) {
    joinBidding.style.display = "none";
  }

  joinBidding.addEventListener("click", () => {
    // Use the actual listing id when navigating
    const id = listingId.data?.id || listingId.data?._id || "";
    if (!id) return;
    window.location.href = `/auth/my-bids/bidding/index.html?id=${id}&_seller=true`;
  });

  const endsAt = document.createElement("span");
  endsAt.className = "listing-ends-at block mt-2 text-sm text-red-600";
  if (!endsDate || endsDate <= now) {
    endsAt.textContent = "Auction ended";
  } else {
    endsAt.textContent = `Ends at: ${endsDate.toLocaleString()}`;
  }

  const bids = document.createElement("span");
  bids.className =
    "listing-bids font-['Inter',sans-serif] text-sm text-[var(--text-color)]";
  bids.textContent = `${listingId.data?._count?.bids || 0} bids`;

  // Show only last 3 bids by default
  const allBids = listingId.data?.bids || [];
  const lastThreeBids = allBids.slice(-3);

  const bidsList = document.createElement("ul");
  bidsList.className = "listing-bids-list";
  lastThreeBids.forEach((bid) => {
    const bidItem = document.createElement("li");
    bidItem.className = "listing-bid-item";
    const bidderName = bid?.bidder?.name || "Unknown bidder";
    bidItem.textContent = `Bidder: ${bidderName} - Bid: ${bid.amount} Credits`;
    bidsList.appendChild(bidItem);
  });

  // Add 'See older bids' button if there are more than 3 bids
  let seeOlderBtn = null;
  let hideOlderBtn = null;
  if (allBids.length > 3) {
    seeOlderBtn = document.createElement("button");
    seeOlderBtn.textContent = "See older bids";
    seeOlderBtn.className =
      "see-older-bids-btn mt-2 px-4 py-2 bg-[var(--main-gold)] text-[var(--main-blue)] rounded hover:bg-yellow-500 font-([inter, sans-serif])";

    hideOlderBtn = document.createElement("button");
    hideOlderBtn.textContent = "Hide older bids";
    hideOlderBtn.className =
      "hide-older-bids-btn mt-2 px-4 py-2 bg-[var(--main-blue)] text-[var(--main-gold)] rounded hover:bg-blue-700 font-([inter, sans-serif])";
    hideOlderBtn.style.display = "none";

    seeOlderBtn.addEventListener("click", () => {
      // Show all bids
      bidsList.innerHTML = "";
      allBids.forEach((bid) => {
        const bidItem = document.createElement("li");
        bidItem.className = "listing-bid-item";
        const bidDate = new Date(bid.created);
        bidItem.textContent = `Bidder: ${bid.bidder.name} - Bid: ${bid.amount} Credits`;
        bidsList.appendChild(bidItem);
      });
      seeOlderBtn.style.display = "none";
      hideOlderBtn.style.display = "inline-block";
    });

    hideOlderBtn.addEventListener("click", () => {
      // Show only last 3 bids
      bidsList.innerHTML = "";
      lastThreeBids.forEach((bid) => {
        const bidItem = document.createElement("li");
        bidItem.className = "listing-bid-item";
        const bidDate = new Date(bid.created);
        bidItem.textContent = `Bidder: ${bid.bidder.name} - Bid: ${bid.amount} Credits`;
        bidsList.appendChild(bidItem);
      });
      hideOlderBtn.style.display = "none";
      seeOlderBtn.style.display = "inline-block";
    });
  }

  listingContainer.appendChild(title);
  listingContainer.appendChild(seller);
  listingContainer.appendChild(img);
  listingContainer.appendChild(description);
  bidContainer.appendChild(bids);
  bidContainer.appendChild(endsAt);
  bidContainer.appendChild(bidsList);
  if (seeOlderBtn) bidContainer.appendChild(seeOlderBtn);
  if (hideOlderBtn) bidContainer.appendChild(hideOlderBtn);
  bidContainer.appendChild(joinBidding);
  listingContainer.appendChild(bidContainer);
}

let singleListing = [];
async function handleSingleListingView() {
  singleListing = await getListingById();
  renderSingleListing(singleListing);
}
handleSingleListingView();
