// Filter listings that are still active
export function filterActiveListings(listings) {
  const now = new Date();
  return listings.filter((listing) => new Date(listing.endsAt) > now);
}

// Filter listings that have expired
export function filterExpiredListings(listings) {
  const now = new Date();
  return listings.filter((listing) => new Date(listing.endsAt) <= now);
}

// Filter listings by search term (title or description)
export function filterBySearch(listings, searchTerm) {
  if (!searchTerm) return listings;
  const term = searchTerm.toLowerCase();
  return listings.filter(
    (listing) =>
      (listing.title && listing.title.toLowerCase().includes(term)) ||
      (listing.description && listing.description.toLowerCase().includes(term))
  );
}

// Main filter function: accepts options object
export function filterListings(listings, { search = "", status = "all" } = {}) {
  let filtered = listings;
  if (status === "active") {
    filtered = filterActiveListings(filtered);
  } else if (status === "expired") {
    filtered = filterExpiredListings(filtered);
  } // 'all' returns all listings
  filtered = filterBySearch(filtered, search);
  return filtered;
}
