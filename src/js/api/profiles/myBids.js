// import { AuctionApi } from "../apiClient";


// const auctionApi = new AuctionApi();

// localStorage.getItem("token");
// const userName = localStorage.getItem("name");
// const profile = await auctionApi.getUserProfile(userName);

// function renderMyBids(bids) {
//     const bidsContainer = document.querySelector(".my-bids");
//     bidsContainer.innerHTML = ""; // Clear previous content

//     console.log("Rendering my bids:", bids);
//     console.error("bid info:", bids);

//     if (!bids || bids.length === 0) {
//         bidsContainer.innerHTML = "<p>No bids found.</p>";
//         return;
//     }

//     bids.forEach(bid => {
//             if (
//       bid.media &&
//       Array.isArray(bid.media) &&
//       bid.media.length > 0 &&
//       bid.media[0].url
//     ) {
//         const bidElement = document.createElement("div");
//         bidElement.className = "bid-item border-b-2 border-[var(--main-gold)] p-4";

//         const title = document.createElement("h2");
//         title.className = "text-xl font-bold";
//         title.textContent = bid.media[0].title;

//         bidElement.appendChild(title);
//         bidsContainer.appendChild(bidElement);
// }});
// }

// async function fetchMyBids(userName) {
//     try {
//         const bids = await auctionApi.getAllBidsByProfile(userName);
//         renderMyBids(bids);
//     } catch (error) {
//         console.error("Error fetching my bids:", error);
//     }
// }
// fetchMyBids();
