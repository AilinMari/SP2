import { formatDateShort } from "../utils/date.js";
import { mountCarousel } from "../ui/carousel.js";

// Fresh, from-scratch ended listings carousel.
// This mounts into the HTML element with class `.my-ended-listings` (keeps heading)
export function renderEndedCarousels(listings) {
  if (!Array.isArray(listings)) return;

  const now = new Date();
  const ended = listings.filter((l) => {
    const ends = l.endsAt
      ? new Date(l.endsAt)
      : l.data?.endsAt
      ? new Date(l.data.endsAt)
      : null;
    return ends && ends <= now;
  });

  const host = document.querySelector(".my-ended-listings");
  if (!host) return;

  // Clear host area first
  host.innerHTML = "";
  host.className = "active-carousel mb-6 profile-active-carousel";

  if (!ended.length) {
    // nothing to show
    return;
  }

  // Add heading like other carousels
  const heading = document.createElement("h2");
  heading.className =
    "carousel-title text-2xl font-bold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-4";
  heading.textContent = "My ended Listings";
  host.appendChild(heading);

  // Create a container that mountCarousel will populate (so heading stays)
  const carouselHost = document.createElement("div");
  host.appendChild(carouselHost);

  const carousel = mountCarousel(
    carouselHost,
    ended,
    (listing) => {
      const item = document.createElement("div");
      item.className =
        "container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md";
      // enforce card width so track overflows horizontally like other carousels
      item.style.minWidth = "320px";
      item.style.width = "min(380px, 92vw)";
      item.style.boxSizing = "border-box";
      item.style.flex = "0 0 auto";

      const imageSrc = listing?.media?.[0]?.url || "/images/GoldenBid-icon.png";
      if (imageSrc) {
        const img = document.createElement("img");
        img.src = imageSrc;
        img.alt = listing?.title || "Listing image";
        img.className = "listing-image h-40 w-full object-cover mb-2 rounded";
        item.appendChild(img);
      }

      const link = document.createElement("a");
      const id = listing?.id || listing?._id || "";
      link.href = id ? `/single-listing.html?id=${id}&_seller=true` : "#";

      const titleEl = document.createElement("h3");
      titleEl.className = "mt-2 text-lg font-semibold text-[var(--main-blue)]";
      titleEl.textContent = listing?.title || "Untitled";
      link.appendChild(titleEl);
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

      return item;
    },
    { itemWidth: "min(380px, 92vw)", gap: 16 }
  );

  // Defensive: ensure track doesn't wrap
  try {
    const track = carouselHost.querySelector(".carousel-track");
    if (track) {
      track.style.flexWrap = "nowrap";
      track.style.whiteSpace = "nowrap";
      track.style.alignItems = "flex-start";
    }
  } catch (e) {
    // ignore
  }

  return carousel;
}

// import { formatDateShort } from "../utils/date.js";
// import { mountCarousel } from "../ui/carousel.js";

// // Render ended listings as a carousel using the shared mountCarousel utility
// export function renderEndedCarousels(listings) {
//   if (!Array.isArray(listings)) return;
//   const now = new Date();
//   const ended = listings.filter((l) => {
//     const ends = l.endsAt
//       ? new Date(l.endsAt)
//       : l.data?.endsAt
//       ? new Date(l.data.endsAt)
//       : null;
//     return ends && ends <= now;
//   });

//   const listingsGrid = document.querySelector(".my-ended-listings");
//   if (!listingsGrid) return;

//   // create or reuse container host (mountCarousel will clear the inner host)
//   let host = listingsGrid.parentNode.querySelector(".ended-carousel");
//   if (!host) {
//     host = document.createElement("div");
//     host.className = "ended-carousel mb-6 profile-ended-carousel";
//     listingsGrid.parentNode.insertBefore(host, listingsGrid.nextSibling);
//   }

//   if (!ended.length) {
//     host.innerHTML = "";
//     return;
//   }

//   // clear host and add a title that will remain
//   host.innerHTML = "";
//   const title = document.createElement("h2");
//   title.className =
//     "carousel-title text-2xl font-bold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-4 justify-center";
//   title.textContent = "My ended Listings";
//   host.appendChild(title);

//   // Create an inner container for the carousel so mountCarousel doesn't remove the title
//   const carouselHost = document.createElement("div");
//   host.appendChild(carouselHost);

//   mountCarousel(carouselHost, ended, (listing) => {
//     const item = document.createElement("div");
//     item.className =
//       "container bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md";
//     const imageSrc = listing?.media?.[0]?.url || "/images/GoldenBid-icon.png";
//     if (imageSrc) {
//       const img = document.createElement("img");
//       img.src = imageSrc;
//       img.alt = listing?.title || "Listing image";
//       img.className = "listing-image h-40 w-full object-cover mb-2 rounded";
//       item.appendChild(img);
//     }
//     const link = document.createElement("a");
//     link.href = `/single-listing.html?id=${listing.id}&_seller=true`;
//     const titleEl = document.createElement("h3");
//     titleEl.className = "mt-2 text-lg font-semibold text-[var(--main-blue)]";
//     titleEl.textContent = listing?.title || "Untitled";
//     link.appendChild(titleEl);
//     item.appendChild(link);
//     const endedAt = document.createElement("div");
//     endedAt.className = "text-sm text-gray-600 mt-2";
//     const ends = listing.endsAt
//       ? new Date(listing.endsAt)
//       : listing.data?.endsAt
//       ? new Date(listing.data.endsAt)
//       : null;
//     endedAt.textContent = ends ? `Ended: ${formatDateShort(ends)}` : "Ended";
//     item.appendChild(endedAt);
//     return item;
//   });
// }
