import { AuctionApi } from "../../apiClient.js";

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

function renderSingleListing(listing) {
  // Prefer the page-specific listing container (bidding page), then fallback
  const listingContainer = document.querySelector(".listing-container");

  console.log("Rendering listing:", listing?.data?.id || listing);

  const img = document.createElement("img");
  const mediaUrl =
    listing.data?.media && listing.data.media[0]?.url
      ? listing.data.media[0].url
      : "/src/images/GoldenBid-icon.png";
  const mediaAlt =
    listing.data?.media && listing.data.media[0]?.alt
      ? listing.data.media[0].alt
      : listing.data?.title || "Listing image";
  img.src = mediaUrl;
  img.alt = mediaAlt;
  img.className = "listing-img";

  const title = document.createElement("h1");
  title.textContent = listing.data.title;
  title.className =
    "listing-title text-4xl font-semibold mb-4 font-['Playfair_Display',serif] text-[var(--main-blue)] max-w-full overflow-hidden text-ellipsis";

  const description = document.createElement("p");
  description.textContent = listing.data.description;
  description.className =
    "listing-description text-sm text-[var(--text-color)] font-['Inter',sans-serif] mt-4 border-b-[1px] border-b-[var(--main-gold)] ax-w-full overflow-hidden text-ellipsis";

  const seller = document.createElement("a");
  const sellerName = listing.data?.seller?.name || "Unknown seller";
  seller.textContent = `Seller: ${sellerName}`;
  seller.className =
    "listing-seller text-lg text-[var(--text-color)] font-['Playfair_Display',serif] mt-4";
  seller.href = `/profile/index.html?id=${sellerName}`;

  const bidContainer = document.createElement("div");
  bidContainer.className = "listing-bid-container mt-4";
  // compute current and ends date once and use for button visibility and label
  const now = new Date();
  const endsDate = listing.data?.endsAt ? new Date(listing.data.endsAt) : null;

  // Create a bid form: input for amount and submit button.
  const bidForm = document.createElement("form");
  bidForm.className = "bid-form mt-2 flex items-center gap-2";

  const bidInput = document.createElement("input");
  bidInput.type = "number";
  bidInput.min = "1";
  bidInput.step = "1";
  bidInput.placeholder = "Enter bid amount";
  bidInput.className = "bid-input px-3 py-2 border rounded";

  const bidBtn = document.createElement("button");
  bidBtn.type = "submit";
  bidBtn.className =
    "place-bid-btn px-4 py-2 bg-[var(--main-gold)] text-[var(--main-blue)] rounded font-semibold";
  bidBtn.textContent = "Place bid";

  const msg = document.createElement("div");
  msg.className = "bid-message text-sm mt-2";

  // Determine minimum acceptable bid (1 more than highest bid)
  const bidsData = listing.data?.bids || [];
  const highest = bidsData.length
    ? Math.max(...bidsData.map((b) => Number(b.amount || 0)))
    : 0;
  const minBid = highest + 1 || 1;
  bidInput.placeholder = `Min: ${minBid}`;

  // Hide form if auction ended
  if (!endsDate || endsDate <= now) {
    bidForm.style.display = "none";
  }

  bidForm.appendChild(bidInput);
  bidForm.appendChild(bidBtn);

  bidForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const raw = bidInput.value;
    const amount = Number(raw);
    if (!amount || isNaN(amount) || amount < minBid) {
      msg.textContent = `Please enter a valid bid amount (minimum ${minBid}).`;
      msg.style.color = "red";
      return;
    }

    bidBtn.disabled = true;
    bidBtn.textContent = "Placing...";
    try {
      const id = listing.data?.id || listing.data?.id || "";
      if (!id) throw new Error("Listing id missing");
      await auctionApi.bidOnListing(id, amount);
      msg.textContent = "Bid placed successfully.";
      msg.style.color = "green";
      // Redirect to the bidding index page for this listing
      const listingIdValue = listing.data?.id || listing.data?._id || "";
      if (listingIdValue) {
        window.location.href = `/auth/my-bids/bidding/index.html?id=${listingIdValue}&_seller=true`;
      } else {
        // fallback: reload if id not available
        setTimeout(() => window.location.reload(), 900);
      }
    } catch (err) {
      console.error("Bid error", err);
      msg.textContent = `Failed to place bid: ${err.message || err}`;
      msg.style.color = "red";
      bidBtn.disabled = false;
      bidBtn.textContent = "Place bid";
    }
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
  bids.textContent = `${listing.data?._count?.bids || 0} bids`;

  // Show only last 3 bids by default
  const lastThreeBids = bidsData.slice(-3);

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
  if (bidsData.length > 3) {
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
      bidsData.forEach((bid) => {
        const bidItem = document.createElement("li");
        bidItem.className = "listing-bid-item";
        bidItem.textContent = `Bidder: ${
          bid.bidder?.name || "Unknown bidder"
        } - Bid: ${bid.amount} Credits`;
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
        bidItem.textContent = `Bidder: ${
          bid.bidder?.name || "Unknown bidder"
        } - Bid: ${bid.amount} Credits`;
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
  // Append the bid form and status message (if not hidden by ended auction)
  bidContainer.appendChild(bidForm);
  bidContainer.appendChild(msg);
  listingContainer.appendChild(bidContainer);
}

let singleListing = [];
async function handleSingleListingView() {
  singleListing = await getListingById();
  renderSingleListing(singleListing);
}
handleSingleListingView();
