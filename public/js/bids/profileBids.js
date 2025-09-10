import { AuctionApi } from "../apiClient.js";

const auctionApi = new AuctionApi();
const token = localStorage.getItem("token");

async function fetchMyBids() {
  if (!token) {
    console.warn("No token found; skipping fetchMyBids");
    return;
  }

  const username = localStorage.getItem("name");
  if (!username) {
    console.warn(
      "No username found in localStorage (name); skipping fetchMyBids"
    );
    return;
  }

  try {
    const response = await auctionApi.getBidsByProfile(username);
    // API may return { data: [...] } or the array directly
    const bids = response?.data ?? response;
    if (!Array.isArray(bids) || bids.length === 0) {
      console.log("No bids to render");
      return;
    }

    renderActiveCarousel(bids);
  } catch (error) {
    console.error("Error fetching my bids:", error);
  }
}

function renderActiveCarousel(bids) {
  const container = document.querySelector(".my-active-bids");
  if (!container) {
    console.warn(
      "No .my-active-bids container found in DOM. Bids will not be rendered."
    );
    return;
  }

  if (!Array.isArray(bids) || bids.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = "";

  const carouselRoot = document.createElement("div");
  carouselRoot.className = "active-carousel mb-6 profile-active-carousel";

  const wrapper = document.createElement("div");
  wrapper.className = "carousel-wrapper relative";

  const prev = document.createElement("button");
  prev.className =
    "carousel-btn carousel-prev absolute left-2 top-1/2 -translate-y-1/2 z-10";
  prev.setAttribute("aria-label", "Previous");
  prev.textContent = "<";

  const next = document.createElement("button");
  next.className =
    "carousel-btn carousel-next absolute right-2 top-1/2 -translate-y-1/2 z-10";
  next.setAttribute("aria-label", "Next");
  next.textContent = ">";

  const track = document.createElement("div");
  track.className =
    "carousel-track flex gap-4 overflow-x-auto scroll-smooth py-2";
  track.style.scrollSnapType = "x mandatory";

  bids.forEach((bid) => {
    const item = document.createElement("div");
    item.className =
      "carousel-item flex-shrink-0 scroll-snap-align-start w-[320px]";

    const listingId =
      bid?.listing?.id || bid?.listing?._id || bid?.listingId || "";
    const link = document.createElement("a");
    link.href = listingId
      ? `/single-Listing.html?id=${listingId}&_seller=true`
      : "#";

    const imageSrc =
      bid?.listing?.media?.[0]?.url || "/src/images/GoldenBid-icon.png";
    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = bid?.listing?.title || "Listing image";
    img.className = "w-full h-40 object-cover rounded";

    const title = document.createElement("h3");
    title.className = "mt-2 text-lg font-semibold text-[var(--main-blue)]";
    title.textContent = bid?.listing?.title || "Untitled";

    const bidInfo = document.createElement("div");
    bidInfo.className =
      "listing-bids-container mt-2 flex justify-between items-center";

    const latestBid = document.createElement("div");
    latestBid.className = "listing-latest-bid mt-2 text-sm text-green-600";
    latestBid.textContent = `Your bid: ${bid?.amount ?? bid?.value ?? "N/A"}`;

    bidInfo.appendChild(latestBid);

    link.appendChild(img);
    link.appendChild(title);
    item.appendChild(link);
    item.appendChild(bidInfo);

    track.appendChild(item);
  });

  wrapper.appendChild(prev);
  wrapper.appendChild(track);
  wrapper.appendChild(next);
  carouselRoot.appendChild(wrapper);
  container.appendChild(carouselRoot);

  // Scroll by one card width (+ gap)
  function scrollByDirection(direction) {
    const card = track.querySelector(".carousel-item");
    if (!card) return;
    const gap = 16; // matches tailwind gap-4 (4 * 4px)
    const width = Math.round(card.getBoundingClientRect().width + gap);
    track.scrollBy({ left: direction * width, behavior: "smooth" });
  }

  prev.addEventListener("click", () => scrollByDirection(-1));
  next.addEventListener("click", () => scrollByDirection(1));

  console.log("Rendered bids carousel with", bids.length, "cards");
}

// Run after DOM ready to ensure .my-active-bids exists
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", fetchMyBids);
} else {
  fetchMyBids();
}
