document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.querySelector("#logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      try {
        // Clear user data from local storage
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("accessToken");

        localStorage.removeItem("apiKey");
        localStorage.removeItem("avatar");

        // Redirect to the login page
        window.location.href = "/auth/login/";
      } catch (error) {
        console.error("Error during logout:", error.message);
      }
    });
  }
});
