import { AuctionApi } from "../apiClient.js";
import { attachCountdown, detachCountdown } from "../utils/countdown.js";

const auctionApi = new AuctionApi();

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

    renderActiveCarousel(bids);
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
  console.log(bids);
  bids.forEach((bid) => {
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
    title.className = "mt-2 text-lg font-semibold text-[var(--main-blue)]";
    title.textContent = listing?.title || "Untitled";

    if (img) link.appendChild(img);
    link.appendChild(title);
    item.appendChild(link);

    if (listing?.description) {
      const d = document.createElement("p");
      d.className = "listing-desc text-md text-gray-700 mb-2";
      d.textContent = listing.description;
      item.appendChild(d);
    }

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
