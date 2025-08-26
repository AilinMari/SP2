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

  async getUserProfile(username) {
    try {
      const accessToken = this._getRequiredAccessToken();
      const url = new URL(`${API_PROFILES}/${username}`);
      url.searchParams.append("_posts", "true"); // Include the _posts parameter
      url.searchParams.append("_author", "true"); // Include the _author parameter
      url.searchParams.append("_avatar", "true"); // Include the _avatar parameter
      url.searchParams.append("_banner", "true"); // Include the _banner parameter

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

  async getUserProfileByAuthor(author) {
    try {
      if (!author) {
        throw new Error("Author parameter is missing.");
      }

      const url = new URL(`${API_PROFILES}/${author}`);
      url.searchParams.append("_posts", "true"); // Include posts
      url.searchParams.append("_author", "true"); // Include author details
      url.searchParams.append("_avatar", "true"); // Include avatar details
      url.searchParams.append("_banner", "true"); // Include banner details

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
      console.error("Error in getUserProfileByauthor:", error);
      throw error;
    }
  }

  async getAllPostsByAuthor(author) {
    try {
      if (!author) {
        throw new Error("Author parameter is missing.");
      }

      const url = new URL(`${API_PROFILES}/${author}/posts`);
      url.searchParams.append("_author", "true"); // Include the _author parameter
      url.searchParams.append("_media", "true"); // Include the _media parameter
      url.searchParams.append("_tags", "true"); // Include the _tags parameter
      url.searchParams.append("_body", "true"); // Include the _body parameter
      url.searchParams.append("_title", "true"); // Include the _title parameter
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
      console.error("Error in getAllPostsByAuthor:", error);
      throw error;
    }
  }

  async getPostsByLoggedInUser() {
    const accessToken = this._getRequiredAccessToken();
    const username = localStorage.getItem("name"); // Get the username from local storage
    const url = new URL(`${API_PROFILES}/${username}/posts`);

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
      },
    };

    // Rettet: Bruk username i loggen i stedet for author

    return await this._request(
      url.toString(),
      options,
      "Error fetching user posts"
    );
  }

  /**
   * Fetches all blog posts.
   * @returns {Promise<any>} An array of listings.
   */
  async getAllListings() {
    let options = {
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
      API_LISTINGS + "?_author=true",
      options,
      "Error fetching listings"
    );
    return data;
  }

  async getListingById(listingId) {
    try {
      const url = new URL(`${API_LISTINGS}/${listingId}`);
      url.searchParams.append("_id", listingId); // Include the _id parameter

      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": `${API_KEY}`, // Include the API key
        },
      };
 // If logged in, add Authorization header
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      options.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const { data } = await this._request(
      API_LISTINGS + "?_author=true",
      options,
      "Error fetching listings"
    );
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
