import { formatDateShort } from "../utils/date.js";

export function renderEndedCarousel(listings) {
  if (!Array.isArray(listings) || listings.length === 0) return;

  const listingsGrid = document.querySelector(".user-listings");
  if (!listingsGrid) return;

  let endedRoot = document.querySelector(".ended-carousel");
  if (!endedRoot) {
    endedRoot = document.createElement("div");
    endedRoot.className = "ended-carousel mb-6 profile-ended-carousel";
    listingsGrid.parentNode.insertBefore(endedRoot, listingsGrid.nextSibling);
  } else {
    endedRoot.innerHTML = "";
  }

    const carouselName = document.createElement("h2");
  carouselName.className =
    "carousel-title text-2xl font-bold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-4";
  carouselName.textContent = "My ended Listings";
  endedRoot.appendChild(carouselName);

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
      "carousel-item container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md flex-shrink-0 scroll-snap-align-start";
    item.style.width = "min(380px, 92vw)";

    const imageSrc =
      listing.media && Array.isArray(listing.media) && listing.media[0]?.url
        ? listing.media[0].url
        : "/images/GoldenBid-icon.png";
    if (imageSrc) {
      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt =
        listing.media && listing.media[0]?.alt
          ? listing.media[0].alt
          : listing.title || "Listing image";
      img.className = "listing-image h-40 w-full object-cover mb-2 rounded";
      item.appendChild(img);
    }

    const link = document.createElement("a");
    link.href = `/single-listing.html?id=${listing.id}&_seller=true`;

    const title = document.createElement("h3");
    title.className = "mt-2 text-lg font-semibold text-[var(--main-blue)]";
    title.textContent = listing.title || "Untitled";
    link.appendChild(title);
    item.appendChild(link);

    const endedAt = document.createElement("div");
    endedAt.className = "text-sm text-gray-600 mt-2";
    const ends = listing.endsAt
      ? new Date(listing.endsAt)
      : listing.data?.endsAt
      ? new Date(listing.data.endsAt)
      : null;
    endedAt.textContent = ends ? `Ended: ${formatDateShort(ends)}` : "Ended";
    item.appendChild(endedAt);

    track.appendChild(item);
  });

  wrapper.appendChild(prev);
  wrapper.appendChild(track);
  wrapper.appendChild(next);
  endedRoot.appendChild(wrapper);

  function scrollBy(direction) {
    const card = track.querySelector(".carousel-item");
    if (!card) return;
    const gap = 16;
    const width = card.getBoundingClientRect().width + gap;
    track.scrollBy({ left: direction * width, behavior: "smooth" });
  }

  prev.addEventListener("click", () => scrollBy(-1));
  next.addEventListener("click", () => scrollBy(1));
}
