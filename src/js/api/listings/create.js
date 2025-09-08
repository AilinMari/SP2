import { AuctionApi } from "../apiClient.js";

const auctionApi = new AuctionApi();

export async function createPost() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to create a listing.");
    window.location.href = "/login.html";
    return;
  }

  // Check if the user is logged in
  const user = await auctionApi.getUserProfile(token);
  if (!user) {
    alert("You must be logged in to create a listing.");
    window.location.href = "/login.html";
    return;
  }
}
const form = document.getElementById("create-listing-form"); // Assuming you have a form
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get values from input fields
    const title = document.getElementById("listing-title").value.trim();
    const body = document.getElementById("listing-body").value.trim();
    const tagsInput = document.getElementById("listing-tags").value.trim();
    const imageUrl = document.getElementById("listing-image-url").value.trim();
    const imageAlt =
      document.getElementById("listing-image-alt").value.trim() || "Image"; // Fallback if empty
    const endsAt = document.getElementById("listing-ends-at").value.trim();

    // Convert tags into an array
    const tags = tagsInput ? tagsInput.split(",").map((tag) => tag.trim()) : [];

    // Create media object
    const media = imageUrl ? { url: imageUrl, alt: imageAlt } : null;

    // endsAt must be provided and in ISO format for the API
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
      // API expects: createListing(title, description, endsAt, media, tags)
      const createdListing = await auctionApi.createListing(
        title,
        body,
        endsAtIso,
        media,
        tags
      );

      // Redirect to the new listing page (use absolute path)
      // Notify other parts of the app that listings have been updated
      try {
        window.dispatchEvent(
          new CustomEvent("listings:updated", { detail: createdListing.data })
        );
      } catch (e) {
        // ignore if dispatching fails in older browsers
      }

      // Redirect to the new listing page (use absolute path)
      window.location.href = `/singleListing.html?id=${createdListing.data.id}&_seller=true`;
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing. Please try again.");
    }
  });
}
