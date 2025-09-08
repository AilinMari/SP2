import { AuctionApi } from "../apiClient.js";

const auctionApi = new AuctionApi();

async function onUpdateProfile(data) {
  try {
    console.log("Update profile data:", data);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your profile.");
      throw new Error("No token found");
    }
    const updatedProfile = await auctionApi.updateUserProfile(data);
    console.log("API response:", updatedProfile);
    // Update localStorage with new avatar and banner
    if (updatedProfile.avatar && updatedProfile.avatar.url) {
      localStorage.setItem("avatar", updatedProfile.avatar.url);
    }
    if (updatedProfile.banner && updatedProfile.banner.url) {
      localStorage.setItem("banner", updatedProfile.banner.url);
    }
    if (updatedProfile.bio && updatedProfile.bio.content) {
      localStorage.setItem("bio", updatedProfile.bio.content);
    }
    return updatedProfile;
  } catch (error) {
    console.error("Failed to update profile:", error);
    alert("Error: " + (error.message || error));
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("update-profile-form");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const avatar = document.getElementById("avatar-url").value.trim();
      const banner = document.getElementById("banner-url").value.trim();
      const bio = document.getElementById("bio").value.trim();
      const data = { avatar, banner, bio };
      try {
        const updatedProfile = await onUpdateProfile(data);
        alert("Profile updated successfully!");
      } catch (error) {
        // Error already logged and alerted in onUpdateProfile
      }
    });
  }
});
export { onUpdateProfile };
