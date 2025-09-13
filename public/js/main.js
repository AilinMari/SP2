
window.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.style.transition = "opacity 0.3s";
    overlay.style.opacity = "0";
    setTimeout(() => (overlay.style.display = "none"), 300);
  }
});
