import { AuctionApi } from "../apiClient.js";
import { attachCountdown, detachCountdown } from "../utils/countdown.js";

const auctionApi = new AuctionApi();

// Helper: extract a numeric timestamp from common bid date fields
function getBidTimestamp(bid) {
  if (!bid) return 0;
  const t =
    bid.createdAt ||
    bid.created ||
    bid.created_at ||
    bid.updatedAt ||
    bid.updated ||
    bid.date ||
    null;
  const n = t ? new Date(t).getTime() : 0;
  return Number.isFinite(n) ? n : 0;
}

// Helper: get listing end date (Date or null)
function getListingEndsAt(listing) {
  if (!listing) return null;
  const raw = listing.endsAt || listing.data?.endsAt || listing.ends_at || null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

async function fetchMyBids() {
  const username = localStorage.getItem("name");
  if (!username) {
    console.warn(
      "No username found in localStorage (name); skipping fetchMyBids"
    );
    return;
  }

  try {
    const response = await auctionApi.getBidsByProfile(username);
    const bids = response?.data ?? response;
    if (!Array.isArray(bids) || bids.length === 0) {
      const container = document.querySelector(".my-active-bids");
      if (container) container.innerHTML = "<p>No bids available.</p>";
      return;
    }

    // Filter to only active listings (endsAt in the future)
    const now = Date.now();
    const activeBids = bids.filter((bid) => {
      const listing = bid?.listing ?? bid;
      const ends = getListingEndsAt(listing);
      if (!ends) return false; // no end date -> treat as not active
      return ends.getTime() > now;
    });

    if (activeBids.length === 0) {
      const container = document.querySelector(".my-active-bids");
      if (container) container.innerHTML = "<p>No active bids.</p>";
      return;
    }

    // Deduplicate by listing id, keeping the latest bid per listing
    const byListing = new Map();
    for (const bid of activeBids) {
      const listing = bid?.listing ?? bid;
      const listingId = listing?.id || listing?._id || bid?.listingId || "";
      if (!listingId) continue;
      const existing = byListing.get(listingId);
      if (!existing) {
        byListing.set(listingId, bid);
        continue;
      }
      // compare timestamps, keep the newer
      const existingTs = getBidTimestamp(existing);
      const currentTs = getBidTimestamp(bid);
      if (currentTs >= existingTs) {
        byListing.set(listingId, bid);
      }
    }

    const deduped = Array.from(byListing.values());

    renderActiveCarousel(deduped);
  } catch (error) {
    console.error("Error fetching my bids:", error);
  }
}

function renderActiveCarousel(bids) {
  const container = document.querySelector(".my-active-bids");
  if (!container) return;
  if (!Array.isArray(bids) || bids.length === 0) return;

  // detach any countdowns previously attached to elements inside container
  if (container.querySelectorAll) {
    container.querySelectorAll(".listing-ends-at").forEach((el) => {
      try {
        detachCountdown(el);
      } catch (e) {
        // ignore
      }
    });
  }
  container.innerHTML = "";
  const carouselRoot = container;
  carouselRoot.classList.add(
    "active-carousel",
    "mb-6",
    "profile-active-carousel"
  );

  const wrapper = document.createElement("div");
  wrapper.className = "carousel-wrapper relative";

  const prev = document.createElement("button");
  prev.className = "carousel-btn carousel-prev";
  prev.setAttribute("aria-label", "Previous");
  prev.textContent = "<";

  const next = document.createElement("button");
  next.className = "carousel-btn carousel-next";
  next.setAttribute("aria-label", "Next");
  next.textContent = ">";

  const track = document.createElement("div");
  track.className =
    "carousel-track flex gap-4 overflow-x-auto scroll-smooth py-2";
  track.style.scrollSnapType = "x mandatory";
  // ensure newest bids first (by timestamp)
  const sorted = bids
    .slice()
    .sort((a, b) => getBidTimestamp(b) - getBidTimestamp(a));
  // console.log(sorted);
  sorted.forEach((bid) => {
    // API returns bid objects; the listing may be under bid.listing
    const listing = bid?.listing ?? bid;
    const listingId = listing?.id || listing?._id || bid?.listingId || "";

    const item = document.createElement("div");
    item.className = "carousel-item flex-shrink-0 scroll-snap-align-start";
    item.style.width = "min(380px, 92vw)";
    item.style.boxSizing = "border-box";

    const link = document.createElement("a");
    link.href = listingId
      ? `/single-listing.html?id=${listingId}&_seller=true`
      : "#";

    const imageSrc = listing?.media?.[0]?.url || "/images/GoldenBid-icon.png";
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = listing?.title || "Listing image";
    img.className = "w-full h-48 object-cover mb-2 rounded";

    const title = document.createElement("h3");
    title.className =
      "text-xl font-semibold text-[var(--main-blue)] font-playfair mb-2";
    title.textContent = listing?.title || "Untitled";

    if (img) link.appendChild(img);
    link.appendChild(title);
    item.appendChild(link);

    // footer info: endsAt, total bids, and user's bid
    const footer = document.createElement("div");
    footer.className =
      "listing-bid-footer mt-3 flex items-center justify-between gap-2";

    const endsAt = document.createElement("span");
    endsAt.className = "listing-ends-at text-sm text-red-600";
    const endsDate = listing?.endsAt
      ? new Date(listing.endsAt)
      : listing?.data?.endsAt
      ? new Date(listing.data.endsAt)
      : null;
    attachCountdown(endsAt, endsDate);

    const yourBid = document.createElement("div");
    yourBid.className =
      "listing-latest-bid text-sm text-green-600 font-semibold";
    yourBid.textContent = `Your bid: ${
      bid?.amount ?? bid?.value ?? "N/A"
    } credits`;

    footer.appendChild(endsAt);

    item.appendChild(footer);
    item.appendChild(yourBid);

    track.appendChild(item);
  });

  wrapper.appendChild(prev);
  wrapper.appendChild(track);
  wrapper.appendChild(next);
  carouselRoot.appendChild(wrapper);

  // Scroll by one card width (+ gap)
  function scrollByDirection(direction) {
    const card = track.querySelector(".carousel-item");
    if (!card) return;
    const gap = 16; // matches tailwind gap-4
    const width = Math.round(card.getBoundingClientRect().width + gap);
    track.scrollBy({ left: direction * width, behavior: "smooth" });
  }

  prev.addEventListener("click", () => scrollByDirection(-1));
  next.addEventListener("click", () => scrollByDirection(1));
}

// Run after DOM ready to ensure .my-active-bids exists
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", fetchMyBids);
} else {
  fetchMyBids();
}
