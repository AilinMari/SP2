import { AuctionApi } from "../../../apiClient.js";

const auctionApi = new AuctionApi();

const token = localStorage.getItem("token");

async function fetchMyBids() {
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
    const response = await auctionApi.getBidsByProfile(username);
    // API may return { data: [...] } or the array directly
    const bids = response?.data ?? response;
    console.log("My bids:", bids);

    if (!Array.isArray(bids)) {
      console.warn("Unexpected bids response shape; expected an array", bids);
      return;
    }

    // Render bids as a horizontal carousel inside .my-active-bids
    const bidContainer = document.querySelector(".my-active-bids");
    if (!bidContainer) {
      console.warn(
        "No .my-active-bids container found in DOM. Bids will not be rendered."
      );
      return;
    }

    bidContainer.innerHTML = "";

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

    bids.forEach((bid) => {
      const item = document.createElement("div");
      item.className =
        "carousel-item flex-shrink-0 scroll-snap-align-start w-[320px]";

      const link = document.createElement("a");
      const listingId =
        bid?.listing?.id || bid?.listing?._id || bid?.listingId || "";
      link.href = listingId
        ? `/singleListing.html?id=${listingId}&_seller=true`
        : "#";

      const imageSrc =
        bid?.listing?.media?.[0]?.url || "/src/images/GoldenBid-icon.png";
      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = bid?.listing?.title || "Listing image";
      img.className = "w-full h-40 object-cover rounded";

      const title = document.createElement("h3");
      title.className = "mt-2 text-lg font-semibold text-[var(--main-blue)]";
      title.textContent = bid?.listing?.title || "Untitled";

      const bidContainerInner = document.createElement("div");
      bidContainerInner.className =
        "listing-bids-container mt-2 flex justify-between";

      const latestBid = document.createElement("div");
      latestBid.className = "listing-latest-bid mt-2 text-sm text-green-600";
      latestBid.textContent = `Your bid: ${bid?.amount ?? bid?.value ?? "N/A"}`;

      bidContainerInner.appendChild(latestBid);

      link.appendChild(img);
      item.appendChild(link);
      link.appendChild(title);

      item.appendChild(bidContainerInner);

      track.appendChild(item);
    });

    wrapper.appendChild(prev);
    wrapper.appendChild(track);
    wrapper.appendChild(next);
    bidContainer.appendChild(wrapper);

    // Scroll behavior using item width
    function scrollByDirection(direction) {
      const card = track.querySelector(".carousel-item");
      if (!card) return;
      const width = card.getBoundingClientRect().width + 16; // include gap
      track.scrollBy({ left: direction * width, behavior: "smooth" });
    }

    prev.addEventListener("click", () => scrollByDirection(-1));
    next.addEventListener("click", () => scrollByDirection(1));

    console.log("Rendered bids carousel with", bids.length, "cards");
  } catch (error) {
    console.error("Error fetching my bids:", error);
  }
}
fetchMyBids();
