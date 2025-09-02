import { AuctionApi } from "../../apiClient.js";
import { onUpdateProfile } from "./update.js";

const auctionApi = new AuctionApi();

async function init() {
  const profile = await auctionApi.getUserProfile();
  renderProfile(profile);
}

function renderProfile(profile) {
  const profileContainer = document.querySelector(".profile-container");
  if (!profileContainer) return;
  profileContainer.classList.add("relative");

  const bannerContainer = document.createElement("div");
  bannerContainer.className =
    "banner-container w-full h-60 overflow-hidden m-auto w-[100%]";

  const bannerEl = document.createElement("img");
  bannerEl.src = profile.data.banner?.url || "";
  bannerEl.alt = `${profile.data.name}'s banner`;
  bannerEl.className = "banner-image object-cover w-screen ";

  const overlay = document.createElement("div");
  overlay.className = "banner-overlay absolute inset-0 opacity-100";

  const nameEl = document.createElement("h2");
  nameEl.className =
    "profile-name uppercase absolute left-1/2 bottom-29 translate-x-[-50%] translate-y-1/2 border-3 border-[var(--main-gold)] shadow-lg z-10 px-4 py-3 rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--main-blue)] text-[var(--main-gold)]";
  nameEl.textContent = profile.data.name;

  const avatarEl = document.createElement("img");
  avatarEl.src = profile.data.avatar?.url || "";
  avatarEl.alt = `${profile.data.name}'s avatar`;
  avatarEl.className =
    "avatar-image absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-1/2 h-50 w-50 object-cover rounded-full border-3 border-[var(--main-gold)] shadow-lg z-10";

  const editProfile = document.createElement("button");
  editProfile.textContent = "Edit Profile";
  editProfile.className =
    "edit-profile-button cursor-pointer absolute left-1/2 bottom-29 translate-x-[-50%] translate-y-65 border-3 border-[var(--main-gold)] shadow-lg z-10 px-4 py-3 rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--main-blue)] text-[var(--main-gold)]";

  // create inline form container hidden by default
  const formContainer = document.createElement("div");
  formContainer.className =
    "inline-update-form mt-4 w-full max-w-md z-20 absolute left-1/2 bottom-29 translate-x-[-50%] translate-y-170";
  formContainer.style.display = "none";
  formContainer.innerHTML = `
    <form id="inline-update-profile-form" class="flex flex-col gap-6 w-full bg-white p-4 rounded-lg shadow-lg border-2 border-[var(--main-gold)]">
      <label class="flex flex-col gap-2">
        <span class="font-semibold text-[var(--main-blue)]">Avatar URL</span>
        <input type="url" id="inline-avatar-url" class="border rounded px-3 py-2" value="${
          profile.data.avatar?.url || ""
        }" />
      </label>
      <label class="flex flex-col gap-2">
        <span class="font-semibold text-[var(--main-blue)]">Banner URL</span>
        <input type="url" id="inline-banner-url" class="border rounded px-3 py-2" value="${
          profile.data.banner?.url || ""
        }" />
      </label>
      <label class="flex flex-col gap-2">
        <span class="font-semibold text-[var(--main-blue)]">Bio</span>
        <textarea id="inline-bio" rows="3" class="border rounded px-3 py-2">${
          profile.data.bio || ""
        }</textarea>
      </label>
      <div class="flex gap-2 justify-end">
        <button type="button" id="inline-cancel" class="px-4 py-2 border rounded">Cancel</button>
        <button type="submit" id="inline-submit" class="bg-[var(--main-gold)] text-[var(--main-blue)] font-bold py-2 px-4 rounded">Save</button>
      </div>
    </form>
  `;

  // toggle the inline form
  editProfile.addEventListener("click", () => {
    formContainer.style.display =
      formContainer.style.display === "none" ? "block" : "none";
  });

  // handle cancel
  formContainer.addEventListener("click", (e) => {
    if (e.target && e.target.id === "inline-cancel") {
      formContainer.style.display = "none";
    }
  });

  // handle submit
  // create bio element early so submit handler can safely reference it
  const bioEl = document.createElement("p");
  bioEl.textContent = profile.data.bio || "";
  bioEl.className =
    "profile-bio flex flex-col justify-center items-center rounded-md font-['Playfair_Display',serif] text-lg bg-[var(--card-background)] border-3 border-[var(--main-gold)] shadow-lg min-h-50 min-w-150";

  formContainer.addEventListener("submit", async (e) => {
    if (e.target && e.target.id === "inline-update-profile-form") {
      e.preventDefault();
      const avatarUrl = document
        .getElementById("inline-avatar-url")
        .value.trim();
      const bannerUrl = document
        .getElementById("inline-banner-url")
        .value.trim();
      const bioText = document.getElementById("inline-bio").value.trim();
      const data = { avatar: avatarUrl, banner: bannerUrl, bio: bioText };
      try {
        await onUpdateProfile(data);
        alert("Profile updated successfully");
        formContainer.style.display = "none";
        if (avatarUrl && avatarEl) avatarEl.src = avatarUrl;
        if (bannerUrl && bannerEl) bannerEl.src = bannerUrl;
        if (bioText && bioEl) bioEl.textContent = bioText;
      } catch (err) {
        console.error(err);
      }
    }
  });

  // bioEl was created earlier so it's available to the submit handler

  const contentContainer = document.querySelector(".content");
  contentContainer.className =
    "content-container flex flex-col items-center justify-center mt-40 mb-20";

  profileContainer.appendChild(overlay);
  overlay.appendChild(nameEl);
  overlay.appendChild(avatarEl);
  overlay.appendChild(editProfile);
  overlay.appendChild(formContainer);

  profileContainer.appendChild(bannerContainer);
  bannerContainer.appendChild(bannerEl);
  contentContainer.appendChild(bioEl);
}

init();
