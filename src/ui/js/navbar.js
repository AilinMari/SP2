import { AuctionApi } from "../../js/api/apiClient";

const auctionApi = new AuctionApi();

const token = localStorage.getItem("token");

const loginLink = document.querySelector(".login-link");
const signUpLink = document.querySelector(".sign-up");
const or = document.querySelector(".or");
const logoutButton = document.querySelector("#logout");
const homeLink = document.querySelector(".home");
const profileLink = document.querySelector(".profile");
const myBidsLink = document.querySelector(".my-bids");

if (token) {
  loginLink.style.display = "none";
  signUpLink.style.display = "none";
  or.style.display = "none";
  logoutButton.style.display = "block";
  homeLink.style.display = "block";
  profileLink.style.display = "block";
  myBidsLink.style.display = "block";
} else {
  loginLink.style.display = "block";
  signUpLink.style.display = "block";
  logoutButton.style.display = "none";
  homeLink.style.display = "none";
  profileLink.style.display = "none";
  myBidsLink.style.display = "none";
}


