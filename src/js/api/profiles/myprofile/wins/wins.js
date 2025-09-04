import { AuctionApi } from "../../../apiClient.js";

const auctionApi = new AuctionApi();

const token = localStorage.getItem("token");

async function fetchMyWins() {
  if (!token) {
    console.error("No token found");
    return;
  }

  const username = localStorage.getItem("name");
  if (!username) {
    console.error("No username found in localStorage (name)");
    return;
  }

  try {
    const response = await auctionApi.getWinsByProfile(username);
    // API may return { data: [...] } or the array directly
    const wins = response?.data ?? response;
    console.log("My wins:", wins);

    if (!Array.isArray(wins)) {
      console.warn("Unexpected wins response shape; expected an array", wins);
      return;
    }

    // Render wins as a horizontal carousel inside .my-active-wins
    const winContainer = document.querySelector(".my-wins");
    if (!winContainer) {
      console.warn(
        "No .my-active-wins container found in DOM. Wins will not be rendered."
      );
      return;
    }

    winContainer.innerHTML = "";

    // Use the same markup/classes as the listings carousel for consistent styling
    const wrapper = document.createElement("div");
    wrapper.className = "carousel-wrapper relative";

    const prev = document.createElement("button");
    prev.className = "carousel-btn carousel-prev";
    prev.setAttribute("aria-label", "Previous");
    prev.textContent = "<";

    const next = document.createElement("button");
    next.className = "carousel-btn carousel-next";
    next.setAttribute("aria-label", "Next");
    next.textContent = ">";

    const track = document.createElement("div");
    track.className = "carousel-track flex gap-4 overflow-x-auto scroll-smooth";
    track.style.scrollSnapType = "x mandatory";

    wins.forEach((win) => {
      const item = document.createElement("div");
      item.className =
        "carousel-item flex-shrink-0 scroll-snap-align-start w-[320px]";

      const link = document.createElement("a");
      const listingId =
        win?.listing?.id || win?.listing?._id || win?.listingId || "";
      link.href = listingId
        ? `/single-listing/index.html?id=${listingId}&_seller=true`
        : "#";

      const imageSrc =
        win?.listing?.media?.[0]?.url || "/src/images/GoldenBid-icon.png";
      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = win?.listing?.title || "Listing image";
      img.className = "w-full h-40 object-cover rounded";

      const title = document.createElement("h3");
      title.className = "mt-2 text-lg font-semibold text-[var(--main-blue)]";
      title.textContent = win?.listing?.title || "Untitled";

     
      const bidContainerInner = document.createElement("div");
      bidContainerInner.className =
        "listing-bids-container mt-2 flex justify-between";

      const latestWin = document.createElement("div");
      latestWin.className = "listing-latest-win mt-2 text-sm text-green-600";
      latestWin.textContent = `Your win: ${win?.amount ?? win?.value ?? "N/A"}`;

      bidContainerInner.appendChild(latestWin);

      link.appendChild(img);
      item.appendChild(link);
      link.appendChild(title);

      item.appendChild(bidContainerInner);

      track.appendChild(item);
    });

    wrapper.appendChild(prev);
    wrapper.appendChild(track);
    wrapper.appendChild(next);
    winContainer.appendChild(wrapper);

    // Scroll behavior using item width
    function scrollByDirection(direction) {
      const card = track.querySelector(".carousel-item");
      if (!card) return;
      const width = card.getBoundingClientRect().width + 16; // include gap
      track.scrollBy({ left: direction * width, behavior: "smooth" });
    }

    prev.addEventListener("click", () => scrollByDirection(-1));
    next.addEventListener("click", () => scrollByDirection(1));

    console.log("Rendered wins carousel with", wins.length, "cards");
  } catch (error) {
    console.error("Error fetching my wins:", error);
  }
}
fetchMyWins();
