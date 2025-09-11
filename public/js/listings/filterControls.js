import { filterListings } from "/js/listings/filtering.js";

// Wire up the listing filters UI (search, status, sort) and call back with filtered results
// Usage: initListingFilters({ getListings: () => allListings, renderAll: renderAllListings })
export function initListingFilters({ getListings, renderAll }) {
  const searchBar = document.getElementById("search-bar");
  const statusFilter = document.getElementById("status-filter");
  const sortFilter = document.getElementById("sort-filter");

  function sortListings(listings, sortType) {
    let sorted = Array.isArray(listings) ? [...listings] : [];
    switch (sortType) {
      case "newest":
        sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.created) - new Date(b.created));
        break;
      case "most-bids":
        sorted.sort((a, b) => (b._count?.bids || 0) - (a._count?.bids || 0));
        break;
      case "least-bids":
        sorted.sort((a, b) => (a._count?.bids || 0) - (b._count?.bids || 0));
        break;
      default:
        break;
    }
    return sorted;
  }

  function applyFilters() {
    const search = searchBar ? searchBar.value : "";
    const status = statusFilter ? statusFilter.value : "all";
    const sortType = sortFilter ? sortFilter.value : "newest";
    const all = typeof getListings === "function" ? getListings() : [];
    let filtered = filterListings(all, { search, status });
    filtered = sortListings(filtered, sortType);
    if (typeof renderAll === "function") renderAll(filtered);
  }

  if (searchBar) {
    searchBar.addEventListener("input", applyFilters);
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }
  if (sortFilter) {
    sortFilter.addEventListener("change", applyFilters);
  }

  // initial run
  applyFilters();
}
