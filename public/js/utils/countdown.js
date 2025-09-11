export function attachCountdown(el, endDate) {
  // endDate can be a Date object or a value accepted by `new Date()`
  const target = endDate instanceof Date ? endDate : new Date(endDate);
  if (!target || isNaN(target.getTime())) {
    el.textContent = "Auction ended";
    return () => {};
  }

  function formatRemaining(ms) {
    const total = Math.floor(ms / 1000);
    if (total <= 0) return null;
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    // If less than 1 minute, show seconds only
    if (total < 60) return `${seconds}s`;
    // If less than 1 hour, show minutes only (user preference)
    if (total < 3600) return `${minutes}m`;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(" ");
  }

  let timer = null;

  function update() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      el.textContent = "Auction ended";
      clearInterval(timer);
      return;
    }
    const human = formatRemaining(diff);
    el.textContent = `${human}`;
  }

  update();
  timer = setInterval(update, 1000);
  // store disposer on the element so callers can clean up when removing nodes
  const disposer = () => {
    clearInterval(timer);
    if (el && el._countdownDispose === disposer) delete el._countdownDispose;
  };
  if (el) el._countdownDispose = disposer;
  return disposer;
}

export function detachCountdown(el) {
  if (!el) return;
  const d = el._countdownDispose;
  if (typeof d === "function") d();
}
