import { AuctionApi } from "../apiClient.js";
import { attachCountdown, detachCountdown } from "../utils/countdown.js";
import { mountCarousel } from "/js/ui/carousel.js";

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

  // Render media: if multiple media entries exist, mount a small carousel
  const mediaArr = listingId.data?.media || [];
  let mediaRoot = null;
  if (Array.isArray(mediaArr) && mediaArr.length > 1) {
    mediaRoot = document.createElement("div");
    mediaRoot.className = "single-media-carousel mt-4";

    // Use mountCarousel to display each media item; make items full-width
    mountCarousel(
      mediaRoot,
      mediaArr,
      (m) => {
        const item = document.createElement("div");
        item.className = "single-media-item";
        const im = document.createElement("img");
        im.src = m?.url || "/images/GoldenBid-icon.png";
        im.alt = m?.alt || listingId.data?.title || "Listing image";
        im.style.width = "100%";
        im.style.height = "auto";
        im.className = "object-cover rounded";
        item.appendChild(im);
        return item;
      },
      { itemWidth: "100%", gap: 8 }
    );
  } else {
    const img = document.createElement("img");
    const mediaUrl =
      mediaArr && mediaArr[0]?.url
        ? mediaArr[0].url
        : "/images/GoldenBid-icon.png";
    const mediaAlt =
      mediaArr && mediaArr[0]?.alt
        ? mediaArr[0].alt
        : listingId.data?.title || "Listing image";
    img.src = mediaUrl;
    img.alt = mediaAlt;
    img.className = "listing-img mt-4";
    mediaRoot = img;
  }

  const title = document.createElement("h1");
  title.textContent = listingId.data.title;
  title.className =
    "listing-title text-4xl mt-4 font-semibold font-playfair text-[var(--main-blue)] max-w-full overflow-hidden text-ellipsis";

  const description = document.createElement("p");
  description.textContent = listingId.data.description;
  description.className =
    "listing-description text-sm text-[var(--text-color)] font-['Inter',sans-serif] mt-4 border-b-[1px] border-b-[var(--main-gold)] ax-w-full overflow-hidden text-ellipsis";

  const seller = document.createElement("a");
  const sellerName = listingId.data?.seller?.name || "Unknown seller";
  seller.textContent = `By ${sellerName}`;
  seller.className =
    "listing-seller text-md text-[var(--main-blue)] font-playfair";
  seller.href = `/user-profile.html?id=${sellerName}`;

  const bidContainer = document.createElement("div");
  bidContainer.className = "listing-bid-container mb-4 mt-4";
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
    const id = listingId.data?.id || listingId.data?._id || "";
    if (!id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      // Preserve return path so user lands back on bids after login
      const returnUrl = encodeURIComponent(
        `/bidding.html?id=${id}&_seller=true`
      );
      window.location.href = `/login.html?return=${returnUrl}`;
      return;
    }
    window.location.href = `/bidding.html?id=${id}&_seller=true`;
  });

  const endsAt = document.createElement("span");
  endsAt.className = "listing-ends-at block mt-2 text-sm text-red-600";
  // Attach live countdown
  attachCountdown(endsAt, endsDate);

  const bidsSpan = document.createElement("span");
  bidsSpan.className =
    "listing-bids font-['Inter',sans-serif] text-sm text-[var(--text-color)]";
  bidsSpan.textContent = `${listingId.data?._count?.bids || 0} bids`;

  // Prepare bids: sort by amount desc, then by most recent
  const allBids = listingId.data?.bids || [];
  const sortedBids = allBids.slice().sort((a, b) => {
    const amountDiff = (b.amount || 0) - (a.amount || 0);
    if (amountDiff !== 0) return amountDiff;
    const dateA = a.created ? new Date(a.created).getTime() : 0;
    const dateB = b.created ? new Date(b.created).getTime() : 0;
    return dateB - dateA;
  });
  // Show top 3 highest bids by default
  const lastThreeBids = sortedBids.slice(0, 3);

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
      // Show all bids in sorted order (highest -> lowest)
      // detach countdowns inside bidsList before clearing
      if (bidsList.querySelectorAll) {
        bidsList.querySelectorAll(".listing-ends-at").forEach((el) => {
          try {
            detachCountdown(el);
          } catch (e) {
            // ignore
          }
        });
      }
      bidsList.innerHTML = "";
      sortedBids.forEach((bid) => {
        const bidItem = document.createElement("li");
        bidItem.className = "listing-bid-item";
        const bidderName = bid?.bidder?.name || "Unknown bidder";
        bidItem.textContent = `Bidder: ${bidderName} - Bid: ${bid.amount} Credits`;
        bidsList.appendChild(bidItem);
      });
      seeOlderBtn.style.display = "none";
      hideOlderBtn.style.display = "inline-block";
    });

    hideOlderBtn.addEventListener("click", () => {
      // Revert to top 3 bids
      // detach countdowns inside bidsList before clearing
      if (bidsList.querySelectorAll) {
        bidsList.querySelectorAll(".listing-ends-at").forEach((el) => {
          try {
            detachCountdown(el);
          } catch (e) {
            // ignore
          }
        });
      }
      bidsList.innerHTML = "";
      lastThreeBids.forEach((bid) => {
        const bidItem = document.createElement("li");
        bidItem.className = "listing-bid-item";
        const bidderName = bid?.bidder?.name || "Unknown bidder";
        bidItem.textContent = `Bidder: ${bidderName} - Bid: ${bid.amount} Credits`;
        bidsList.appendChild(bidItem);
      });
      hideOlderBtn.style.display = "none";
      seeOlderBtn.style.display = "inline-block";
    });
  }

  listingContainer.appendChild(title);
  listingContainer.appendChild(seller);
  if (mediaRoot) listingContainer.appendChild(mediaRoot);
  listingContainer.appendChild(description);
  bidContainer.appendChild(bidsSpan);
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
