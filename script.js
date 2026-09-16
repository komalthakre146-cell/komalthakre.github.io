const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 50, 300)}ms`;
    observer.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

const workGrid = document.getElementById("work-grid");
const workCount = document.getElementById("work-count");
const filterButtons = document.querySelectorAll(".filter-btn");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxType = document.getElementById("lightbox-type");
const lightboxClient = document.getElementById("lightbox-client");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");

let portfolioItems = [];
let visibleItems = [];
let activeFilter = "all";
let lightboxIndex = 0;

function matchesFilter(item, filter) {
  if (filter === "all") return true;
  return item.client === filter || item.category === filter;
}

function renderWorkGrid() {
  if (!workGrid) return;

  workGrid.innerHTML = "";
  visibleItems = portfolioItems.filter((item) => matchesFilter(item, activeFilter));

  visibleItems.forEach((item, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "work-card";
    card.dataset.index = String(index);
    card.innerHTML = `
      <div class="work-card-media">
        <img src="${item.thumb}" alt="${item.title} — ${item.clientLabel}" loading="lazy" width="640" height="480" />
      </div>
      <div class="work-card-body">
        <p class="work-card-type">${item.type}</p>
        <h3 class="work-card-title">${item.title}</h3>
        <p class="work-card-client">${item.clientLabel}</p>
      </div>
    `;
    card.addEventListener("click", () => openLightbox(index));
    workGrid.appendChild(card);
  });

  if (workCount) {
    workCount.textContent = `${visibleItems.length} project${visibleItems.length === 1 ? "" : "s"}`;
  }
}

function setFilter(filter) {
  activeFilter = filter;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  renderWorkGrid();
}

function openLightbox(index) {
  if (!lightbox || !visibleItems.length) return;
  lightboxIndex = index;
  updateLightbox();
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function updateLightbox() {
  const item = visibleItems[lightboxIndex];
  if (!item) return;

  lightboxImage.src = item.image;
  lightboxImage.alt = `${item.title} — ${item.clientLabel}`;
  lightboxTitle.textContent = item.title;
  lightboxType.textContent = item.type;
  lightboxClient.textContent = item.clientLabel;
}

function stepLightbox(direction) {
  if (!visibleItems.length) return;
  lightboxIndex = (lightboxIndex + direction + visibleItems.length) % visibleItems.length;
  updateLightbox();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter || "all"));
});

lightbox?.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", closeLightbox);
});

lightboxPrev?.addEventListener("click", () => stepLightbox(-1));
lightboxNext?.addEventListener("click", () => stepLightbox(1));

document.addEventListener("keydown", (event) => {
  if (lightbox?.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") stepLightbox(-1);
  if (event.key === "ArrowRight") stepLightbox(1);
});

async function initPortfolio() {
  if (!workGrid) return;

  // Portfolio data is embedded in assets/portfolio/portfolio-data.js (as PORTFOLIO_ITEMS)
  // so the gallery works even when this page is opened directly as a local file, where
  // browsers block fetch() of local JSON. Fall back to fetching manifest.json if that
  // script wasn't loaded for some reason (e.g. running from a server without it).
  if (typeof PORTFOLIO_ITEMS !== "undefined") {
    portfolioItems = PORTFOLIO_ITEMS;
    renderWorkGrid();
    return;
  }

  try {
    const response = await fetch("assets/portfolio/manifest.json");
    portfolioItems = await response.json();
    renderWorkGrid();
  } catch {
    workGrid.innerHTML = `<p class="work-count">Portfolio images could not be loaded. Open the site through a local server.</p>`;
  }
}

initPortfolio();
