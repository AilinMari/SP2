import { AuctionApi } from "../apiClient";

const auctionApi = new AuctionApi();

const urlParams = new URLSearchParams(window.location.search);
const sellerName = urlParams.get("id");

async function showSellerProfile() {
  const profileContainer = document.querySelector(".profile-container");
  if (!profileContainer) return;
  if (!sellerName) {
    profileContainer.innerHTML =
      "<p class='text-center text-lg text-gray-500 mt-8'>No seller specified.</p>";
    return;
  }
  try {
    const profile = await auctionApi.getUserProfileByName(sellerName);
    renderSellerProfile(profile);
  } catch (error) {
    // If 401, show login popup
    if (error.message && error.message.includes("401")) {
      showLoginPopup();
    } else {
      profileContainer.innerHTML =
        "<p class='text-center text-lg text-red-500 mt-8'>Error loading seller profile.</p>";
    }
  }
}

function showLoginPopup() {
  // Remove any existing modal
  const oldModal = document.getElementById("login-modal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.id = "login-modal";
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50";

  const modalContent = document.createElement("div");
  modalContent.className =
    "bg-white rounded-lg shadow-lg p-8 flex flex-col items-center";

  const message = document.createElement("p");
  message.className = "text-lg text-[var(--main-blue)] mb-4 text-center";
  message.textContent =
    "You must be logged in to view user profiles and their listings.";

  const loginBtn = document.createElement("button");
  loginBtn.className =
    "px-6 py-2 bg-[var(--main-gold)] text-[var(--main-blue)] rounded font-semibold hover:bg-yellow-500";
  loginBtn.textContent = "Go to Login";
  loginBtn.onclick = () => {
    window.location.href = "/auth/login/index.html";
  };

  modalContent.appendChild(message);
  modalContent.appendChild(loginBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Optional: close modal on click outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function renderSellerProfile(profile) {
  const profileContainer = document.querySelector(".profile-container");
  if (!profileContainer) return;
  profileContainer.classList.add("relative");

  // Banner
  const bannerContainer = document.createElement("div");
  bannerContainer.className =
    "banner-container w-full h-60 overflow-hidden m-auto w-[100%]";

  if (profile.data.banner?.url) {
    const banner = document.createElement("img");
    banner.src = profile.data.banner?.url || "";
    banner.alt = `${profile.data.name}'s banner`;
    banner.className = "banner-image object-cover w-screen ";
    bannerContainer.appendChild(banner);
  }

  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "banner-overlay absolute inset-0 opacity-100";

  // Name
  const name = document.createElement("h2");
  name.className =
    "profile-name uppercase absolute left-1/2 bottom-29 translate-x-[-50%] translate-y-1/2 border-3 border-[var(--main-gold)] shadow-lg z-10 px-4 py-3 rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--main-blue)] text-[var(--main-gold)]";
  name.textContent = profile.data.name;

  // Avatar
  if (profile.data.avatar?.url) {
    const avatar = document.createElement("img");
    avatar.src = profile.data.avatar?.url || "";
    avatar.alt = `${profile.data.name}'s avatar`;
    avatar.className =
      "avatar-image absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-1/2 h-50 w-50 object-cover rounded-full border-3 border-[var(--main-gold)] shadow-lg z-15";
    overlay.appendChild(avatar);
  }

  // Bio
  const bio = document.createElement("p");
  bio.textContent = profile.data.bio || "";
  bio.className =
    "profile-bio flex flex-col justify-center items-center rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--card-background)] border-3 border-[var(--main-gold)] shadow-lg min-h-50 min-w-150";

  // Content container
  const contentContainer = document.querySelector(".content");
  if (contentContainer) {
    contentContainer.className =
      "content-container flex flex-col items-center justify-center mt-30 mb-20";
    contentContainer.appendChild(bio);
  }

  profileContainer.appendChild(overlay);
  overlay.appendChild(name);
  profileContainer.appendChild(bannerContainer);
}

showSellerProfile();
