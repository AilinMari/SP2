import { attachCountdown, detachCountdown } from "/js/utils/countdown.js";

// Renders non-active listings into the `.listings-grid` element.
// Render listings into the `.listings-grid` element.
// Optional options: { limit: number } to render only the first N listings.
export function renderAllListings(listings, options = {}) {
  const listingsGrid = document.querySelector(".listings-grid");
  if (!listingsGrid) {
    console.error("Listings grid not found");
    return;
  }
  // detach countdowns from any existing elements before clearing the grid
  if (listingsGrid.querySelectorAll) {
    listingsGrid.querySelectorAll(".listing-ends-at").forEach((el) => {
      try {
        detachCountdown(el);
      } catch (e) {
        // ignore
      }
    });
  }
  listingsGrid.innerHTML = ""; // Clear existing listings

  if (!Array.isArray(listings) || listings.length === 0) {
    listingsGrid.innerHTML = "";
    return;
  }

  // Apply optional limit
  const limit = Number.isFinite(Number(options.limit))
    ? Number(options.limit)
    : null;
  const toRender = limit ? listings.slice(0, limit) : listings;

  console.log("Rendering listings (count):", toRender.length);

  toRender.forEach((listing) => {
    // Render all listings. If no media is present, use a placeholder image.
    const imageSrc =
      listing.media && Array.isArray(listing.media) && listing.media[0]?.url
        ? listing.media[0].url
        : "/images/GoldenBid-icon.png"; // fallback placeholder
    const imageAlt =
      listing.media && listing.media[0]?.alt
        ? listing.media[0].alt
        : listing.title || "Listing image";

    // Proceed to render the listing
    const listingContainer = document.createElement("div");
    // use a specific class to avoid global `.container` styles interfering with grid layout
    listingContainer.className =
      "listing-card bg-[var(--card-background)] p-4 border-2 border-[var(--main-gold)] rounded-md mb-8 overflow-hidden";

    const title = document.createElement("h1");
    title.className =
      "listing-title text-xl font-semibold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-2 max-w-full overflow-hidden text-ellipsis";
    title.textContent = listing.title;

    const seller = document.createElement("a");
    seller.className =
      "listing-seller text-md font-regular text-[var(--main-blue)] font-['Playfair_Display',serif]";
    seller.textContent = `By ${listing.seller?.name || "Unknown"}`;
    seller.href = `/user-profile.html?id=${listing.seller?.name || ""}`;

    const link = document.createElement("a");
    // fix query string: id=...&_seller=true
    link.href = `/single-listing.html?id=${listing.id}&_seller=true`;

    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = imageAlt;
    img.className = "listing-image mt-4 w-full h-40 object-cover rounded";

    const endsAt = document.createElement("span");
    endsAt.className = "listing-ends-at block mt-2 text-sm text-red-600";
    const endsDate = listing.endsAt ? new Date(listing.endsAt) : null;
    attachCountdown(endsAt, endsDate);

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
