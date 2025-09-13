import { AuctionApi } from "../apiClient.js";
import { attachCountdown, detachCountdown } from "../utils/countdown.js";
import { renderEndedCarousel } from "./endedListings.js";

const auctionApi = new AuctionApi();

const urlParams = new URLSearchParams(window.location.search);
const sellerName = urlParams.get("id");

function renderActiveCarousel(listings) {
  const listingsGrid = document.querySelector(".user-listings");
  if (!listingsGrid) return;
  if (!Array.isArray(listings) || listings.length === 0) return;

  // Detach any countdowns previously attached to elements inside listingsGrid
  if (listingsGrid.querySelectorAll) {
    listingsGrid.querySelectorAll(".listing-ends-at").forEach((el) => {
      try {
        detachCountdown(el);
      } catch (e) {
        // swallow - defensive
      }
    });
  }

  // Use the existing listingsGrid as the carousel root
  listingsGrid.innerHTML = "";
  const carouselRoot = listingsGrid;
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
  track.className = "carousel-track flex gap-4 overflow-x-auto scroll-smooth";
  track.style.scrollSnapType = "x mandatory";

  listings.forEach((listing) => {
    // Create all nodes first
    const item = document.createElement("div");
    item.className =
      "carousel-item container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md flex-shrink-0 scroll-snap-align-start w-[320px]";
    item.style.width = "min(380px, 92vw)";
    item.style.boxSizing = "border-box";

    const imageSrc =
      listing.media && Array.isArray(listing.media) && listing.media[0]?.url
        ? listing.media[0].url
        : "/images/GoldenBid-icon.png";
    const img = imageSrc
      ? (() => {
          const i = document.createElement("img");
          i.src = imageSrc;
          i.alt =
            listing.media && listing.media[0]?.alt
              ? listing.media[0].alt
              : listing.title || "Listing image";
          i.className = "listing-image h-48 w-full object-cover mb-2 rounded";
          return i;
        })()
      : null;

    const link = document.createElement("a");
    link.href = `/single-listing.html?id=${listing.id}&_seller=true`;

    const title = document.createElement("h1");
    title.className =
      "listing-title text-xl font-semibold text-[var(--main-blue)] font-playfair mb-2";
    title.textContent = listing.title;

    const bidContainer = document.createElement("div");
    bidContainer.className =
      "listing-bid-container mt-4 flex items-center gap-2 justify-between";
    const endsAt = document.createElement("span");
    endsAt.className = "listing-ends-at block mt-2 text-sm text-red-600";
    const endsDate = new Date(listing.endsAt || listing.data?.endsAt || null);
    attachCountdown(endsAt, endsDate);

    const bids = document.createElement("span");
    bids.className =
      "listing-bids font-['Inter',sans-serif] text-sm text-[var(--text-color)]";
    bids.textContent = `${
      listing.data?._count?.bids || listing._count?.bids || 0
    } bids`;

    // assemble in one place
    if (img) link.appendChild(img);
    link.appendChild(title);
    item.appendChild(link);
    bidContainer.appendChild(endsAt);
    bidContainer.appendChild(bids);

    item.appendChild(bidContainer);
    track.appendChild(item);
  });

  wrapper.appendChild(prev);
  wrapper.appendChild(track);
  wrapper.appendChild(next);
  carouselRoot.appendChild(wrapper);

  // Scroll behavior: move by item width + gap
  function scrollBy(direction) {
    const card = track.querySelector(".carousel-item");
    if (!card) return;
    const gap = 16; // match CSS gap
    const width = card.getBoundingClientRect().width + gap;
    track.scrollBy({ left: direction * width, behavior: "smooth" });
  }

  prev.addEventListener("click", () => scrollBy(-1));
  next.addEventListener("click", () => scrollBy(1));
}

let allListings = [];

async function handleListingsView() {
  const result = await auctionApi.getAllListingsByName(sellerName);
  allListings = result.data || result || [];
  if (!Array.isArray(allListings) || allListings.length === 0) {
    const listingsGrid = document.querySelector(".user-listings");
    if (listingsGrid) {
      if (listingsGrid.querySelectorAll) {
        listingsGrid.querySelectorAll(".listing-ends-at").forEach((el) => {
          try {
            detachCountdown(el);
          } catch (e) {
            // ignore
          }
        });
      }
      listingsGrid.innerHTML = "<p>No listings available.</p>";
    }
    return;
  }

  // split into active and ended
  const now = new Date();
  const active = allListings.filter((l) => {
    const ends = l.endsAt
      ? new Date(l.endsAt)
      : l.data?.endsAt
      ? new Date(l.data.endsAt)
      : null;
    return ends && ends > now;
  });
  const ended = allListings.filter((l) => {
    const ends = l.endsAt
      ? new Date(l.endsAt)
      : l.data?.endsAt
      ? new Date(l.data.endsAt)
      : null;
    return !ends || ends <= now;
  });

  if (active.length) renderActiveCarousel(active);
  if (ended.length) renderEndedCarousel(ended);
}

document.addEventListener("DOMContentLoaded", handleListingsView);
