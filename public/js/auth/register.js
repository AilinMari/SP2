import { API_AUTH_REGISTER } from "../constants.js";

export async function register({ name, email, password }) {
  try {
    const payload = { name, email, password };

    const response = await fetch(API_AUTH_REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData); // Log the full API error response
      const errorMessage =
        errorData.errors && errorData.errors.length > 0
          ? errorData.errors[0].message
          : response.statusText;
      throw new Error(`Registration failed: ${errorMessage}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error during registration:", error.message);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("form[name='register']")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("full-name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        await register({ name, email, password });
        // Redirect to login page after successful registration//
        window.location.href = "/login.html";
        //   window.location.href = "/";
      } catch (error) {
        // Display error message to the user
        console.error("Registration error:", error);
        //   const registerFailed = document.querySelector(".registerFailed");
        if (registerFailed) {
          registerFailed.textContent =
            error.message || "Registration failed. Please try again.";
          registerFailed.style.color = "red";
        }
      }
    });
});
