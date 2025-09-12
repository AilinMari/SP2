import { detachCountdown } from "../utils/countdown.js";

// mountCarousel(root, items, renderItem, opts)
// - root: DOM element to host the carousel
// - items: array of data
// - renderItem: function(item) -> HTMLElement (should return a node for the track)
// - opts: { itemWidth, gap }
export function mountCarousel(root, items, renderItem, opts = {}) {
  if (!root) return { destroy: () => {} };

  const gap = typeof opts.gap === "number" ? opts.gap : 16;
  const itemWidth = opts.itemWidth || "min(380px, 92vw)";

  // Detach any countdowns inside root before replacing content
  try {
    if (root.querySelectorAll) {
      root.querySelectorAll(".listing-ends-at").forEach((el) => {
        try {
          detachCountdown(el);
        } catch (e) {
          // ignore
        }
      });
    }
  } catch (e) {
    // ignore
  }

  // Clear host
  root.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "carousel-wrapper relative";

  const prev = document.createElement("button");
  prev.className = "carousel-btn carousel-prev";
  prev.setAttribute("aria-label", "Previous");
  prev.textContent = "<";

  const next = document.createElement("button");
  next.className = "carousel-btn carousel-next";
  next.setAttribute("aria-label", "Next");
  next.textContent = ">";

  const track = document.createElement("div");
  track.className = "carousel-track flex gap-4 overflow-x-auto scroll-smooth";
  track.style.scrollSnapType = "x mandatory";

  // Render items
  items.forEach((itemData) => {
    const node = renderItem(itemData);
    if (!node) return;
    // Ensure item has carousel-item styles
    node.classList.add(
      "carousel-item",
      "flex-shrink-0",
      "scroll-snap-align-start"
    );
    // only set style.width if not already set
    if (!node.style.width) node.style.width = itemWidth;
    track.appendChild(node);
  });

  wrapper.appendChild(prev);
  wrapper.appendChild(track);
  wrapper.appendChild(next);

  // pagination dots
  const dots = document.createElement("div");
  dots.className = "carousel-dots flex gap-2 justify-center mt-2";
  root.appendChild(wrapper);
  root.appendChild(dots);

  function scrollBy(direction) {
    const card = track.querySelector(".carousel-item");
    if (!card) return;
    const width = card.getBoundingClientRect().width + gap;
    track.scrollBy({ left: direction * width, behavior: "smooth" });
  }

  const onPrev = () => scrollBy(-1);
  const onNext = () => scrollBy(1);
  prev.addEventListener("click", onPrev);
  next.addEventListener("click", onNext);
  // build dots and wire interactions
  function buildDots() {
    dots.innerHTML = "";
    const cards = Array.from(track.querySelectorAll(".carousel-item"));
    cards.forEach((card, idx) => {
      const btn = document.createElement("button");
      btn.className = "carousel-dot w-2 h-2 rounded-full bg-gray-300";
      btn.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      btn.addEventListener("click", () => {
        const left = card.offsetLeft;
        track.scrollTo({ left, behavior: "smooth" });
      });
      dots.appendChild(btn);
    });
    updateActiveDot();
  }

  let dotUpdateTimer = null;
  function updateActiveDot() {
    const cards = Array.from(track.querySelectorAll(".carousel-item"));
    if (!cards.length) return;
    // find center-most visible card
    const trackRect = track.getBoundingClientRect();
    let bestIdx = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(
        cardCenter - (trackRect.left + trackRect.width / 2)
      );
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });
    const dotButtons = Array.from(dots.children);
    dotButtons.forEach((b, i) => b.classList.toggle("active", i === bestIdx));
  }

  track.addEventListener("scroll", () => {
    if (dotUpdateTimer) clearTimeout(dotUpdateTimer);
    dotUpdateTimer = setTimeout(updateActiveDot, 120);
  });

  // refresh logic: set widths and rebuild dots
  function refresh() {
    const cards = Array.from(track.querySelectorAll(".carousel-item"));
    cards.forEach((node) => {
      if (itemWidth) node.style.width = itemWidth;
    });
    buildDots();
    updateActiveDot();
  }

  // wait for images to load inside the carousel, then refresh
  (function waitForImages() {
    const imgs = Array.from(root.querySelectorAll("img"));
    if (imgs.length === 0) {
      // nothing to wait for
      setTimeout(refresh, 0);
      return;
    }
    let remaining = imgs.length;
    imgs.forEach((img) => {
      if (img.complete) {
        remaining -= 1;
      } else {
        img.addEventListener("load", () => {
          remaining -= 1;
          if (remaining <= 0) refresh();
        });
        img.addEventListener("error", () => {
          remaining -= 1;
          if (remaining <= 0) refresh();
        });
      }
    });
    // fallback: ensure refresh happens after 1s even if some images hang
    setTimeout(() => refresh(), 1000);
  })();

  return {
    destroy() {
      prev.removeEventListener("click", onPrev);
      next.removeEventListener("click", onNext);
      try {
        if (root.querySelectorAll) {
          root.querySelectorAll(".listing-ends-at").forEach((el) => {
            try {
              detachCountdown(el);
            } catch (e) {
              // ignore
            }
          });
        }
      } catch (e) {
        // ignore
      }
      root.innerHTML = "";
    },
    refresh,
  };
}
