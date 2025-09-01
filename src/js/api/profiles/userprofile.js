import { AuctionApi } from "../apiClient";

const auctionApi = new AuctionApi();

const urlParams = new URLSearchParams(window.location.search);
const sellerName = urlParams.get("id");
const profile = await auctionApi.getUserProfileByName(sellerName);
console.log("seller data:", profile);

async function showSellerProfile() {
  if (!sellerName) {
    document.querySelector(".profile-container").innerHTML =
      "<p class='text-center text-lg text-gray-500 mt-8'>No seller specified.</p>";
    return;
  }
  try {
    const profile = await auctionApi.getUserProfileByName(sellerName);
    renderSellerProfile(profile);
  } catch (error) {
    document.querySelector(".profile-container").innerHTML =
      "<p class='text-center text-lg text-red-500 mt-8'>Error loading seller profile.</p>";
  }
}

function renderSellerProfile(profile) {
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

  const bio = document.createElement("p");
  bio.textContent = profile.data.bio;
  bio.className =
    "profile-bio flex flex-col justify-center items-center rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--card-background)] border-3 border-[var(--main-gold)] shadow-lg min-h-50 min-w-150";

  const contentContainer = document.querySelector(".content");
  contentContainer.className =
    "content-container flex flex-col items-center justify-center mt-30 mb-20";

  const listingsGrid = document.querySelector(".user-listings");

  profile.data.listings.forEach((listing) => {
    const listingContainer = document.createElement("div");
    listingContainer.className =
      "listing-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4";

    const title = document.createElement("h1");
    title.className =
      "listing-title text-xl font-semibold text-[var(--main-blue)] font-['Playfair_Display',serif] mb-2";
    title.textContent = listing.title;

    const link = document.createElement("a");
    link.href = `/single-listing/index.html?id=${listing.id}?_seller=true`;

    const img = document.createElement("img");
    img.src = listing.media.url;

    profileContainer.appendChild(overlay);
    overlay.appendChild(name);
    overlay.appendChild(avatar);
    profileContainer.appendChild(bannerContainer);
    bannerContainer.appendChild(banner);
    contentContainer.appendChild(bio);

    link.appendChild(title);
    link.appendChild(img);
    listingContainer.appendChild(link);
    listingsGrid.appendChild(listingContainer);
  });
}



showSellerProfile();
