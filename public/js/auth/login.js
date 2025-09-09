import { AuctionApi } from "../apiClient.js";
const apiClient = new AuctionApi();

document
  .querySelector("form[name='login']")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
      const data = await apiClient.login(email, password); // Use youStoryApi's login method
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("name", data.name); // Store the logged-in user's name

      window.location.href = "/"; // Redirect to the main page after successful login
    } catch (error) {
      alert(
        error.message || "Login failed. Please check your username or password."
      );
    }
  });
