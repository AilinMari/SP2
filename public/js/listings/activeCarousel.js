import { mountCarousel } from "/js/ui/carousel.js";
import { attachCountdown } from "/js/utils/countdown.js";

// Renders the active listings carousel into a sibling above the listings grid.
export function renderActiveCarousel(listings) {
  const listingsGrid = document.querySelector(".listings-grid");
  if (!listingsGrid) return;

  let carouselRoot = document.querySelector(".active-carousel");
  if (!carouselRoot) {
    carouselRoot = document.createElement("div");
    carouselRoot.className = "active-carousel mb-6";
    listingsGrid.parentNode.insertBefore(carouselRoot, listingsGrid);
  }

  if (!Array.isArray(listings) || listings.length === 0) return;

  // Use mountCarousel with a renderer for each listing
  return mountCarousel(carouselRoot, listings, (listing) => {
    const item = document.createElement("div");
    item.className = "w-[320px]"; // base width, mountCarousel augments classes

    const imageSrc =
      listing.media && Array.isArray(listing.media) && listing.media[0]?.url
        ? listing.media[0].url
        : "/images/GoldenBid-icon.png";
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = listing.title || "Listing image";
    img.className = "w-full h-40 object-cover rounded";

    const title = document.createElement("h3");
    title.className = "mt-2 text-lg font-semibold text-[var(--main-blue)]";
    title.textContent = listing.title;

    const seller = document.createElement("a");
    seller.className = "text-sm text-[var(--main-blue)]";
    seller.textContent = `By ${listing.seller?.name || "Unknown"}`;
    seller.href = `/user-profile.html?id=${listing.seller?.name}`;

    const link = document.createElement("a");
    link.href = `/single-listing.html?id=${listing.id}&_seller=true`;

    const bidContainer = document.createElement("div");
    bidContainer.className = "listing-bids-container mt-2 flex justify-between";

    const latestBid = document.createElement("div");
    latestBid.className = "listing-latest-bid mt-2 text-sm text-green-600";
    let latestBidAmount = 0;
    if (listing.bids && listing.bids.length > 0) {
      const latest = listing.bids.reduce((max, bid) => {
        return new Date(bid.created) > new Date(max.created) ? bid : max;
      }, listing.bids[0]);
      latestBidAmount = latest.amount;
    }
    latestBid.textContent = `Latest bid: $${latestBidAmount}`;

    const endsAt = document.createElement("span");
    endsAt.className = "listing-ends-at block mt-2 text-sm text-red-600";
    const endsDate = listing.endsAt ? new Date(listing.endsAt) : null;
    attachCountdown(endsAt, endsDate);

    const joinBidding = document.createElement("button");
    joinBidding.className =
      "join-bidding mt-2 text-sm bg-[var(--main-gold)] text-[var(--main-blue)] py-1 px-2 rounded font-semibold hover:bg-yellow-500";
    joinBidding.textContent = "Start bidding now";
    joinBidding.addEventListener("click", () => {
      window.location.href = `/bidding.html?id=${listing.id}&_seller=true`;
    });

    link.appendChild(img);
    item.appendChild(link);
    link.appendChild(title);
    item.appendChild(seller);
    item.appendChild(endsAt);
    bidContainer.appendChild(latestBid);
    item.appendChild(bidContainer);
    bidContainer.appendChild(joinBidding);

    return item;
  });
}
