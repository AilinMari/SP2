import { AuctionApi } from "../apiClient";
import { filterListings } from "./filtering.js";

const auctionApi = new AuctionApi();

function renderAllListings(listings) {
  const listingsGrid = document.querySelector(".listings-grid");
  if (!listingsGrid) {
    console.error("Listings grid not found");
    return;
  }
  listingsGrid.innerHTML = ""; // Clear existing listings

  if (!Array.isArray(listings) || listings.length === 0) {
    listingsGrid.innerHTML = "<p>No listings available.</p>";
    return;
  }

  console.log("Rendering listings:", listings);

  listings.forEach((listing) => {
    // Render all listings. If no media is present, use a placeholder image.
    const imageSrc =
      listing.media && Array.isArray(listing.media) && listing.media[0]?.url
        ? listing.media[0].url
        : "/src/images/GoldenBid-icon.png"; // fallback placeholder
    const imageAlt =
      listing.media && listing.media[0]?.alt
        ? listing.media[0].alt
        : listing.title || "Listing image";

    // Proceed to render the listing
    const listingContainer = document.createElement("div");
    listingContainer.className =
      "container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md mb-8 max-w-md";

    const title = document.createElement("h1");
    title.className =
      "listing-title text-xl font-semibold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-2 max-w-full overflow-hidden text-ellipsis";
    title.textContent = listing.title;

    const seller = document.createElement("a");
    seller.className =
      "listing-seller text-md font-regular text-[var(--main-blue)] font-['Playfair_Display',serif]";
    seller.textContent = `Seller: ${listing.seller?.name || "Unknown"}`;
    seller.href = `/profile/index.html?id=${listing.seller?.name || ""}`;

    const link = document.createElement("a");
    // fix query string: id=...&_seller=true
    link.href = `/single-listing/index.html?id=${listing.id}&_seller=true`;

    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = imageAlt;
    img.className = "listing-image mt-4";

    const endsAt = document.createElement("span");
    endsAt.className = "listing-ends-at block mt-2 text-sm text-red-600";
    const now = new Date();
    const endsDate = listing.endsAt ? new Date(listing.endsAt) : null;
    if (!endsDate || endsDate <= now) {
      endsAt.textContent = "Auction ended";
    } else {
      endsAt.textContent = `Ends at: ${endsDate.toLocaleString()}`;
    }

    const bids = document.createElement("span");
    bids.className = "listing-bids";
    bids.textContent = `${listing._count?.bids || 0} bids`;

    link.appendChild(title);
    link.appendChild(seller);
    link.appendChild(img);
    listingContainer.appendChild(link);
    listingsGrid.appendChild(listingContainer);
    listingContainer.appendChild(endsAt);
    listingContainer.appendChild(bids);
  });
}

function renderActiveCarousel(listings) {
  // Ensure there's a place to render the carousel above the listings grid
  const listingsGrid = document.querySelector(".listings-grid");
  if (!listingsGrid) return;

  // Find or create container
  let carouselRoot = document.querySelector(".active-carousel");
  if (!carouselRoot) {
    carouselRoot = document.createElement("div");
    carouselRoot.className = "active-carousel mb-6";
    listingsGrid.parentNode.insertBefore(carouselRoot, listingsGrid);
  }
  carouselRoot.innerHTML = "";

  if (!Array.isArray(listings) || listings.length === 0) {
    return; // nothing to show
  }

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
    const item = document.createElement("div");
    item.className =
      "carousel-item flex-shrink-0 scroll-snap-align-start w-[320px]";

    const imageSrc =
      listing.media && Array.isArray(listing.media) && listing.media[0]?.url
        ? listing.media[0].url
        : "/src/images/GoldenBid-icon.png";
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = listing.title || "Listing image";
    img.className = "w-full h-40 object-cover rounded";

    const title = document.createElement("h3");
    title.className = "mt-2 text-lg font-semibold text-[var(--main-blue)]";
    title.textContent = listing.title;

    const seller = document.createElement("div");
    seller.className = "text-sm text-[var(--main-blue)]";
    seller.textContent = `Seller: ${listing.seller?.name || "Unknown"}`;

    const link = document.createElement("a");
    link.href = `/single-listing/index.html?id=${listing.id}&_seller=true`;

    const latestBid = document.createElement("div");
    latestBid.className = "listing-latest-bid mt-2 text-sm text-green-600";
    latestBid.textContent = `Latest bid: $${listing.bids ? listing.bids[0].amount : 0}`;

    link.appendChild(img);

    item.appendChild(link);
    item.appendChild(title);
    item.appendChild(seller);
    item.appendChild(latestBid);
    track.appendChild(item);
  });

  wrapper.appendChild(prev);
  wrapper.appendChild(track);
  wrapper.appendChild(next);
  carouselRoot.appendChild(wrapper);

  // Scroll behavior: move by item width
  function scrollBy(direction) {
    const card = track.querySelector(".carousel-item");
    if (!card) return;
    const width = card.getBoundingClientRect().width + 16; // include gap
    track.scrollBy({ left: direction * width, behavior: "smooth" });
  }

  prev.addEventListener("click", () => scrollBy(-1));
  next.addEventListener("click", () => scrollBy(1));
}

let allListings = [];

async function handleListingsView() {
  allListings = await auctionApi.getAllListings();
  if (!Array.isArray(allListings)) allListings = [];
  // Default: show active listings (endsAt in future) first
  const now = new Date();
  // Partition: active listings (endsAt in future) vs others
  const active = [];
  const others = [];
  allListings.forEach((l) => {
    const ends = l.endsAt ? new Date(l.endsAt) : null;
    if (ends && ends > now) active.push(l);
    else others.push(l);
  });

  // Render active carousel first (if any), then the other listings in the grid
  if (active.length) renderActiveCarousel(active);
  renderAllListings(others.length ? others : active);
}

handleListingsView();

// Filtering UI logic
document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const statusFilter = document.getElementById("status-filter");
  const sortFilter = document.getElementById("sort-filter");

  function sortListings(listings, sortType) {
    let sorted = [...listings];
    switch (sortType) {
      case "newest":
        sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.created) - new Date(b.created));
        break;
      case "most-bids":
        sorted.sort((a, b) => (b._count?.bids || 0) - (a._count?.bids || 0));
        break;
      case "least-bids":
        sorted.sort((a, b) => (a._count?.bids || 0) - (b._count?.bids || 0));
        break;
      default:
        break;
    }
    return sorted;
  }

  function applyFilters() {
    const search = searchBar ? searchBar.value : "";
    const status = statusFilter ? statusFilter.value : "all";
    const sortType = sortFilter ? sortFilter.value : "newest";
    let filtered = filterListings(allListings, { search, status });
    filtered = sortListings(filtered, sortType);
    renderAllListings(filtered);
  }

  if (searchBar) {
    searchBar.addEventListener("input", applyFilters);
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }
  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }
});
