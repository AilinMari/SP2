# Golden Bid (SP2)

Golden Bid is a semester project: a front-end auction web application where users can register, create listings, bid on items, and manage profile activity.

## Features

- User registration and login
- Create and update auction listings
- Place bids on active listings
- Browse all listings and view single listing details
- Profile pages for own activity and other users
- Search and filter support for listings/profiles
- Responsive UI styled with Tailwind CSS

## Tech Stack

- HTML
- Vanilla JavaScript (ES Modules)
- Tailwind CSS
- PostCSS + Autoprefixer
- Node.js (local static server)

## Project Structure

- `public/` – HTML pages, compiled CSS, images, and browser JavaScript modules
- `src/css/styles.css` – Tailwind source stylesheet
- `scripts/serve.js` – local Node server used in development

## Technical Details

### Architecture

- Multi-page front-end app (MPA) where each page loads only its required module(s)
- Browser-side code uses ES Modules with feature-based folders:
  - `js/auth/*` for authentication
  - `js/listings/*` for listing create/read/update flows
  - `js/bids/*` for bidding logic
  - `js/myprofile/*` and `js/profiles/*` for profile views
  - `js/ui/*` for shared UI utilities (navbar/logout/carousel)

### API Integration

- Centralized API wrapper in `public/js/apiClient.js` (`AuctionApi` class)
- Shared request helper handles HTTP errors and JSON parsing
- Authenticated requests use Bearer token from `localStorage`
- API base: Noroff v2 (`https://v2.api.noroff.dev`)
- Uses required `X-Noroff-API-Key` header for API requests

### State & Session

- Client-side session data stored in `localStorage`
  - `token` for auth
  - `name` and `avatar` for current user identity
- Page modules read session data on load and update UI conditionally

### Styling Pipeline

- Source styles: `src/css/styles.css`
- Output styles: `public/styles.css`
- Tailwind build command:
  - `npx tailwindcss -i ./src/css/styles.css -o ./public/styles.css --minify`

### Development Server

- `scripts/serve.js` is a custom Node HTTP server
- Serves `public/` as web root and mounts `src/` at `/src/`
- Includes path normalization checks to prevent path traversal
- Resolves content types via extension-based MIME mapping

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run (development)

```bash
npm run dev
```

This runs:

- Tailwind in watch mode
- Local server on `http://localhost:5173`

### Build CSS

```bash
npm run build
```

## Available Scripts

- `npm run build:css` – compile and minify Tailwind CSS to `public/styles.css`
- `npm run watch:css` – watch and rebuild CSS on changes
- `npm run start` – start local Node server
- `npm run dev` – run CSS watcher and server in parallel

## Notes

- Main entry page: `public/index.html`
- This project is designed as a multi-page front-end app served from the `public` folder.
