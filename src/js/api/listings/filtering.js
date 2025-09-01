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
  return listings.filter((listing) => {
    const inTitle = listing.title && listing.title.toLowerCase().includes(term);
    const inDesc =
      listing.description && listing.description.toLowerCase().includes(term);
    const inTags =
      Array.isArray(listing.tags) &&
      listing.tags.some((tag) => tag.toLowerCase().includes(term));
    return inTitle || inDesc || inTags;
  });
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
