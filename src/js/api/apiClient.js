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
      url.searchParams.append("_name", "true"); // Include the _name parameter
      url.searchParams.append("_avatar", "true"); // Include avatar details
      url.searchParams.append("_banner", "true"); // Include banner details
      url.searchParams.append("_listings", "true"); // Include listings
      url.searchParams.append("_media", "true"); // Include media details if needed

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._getRequiredAccessToken()}`,
          "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
        },
      };

      return await this._request(
        url.toString(),
        options,
        "Error fetching user profile"
      );
    } catch (error) {
      console.error("Error in getUserProfileByname:", error);
      throw error;
    }
  }

  async getAllListingsByName(name) {
    try {
      if (!name) {
        throw new Error("Name parameter is missing.");
      }

      const url = new URL(`${API_PROFILES}/${name}/listings`);
      // url.searchParams.append("_name", "true"); // Include the _name parameter
      // url.searchParams.append("_title", "true"); // Include the _title parameter
      url.searchParams.append("_media", "true"); // Include the _media parameter
      url.searchParams.append("_tags", "true"); // Include the _tags parameter
      url.searchParams.append("_description", "true"); // Include the _description parameter

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._getRequiredAccessToken()}`,
          "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
        },
      };

      return await this._request(
        url.toString(),
        options,
        "Error fetching user posts"
      );
    } catch (error) {
      console.error("Error in getAllPostsByName:", error);
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
      API_LISTINGS + "?_bids=true" + "&_seller=true",
      options,
      "Error fetching listings"
    );
    return data;
  }

  async getListingById(listingId) {
    try {
      const url = new URL(`${API_LISTINGS}/${listingId}`);
      url.searchParams.append("_bids", "true"); // Include the _bids parameter
      url.searchParams.append("?_seller", "true"); // Include the _seller parameter
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
}
