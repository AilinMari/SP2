import { AuctionApi } from "../../apiClient";

const auctionApi = new AuctionApi();

const profile = await auctionApi.getUserProfile();
console.log("Profile data:", profile);

function renderProfile(profile) {
  const profileContainer = document.querySelector(".profile-container");

  profileContainer.classList.add("relative");

  const bannerContainer = document.createElement("div");
  bannerContainer.className =
    "banner-container w-full h-60 overflow-hidden m-auto w-[100%]";

  const banner = document.createElement("img");
  banner.src = profile.data.banner.url;
  banner.alt = `${profile.data.name}'s banner`;
  banner.className = "banner-image object-cover w-screen ";

  const overlay = document.createElement("div");
  overlay.className = "banner-overlay absolute inset-0 opacity-100";

  const name = document.createElement("h2");
  name.className =
    "profile-name uppercase absolute left-1/2 bottom-29 translate-x-[-50%] translate-y-1/2 border-3 border-[var(--main-gold)] shadow-lg z-10 px-4 py-3 rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--main-blue)] text-[var(--main-gold)]";
  name.textContent = profile.data.name;

  const avatar = document.createElement("img");
  avatar.src = profile.data.avatar.url;
  avatar.alt = `${profile.data.name}'s avatar`;
  // Absolute position avatar at bottom center of banner
  avatar.className =
    "avatar-image absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-1/2 h-50 w-50 object-cover rounded-full border-3 border-[var(--main-gold)] shadow-lg z-10";

  const editProfile = document.createElement("button");
  editProfile.textContent = "Edit Profile";
  editProfile.className =
    "edit-profile-button cursor-pointer absolute left-1/2 bottom-29 translate-x-[-50%] translate-y-65 border-3 border-[var(--main-gold)] shadow-lg z-10 px-4 py-3 rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--main-blue)] text-[var(--main-gold)]";
  editProfile.addEventListener("click", () => {
    // Handle edit profile logic
    window.location.href = "/auth/profile/update/index.html";});

  const bio = document.createElement("p");
  bio.textContent = profile.data.bio;
  bio.className =
    "profile-bio flex flex-col justify-center items-center rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--card-background)] border-3 border-[var(--main-gold)] shadow-lg min-h-50 min-w-150";

  const contentContainer = document.querySelector(".content");
  contentContainer.className =
    "content-container flex flex-col items-center justify-center mt-40 mb-20";

  profileContainer.appendChild(overlay);
  overlay.appendChild(name);
  overlay.appendChild(avatar);
  overlay.appendChild(editProfile);

  profileContainer.appendChild(bannerContainer);
  bannerContainer.appendChild(banner);
  contentContainer.appendChild(bio);
}

renderProfile(profile);
