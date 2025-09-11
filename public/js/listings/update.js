import { AuctionApi } from "../apiClient.js";

const auctionApi = new AuctionApi();

const url = new URL(window.location.href); // Get current page URL
const listingId = url.searchParams.get("id"); // Get listingId from URL query parameters

async function fetchListingData(listingId) {
  try {
    const listing = await auctionApi.getListingById(listingId);

    populateFormFields(listing.data);
  } catch (error) {
    console.error("Error fetching listing data:", error);
    alert("Failed to fetch listing data. Please try again.");
  }
}

function populateFormFields(listing) {
  document.getElementById("listing-title").value = listing.title;
  document.getElementById("listing-body").value = listing.description;
  // Convert ISO endsAt to datetime-local value (YYYY-MM-DDTHH:MM)
  if (listing.endsAt) {
    const d = new Date(listing.endsAt);
    const pad = (n) => String(n).padStart(2, "0");
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    document.getElementById("listing-ends-at").value = local;
  } else {
    document.getElementById("listing-ends-at").value = "";
  }
  document.getElementById("listing-tags").value = listing.tags.join(", ");
  if (listing.media[0]) {
    document.getElementById("listing-image-url").value =
      listing.media[0].url || "";
    document.getElementById("listing-image-alt").value =
      listing.media[0].alt || "Image";
  }
  document.getElementById("listing-tags").value = listing.tags
    ? listing.tags.join(", ")
    : "";
}

export async function updateListing() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to update a listing.");
    window.location.href = "/login.html"; // Redirect to login page
    return;
  }

  if (!listingId) {
    console.error("Listing ID not found in the URL.");
    return;
  }

  const title = document.getElementById("listing-title").value.trim();
  const body = document.getElementById("listing-body").value.trim();
  const tagsInput = document.getElementById("listing-tags").value.trim();
  const imageUrl = document.getElementById("listing-image-url").value.trim();
  const imageAlt =
    document.getElementById("listing-image-alt").value.trim() || "Image"; // Fallback to "Image" if empty
  const endsAt = document.getElementById("listing-ends-at").value.trim();
  // Validate required fields
  if (!title || !body) {
    alert("Title and body are required fields.");
    return;
  }
  // Convert tags into an array
  const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : [];

  // Create media object(s) from comma-separated URLs.
  // If the user provided one URL we still send an array (API expects array),
  // if multiple, build array of media objects.
  const images = imageUrl
    ? imageUrl
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const media = images.map((u) => ({ url: u, alt: imageAlt }));

  if (!endsAt) {
    alert("Please provide an end date/time for the listing.");
    return;
  }
  let endsAtIso;
  try {
    endsAtIso = new Date(endsAt).toISOString();
  } catch (err) {
    alert("Invalid end date/time format.");
    return;
  }

  try {
    // Send request to update listing
    const updatedListing = await auctionApi.updateListing(
      listingId,
      title,
      body,
      endsAtIso,
      media,
      tags
    );

    // Redirect to the updated listing page (use returned id if available)
    const id = updatedListing?.data?.id || listingId;
    window.location.href = `/single-listing.html?id=${id}&_seller=true`;
  } catch (error) {
    console.error("Error updating listing:", error);
    alert("Failed to update listing. Please try again.");
  }
}

// Fetch and populate form fields when the page loads
if (listingId) {
  fetchListingData(listingId);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("create-listing-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      updateListing();
    });
  }
});
