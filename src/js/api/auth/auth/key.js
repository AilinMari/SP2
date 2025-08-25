import { API_AUTH_KEY } from "../../constants";

/**
 * Requests a new API key and stores it in localStorage.
 *
 * @returns {Promise<Object>} The response containing the API key.
 * @throws {Error} If the API request fails.
 */

export async function createApiKey() {
  try {
    const response = await _request(API_AUTH_KEY, "POST", {});

    if (response && response.key) {
      localStorage.setItem("noroffApiKey", response.key);
    } else {
      console.warn("API key response did not contain a key:", response);
    }

    return response;
  } catch (error) {
    console.error("Error creating API key:", error);
    throw error;
  }
}
