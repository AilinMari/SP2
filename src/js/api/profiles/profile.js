import { AuctionApi } from "../apiClient";

const auctionApi = new AuctionApi();

const profile = await auctionApi.getUserProfile();
console.log("Profile data:", profile);

function renderProfile(profile) {
  const profileContainer = document.querySelector(".profile-container");
  // Make the container relative for absolute positioning
  profileContainer.classList.add("relative");

  const bannerContainer = document.createElement("div");
  bannerContainer.className =
    "banner-container w-full h-50 overflow-hidden";

  const banner = document.createElement("img");
  banner.src = profile.data.banner.url;
  banner.alt = `${profile.data.name}'s banner`;
  banner.className = "banner-image object-cover";

  const avatar = document.createElement("img");
  avatar.src = profile.data.avatar.url;
  avatar.alt = `${profile.data.name}'s avatar`;
  // Absolute position avatar at bottom center of banner
  avatar.className =
    "avatar-image absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-1/2 h-50 w-50 object-cover rounded-full border-3 border-[var(--main-gold)] shadow-lg z-10";

  profileContainer.appendChild(bannerContainer);
  bannerContainer.appendChild(banner);
  bannerContainer.appendChild(avatar);
}

renderProfile(profile);

//w-full h-50 object-cover object-[50%_15%] z-10
