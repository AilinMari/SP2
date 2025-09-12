import {
  API_BASE_URL,
  API_AUTH,
  API_AUTH_LOGIN,
  API_KEY,
  API_SINGLE_LISTING,
} from "./constants.js"; // Import API_BASE_URL
import { API_PROFILES, API_LISTINGS } from "./constants.js";

/**
 * Custom error class for handling authentication errors.
 */
export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
    this.url = API_BASE_URL;
  }
}

export class AuctionApi {
  /**
   * Helper method for performing fetch requests.
   * @param {string} url - The endpoint URL.
   * @param {object} options - Fetch options.
   * @param {string} errorMessage - Error message for failures.
   * @returns {Promise<any>} Parsed JSON response.
   */
  async _request(url, options, errorMessage) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `${errorMessage}. Status: ${response.status}. Details: ${errorDetails}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Request error:", error);
      throw error;
    }
  }

  /**
   * Retrieves the access token from local storage.
   * @returns {string} The access token.
   * @throws {AuthError} If the user is not logged in.
   */
  _getRequiredAccessToken() {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      throw new AuthError("User is not logged in");
    }

    return accessToken;
  }

  /**
   * Logs in a user.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<any>} User data.
   */
  async login(email, password) {
    const body = { email, password };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
      },
      body: JSON.stringify(body),
    };

    const { data } = await this._request(
      API_AUTH_LOGIN,
      options,
      "Login failed"
    );

    // Store user data in localStorage
    localStorage.setItem("name", data.name);
    localStorage.setItem("avatar", data.avatar.url);

    return data;
  }

  /**
   * Updates the logged-in user's profile (avatar and banner).
   * @param {string} avatar - The new avatar URL.
   * @param {string} banner - The new banner URL.
   * @returns {Promise<any>} The updated profile data.
   */

  async updateUserProfile(data) {
    const username = localStorage.getItem("name"); // Get the username from local storage
    const url = `${API_PROFILES}/${username}`; // Construct the API URL
    const accessToken = this._getRequiredAccessToken();

    // Ensuring the avatar and banner are formatted correctly as objects
    if (data.avatar && typeof data.avatar === "string") {
      data.avatar = { url: data.avatar };
    }
    if (data.banner && typeof data.banner === "string") {
      data.banner = { url: data.banner };
    }
    // Do NOT convert bio to object; send as string

    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
      },
      body: JSON.stringify(data),
    };

    return await this._request(url, options, "Error updating user profile");
  }

  /**
   * Retrieves the access token from local storage.
   * @returns {string} The access token.
   * @throws {AuthError} If the user is not logged in.
   */
  _getRequiredAccessToken() {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      throw new AuthError("User is not logged in");
    }

    return accessToken;
  }

  async getUserProfile() {
    try {
      const accessToken = this._getRequiredAccessToken();
      const name = localStorage.getItem("name");
      const url = new URL(`${API_PROFILES}/${name}`);

      url.searchParams.append("_avatar", "true"); // Include the _avatar parameter
      url.searchParams.append("_banner", "true"); // Include the _banner parameter
      url.searchParams.append("_listings", "true"); // Include the _listings parameter
      // url.searchParams.append("_media", "true"); // Include the _media parameter

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
        },
      };

      return await this._request(url.toString(), options, "Error creating ");
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * name for a user.
   * @param {string} name - The user's name.
   * @returns {Promise<any>} User data.
   */

  async getUserProfileByName(name) {
    try {
      if (!name) {
        throw new Error("name parameter is missing.");
      }

      const url = new URL(`${API_PROFILES}/${name}`);
      url.searchParams.append("_name", "true");
      url.searchParams.append("_avatar", "true");
      url.searchParams.append("_banner", "true");
      url.searchParams.append("_listings", "true");
      url.searchParams.append("_media", "true");

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": `${API_KEY}`,
        },
      };
      // If logged in, add Authorization header
      const accessToken = localStorage.getItem("token");
      if (accessToken) {
        options.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return await this._request(
        url.toString(),
        options,
        "Error fetching user profile"
      );
    } catch (error) {
      console.error("Error in getUserProfileByName:", error);
      throw error;
    }
  }

  /**
   * Search profiles by query string using the API endpoint /profiles/search?q=...
   * Returns either an array or object consistent with other methods.
   * @param {string} q - search query
   */
  async searchProfiles(q) {
    try {
      const url = new URL(`${API_PROFILES}/search`);
      url.searchParams.append("q", q || "");

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": `${API_KEY}`,
        },
      };

      // include auth header if present
      const accessToken = localStorage.getItem("token");
      if (accessToken)
        options.headers["Authorization"] = `Bearer ${accessToken}`;

      return await this._request(
        url.toString(),
        options,
        "Error searching profiles"
      );
    } catch (err) {
      console.error("searchProfiles error", err);
      throw err;
    }
  }

  async getAllListingsByName(name) {
    try {
      if (!name) {
        throw new Error("Name parameter is missing.");
      }

      const url = new URL(`${API_PROFILES}/${name}/listings`);
      url.searchParams.append("_media", "true");
      url.searchParams.append("_tags", "true");
      url.searchParams.append("_description", "true");
      url.searchParams.append("_bids", "true");

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": `${API_KEY}`,
        },
      };
      // If logged in, add Authorization header
      const accessToken = localStorage.getItem("token");
      if (accessToken) {
        options.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return await this._request(
        url.toString(),
        options,
        "Error fetching user posts"
      );
    } catch (error) {
      console.error("Error in getAllListingsByName:", error);
      throw error;
    }
  }

  async getListingsByLoggedInUser() {
    const accessToken = this._getRequiredAccessToken();
    const username = localStorage.getItem("name"); // Get the username from local storage
    const url = new URL(`${API_PROFILES}/${username}/listings`);

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
      },
    };
    return await this._request(
      url.toString(),
      options,
      "Error fetching user listings"
    );
  }

  /**
   * Fetches all blog posts.
   * @returns {Promise<any>} An array of listings.
   */
  async getAllListings() {
    // pick endpoint
    const url = new URL(API_LISTINGS);
    url.searchParams.append("_bids", "true"); // Include the _bids parameter
    url.searchParams.append("_seller", "true"); // Include the _seller parameter
    url.searchParams.append("_media", "true"); // Include the _media parameter
    url.searchParams.append("page", "1"); // Include the page parameter
    url.searchParams.append("limit", "100"); // Include the limit parameter

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": `${API_KEY}`,
      },
    };
    // If logged in, add Authorization header
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      options.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const { data } = await this._request(
      url.toString(),
      options,
      "Error fetching listings"
    );
    return data;
  }

  /**
   * Fetch all listing pages and return an aggregated array.
   * This will loop pages until a page returns fewer items than the requested limit.
   * @param {object} opts - options
   * @param {number} opts.limit - page size to request per page (default 100)
   * @returns {Promise<any[]>} aggregated listing array
   */
  async getAllListingsAll({ limit = 100, maxPages = Infinity } = {}) {
    const aggregated = [];
    let page = 1;
    while (true) {
      const url = new URL(API_LISTINGS);
      url.searchParams.append("_bids", "true");
      url.searchParams.append("_seller", "true");
      url.searchParams.append("_media", "true");
      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", String(limit));

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": `${API_KEY}`,
        },
      };
      const accessToken = localStorage.getItem("token");
      if (accessToken) {
        options.headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await this._request(
        url.toString(),
        options,
        `Error fetching listings page ${page}`
      );

      // support { data: [...] } shape or direct array
      const pageData = Array.isArray(res) ? res : res?.data ?? [];
      if (!Array.isArray(pageData) || pageData.length === 0) break;

      aggregated.push(...pageData);

      // stop if last page (fewer than limit items) or we've reached maxPages
      if (pageData.length < limit) break;
      if (Number.isFinite(maxPages) && page >= Number(maxPages)) break;
      page += 1;
    }

    return aggregated;
  }

  /**
   * Fetch pages and call onPage for each page as it arrives.
   * onPage receives (pageDataArray, pageNumber).
   * Returns the aggregated array when finished.
   */
  async getAllListingsPaged({ limit = 100, maxPages = Infinity } = {}, onPage) {
    const aggregated = [];
    let page = 1;
    while (true) {
      const url = new URL(API_LISTINGS);
      url.searchParams.append("_bids", "true");
      url.searchParams.append("_seller", "true");
      url.searchParams.append("_media", "true");
      url.searchParams.append("page", String(page));
      url.searchParams.append("limit", String(limit));

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": `${API_KEY}`,
        },
      };
      const accessToken = localStorage.getItem("token");
      if (accessToken) {
        options.headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await this._request(
        url.toString(),
        options,
        `Error fetching listings page ${page}`
      );

      const pageData = Array.isArray(res) ? res : res?.data ?? [];
      if (!Array.isArray(pageData) || pageData.length === 0) break;

      aggregated.push(...pageData);
      try {
        if (typeof onPage === "function") {
          // give callers the raw page data and page number
          onPage(pageData, page);
        }
      } catch (e) {
        // ignore errors from user callback
        console.error("onPage callback error", e);
      }

      if (pageData.length < limit) break;
      if (Number.isFinite(maxPages) && page >= Number(maxPages)) break;
      page += 1;
    }

    return aggregated;
  }

  async getListingById(listingId) {
    try {
      const url = new URL(`${API_LISTINGS}/${listingId}`);
      url.searchParams.append("_bids", "true"); // Include the _bids parameter
      url.searchParams.append("_seller", "true"); // Include the _seller parameter
      url.searchParams.append("_id", listingId); // Include the _id parameter

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": `${API_KEY}`,
        },
      };
      // If logged in, add Authorization header
      const accessToken = localStorage.getItem("token");
      if (accessToken) {
        options.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return await this._request(
        url.toString(),
        options,
        "Error fetching listing by ID"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteListing(listingId) {
    const accessToken = this._getRequiredAccessToken();
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": `${API_KEY}`,
      },
    };
    return await this._request(
      `${API_LISTINGS}/${listingId}`,
      options,
      "Error deleting listing"
    );
  }

  async bidOnListing(listingId, bidAmount) {
    try {
      const url = new URL(`${API_LISTINGS}/${listingId}/bids`);
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": `${API_KEY}`,
        },
        body: JSON.stringify({ amount: bidAmount }),
      };
      // If logged in, add Authorization header
      const accessToken = localStorage.getItem("token");
      if (accessToken) {
        options.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return await this._request(url.toString(), options, "Error placing bid");
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Fetches bids for a user profile.
   * @param {string} name - The user's name.
   * @returns {Promise<any>} User data.
   */

  async getBidsByProfile(name) {
    const accessToken = this._getRequiredAccessToken();
    const url = new URL(`${API_PROFILES}/${name}/bids`);
    url.searchParams.append("_bids", "true");
    url.searchParams.append("_seller", "true");
    url.searchParams.append("_listings", "true");

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
      },
    };
    return await this._request(
      url.toString(),
      options,
      "Error fetching bids by profile"
    );
  }

  /**
   * Fetches wins for a user profile.
   * @param {string} name - The user's name.
   * @returns {Promise<any>} User data.
   */

  async getWinsByProfile(name) {
    const accessToken = this._getRequiredAccessToken();
    const url = new URL(`${API_PROFILES}/${name}/wins`);
    url.searchParams.append("_bids", "true");
    url.searchParams.append("_seller", "true");
    url.searchParams.append("_listings", "true");

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
      },
    };
    return await this._request(
      url.toString(),
      options,
      "Error fetching bids by profile"
    );
  }

  /**
   * Creates a new listing.
   * @param {string} title - The title of the listing.
   * @param {string} description - The description of the listing.
   * @param {number} endsAt - The ending date and time of the listing.
   * @param {string} media - The URL of the listing image.
   * @param {string} tags - The tags associated with the listing.
   * @returns {Promise<any>} The created listing data.
   */
  async createListing(title, description, endsAt, media, tags) {
    const accessToken = this._getRequiredAccessToken();

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
      },
      body: JSON.stringify({
        title,
        description,
        endsAt: endsAt,
        media: Array.isArray(media) ? media : media ? [media] : [],
        tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      }),
    };

    return await this._request(API_LISTINGS, options, "Error creating listing");
  }

  /**
   * Updates a listing by ID.
   * @param {string} listingId - The ID of the listing.
   * @param {string} title - The title of the listing.
   * @param {string} description - The description of the listing.
   * @param {number} endsAt - The starting bid amount.
   * @param {string} media - The URL of the listing image.
   * @returns {Promise<any>} The updated listing data.
   */
  async updateListing(listingId, title, description, endsAt, media, tags) {
    const accessToken = this._getRequiredAccessToken();

    const normalizedMedia = Array.isArray(media) ? media : media ? [media] : [];
    const normalizedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];

    // Prepare the data to send in the request body
    const data = {
      title,
      description,
      endsAt: endsAt,
      media: normalizedMedia,
      tags: normalizedTags,
    };

    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
      },
      body: JSON.stringify(data),
    };

    // Send the request to the API to update the listing
    return await this._request(
      `${API_LISTINGS}/${listingId}`,
      options,
      "Error updating listing"
    );
  }

  /**
   * Deletes a listing by ID.
   * @param {string} listingId - The ID of the listing.
   * @returns {Promise<void>}
   */
  async deleteListing(listingId) {
    const accessToken = this._getRequiredAccessToken();
    const options = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
      },
    };
    try {
      const response = await fetch(`${API_LISTINGS}/${listingId}`, options);
      if (!response.ok) {
        const errorMessage = "Failed to delete listing";
        throw new Error(`${errorMessage}. Status: ${response.status}`);
      }
      return;
    } catch (error) {
      throw error;
    }
  }
}

