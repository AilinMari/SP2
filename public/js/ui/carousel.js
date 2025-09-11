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
    node.classList.add("carousel-item", "flex-shrink-0", "scroll-snap-align-start");
    // only set style.width if not already set
    if (!node.style.width) node.style.width = itemWidth;
    track.appendChild(node);
  });

  wrapper.appendChild(prev);
  wrapper.appendChild(track);
  wrapper.appendChild(next);
  root.appendChild(wrapper);

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
  };
}
