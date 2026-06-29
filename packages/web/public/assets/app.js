const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const filters = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll("[data-tags]");
const searchInput = document.querySelector("[data-research-search]");
const searchResults = document.querySelector("[data-search-results]");
const searchIndexNode = document.querySelector("[data-search-index]");
const savedSummary = document.querySelector("[data-saved-summary]");
const articleCards = [...document.querySelectorAll("[data-article-card]")];
const savedKey = "sansara.savedArticles";
const readKey = "sansara.readItems";
let activeFilter = "all";
let searchIndex = [];

function requestedFilterFromUrl() {
  const searchFilter = new URLSearchParams(window.location.search).get("filter");
  const hash = window.location.hash.replace(/^#/, "");
  const hashFilter = hash.startsWith("filter=")
    ? new URLSearchParams(hash).get("filter")
    : "";
  return searchFilter || hashFilter || "all";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

if (searchIndexNode) {
  try {
    searchIndex = JSON.parse(searchIndexNode.textContent || "[]");
  } catch {
    searchIndex = [];
  }
}

function savedArticles() {
  return storage.get(savedKey, []);
}

function readItems() {
  return storage.get(readKey, []);
}

function setSavedArticles(items) {
  storage.set(savedKey, items);
  updateContentState();
}

function setReadItems(items) {
  storage.set(readKey, items);
  updateContentState();
}

function updateContentState() {
  const saved = savedArticles();
  const read = readItems();
  document.querySelectorAll("[data-bookmark]").forEach((button) => {
    const route = button.dataset.bookmark;
    const isSaved = saved.includes(route);
    button.dataset.defaultLabel ||= button.textContent.trim() || "Bookmark";
    button.classList.toggle("saved", isSaved);
    button.textContent = isSaved
      ? button.dataset.bookmarkSavedLabel || "Bookmarked"
      : button.dataset.bookmarkLabel || button.dataset.defaultLabel;
    button.setAttribute("aria-pressed", String(isSaved));
  });
  document.querySelectorAll("[data-read-flag]").forEach((button) => {
    const route = button.dataset.readFlag;
    const isRead = read.includes(route);
    button.dataset.defaultLabel ||= button.textContent.trim() || "Read already";
    button.classList.toggle("read", isRead);
    button.textContent = isRead
      ? button.dataset.readSavedLabel || "Read"
      : button.dataset.readLabel || button.dataset.defaultLabel;
    button.setAttribute("aria-pressed", String(isRead));
  });
  document.querySelectorAll("[data-content-card], [data-article-card]").forEach((card) => {
    const route = card.dataset.route
      || card.querySelector("[data-read-flag]")?.dataset.readFlag
      || card.querySelector("[data-bookmark]")?.dataset.bookmark;
    card.classList.toggle("read-already", Boolean(route && read.includes(route)));
  });
  if (savedSummary) {
    savedSummary.textContent = `Saved items: ${saved.length} · Read already: ${read.length}`;
  }
}

function applyResearchFilters() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  articleCards.forEach((card) => {
    const tags = (card.dataset.tags || "").split("|");
    const text = card.textContent.toLowerCase();
    const matchesFilter = activeFilter === "all" || tags.includes(activeFilter);
    const matchesSearch = !query || text.includes(query);
    card.classList.toggle("hidden", !matchesFilter || !matchesSearch);
  });
  renderSearchResults(query);
}

function renderSearchResults(query) {
  if (!searchResults) return;
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    searchResults.innerHTML = "";
    return;
  }
  const activeMatches = searchIndex
    .filter((item) => {
      const haystack = `${item.title} ${item.type} ${item.text} ${(item.tags || []).join(" ")}`.toLowerCase();
      const matchesQuery = haystack.includes(normalized);
      const matchesFilter = activeFilter === "all" || (item.tags || []).includes(activeFilter);
      return matchesQuery && matchesFilter;
    })
    .slice(0, 8);
  searchResults.innerHTML = activeMatches.length
    ? activeMatches.map((item) => `<a class="search-result" href="${item.href}">
        <span>${escapeHtml(item.type)}${item.minutes ? ` · ${item.minutes} min` : ""}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml((item.tags || []).slice(0, 3).join(" · "))}</small>
      </a>`).join("")
    : `<p class="empty-state">No research matched that search.</p>`;
}

function setActiveResearchFilter(value = "all", updateUrl = false) {
  const matchingFilter = [...filters].find((button) => button.dataset.filter === value) || filters[0];
  if (!matchingFilter) return;
  activeFilter = matchingFilter.dataset.filter || "all";
  filters.forEach((item) => item.classList.toggle("active", item === matchingFilter));
  if (updateUrl && window.location.pathname.startsWith("/research/")) {
    const url = new URL(window.location.href);
    if (activeFilter === "all") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", activeFilter);
    }
    url.hash = "research-tools";
    window.history.replaceState({}, "", url);
  }
  applyResearchFilters();
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveResearchFilter(button.dataset.filter, true);
  });
});

if (filters.length) {
  setActiveResearchFilter(requestedFilterFromUrl());
}

document.querySelectorAll("[data-filter-tag]").forEach((tag) => {
  tag.addEventListener("click", (event) => {
    const value = tag.dataset.filterTag;
    const matchingFilter = [...filters].find((button) => button.dataset.filter === value);
    if (!matchingFilter || !searchInput) return;
    event.preventDefault();
    matchingFilter.click();
    document.querySelector("#research-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

searchInput?.addEventListener("input", applyResearchFilters);

const journeyDockLinks = [...document.querySelectorAll("[data-journey-dock-link]")];

function setActiveJourneyDock(targetId = "") {
  if (!journeyDockLinks.length || !targetId) return;
  journeyDockLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.target === targetId);
  });
}

document.querySelectorAll("[data-journey-artifact]").forEach((artifact) => {
  const points = [...artifact.querySelectorAll("[data-journey-point]")];
  const detail = artifact.querySelector("[data-journey-detail]");
  const tour = artifact.querySelector("[data-journey-tour]");
  let tourTimer = null;

  const setJourneyAct = (point) => {
    if (!point || !detail) return;
    points.forEach((item) => {
      const isActive = item === point;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-expanded", String(isActive));
    });
    setActiveJourneyDock(point.dataset.target || "");
    detail.classList.add("is-changing");
    window.setTimeout(() => {
      const label = point.querySelector("span")?.textContent || "";
      detail.querySelector("span").textContent = `Act ${label}`;
      detail.querySelector("h2").textContent = point.dataset.title || "";
      detail.querySelector("p").textContent = point.dataset.description || "";
      detail.classList.remove("is-changing");
    }, 120);
  };

  points.forEach((point) => {
    point.addEventListener("pointerenter", () => setJourneyAct(point));
    point.addEventListener("focus", () => setJourneyAct(point));
    point.addEventListener("click", () => {
      setJourneyAct(point);
      const target = document.getElementById(point.dataset.target || "");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  tour?.addEventListener("click", () => {
    window.clearInterval(tourTimer);
    let index = 0;
    setJourneyAct(points[index]);
    tourTimer = window.setInterval(() => {
      index += 1;
      if (index >= points.length) {
        window.clearInterval(tourTimer);
        return;
      }
      setJourneyAct(points[index]);
    }, 1300);
  });
});

journeyDockLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.dataset.target || "";
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    setActiveJourneyDock(targetId);
    const matchingPoint = [...document.querySelectorAll("[data-journey-point]")]
      .find((point) => point.dataset.target === targetId);
    matchingPoint?.dispatchEvent(new Event("focus"));
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState({}, "", `#${targetId}`);
  });
});

if (journeyDockLinks.length) {
  const actSections = journeyDockLinks
    .map((link) => document.getElementById(link.dataset.target || ""))
    .filter(Boolean);
  const updateDockFromScroll = () => {
    const visibleSections = actSections.filter((section) => !section.classList.contains("hidden"));
    const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    const active = nearBottom
      ? visibleSections[visibleSections.length - 1]
      : [...visibleSections].reverse()
      .find((section) => section.getBoundingClientRect().top <= 285) || actSections[0];
    setActiveJourneyDock(active?.id || "");
  };
  window.addEventListener("scroll", updateDockFromScroll, { passive: true });
  document.addEventListener("scroll", updateDockFromScroll, { passive: true });
  updateDockFromScroll();
}

function setIssueThemeFilter(value = "all") {
  document.querySelectorAll("[data-issue-card]").forEach((card) => {
    const tags = (card.dataset.tags || "").split("|");
    card.classList.toggle("hidden", value !== "all" && !tags.includes(value));
  });
}

setIssueThemeFilter("all");

document.addEventListener("click", (event) => {
  const previewButton = event.target.closest("[data-preview-toggle]");
  if (previewButton) {
    const card = previewButton.closest("[data-article-card]");
    const preview = card?.querySelector("[data-preview]");
    if (preview) {
      const isOpen = !preview.hidden;
      preview.hidden = isOpen;
      previewButton.textContent = isOpen ? "Preview" : "Close preview";
      card.classList.toggle("preview-open", !isOpen);
    }
  }

  const bookmarkButton = event.target.closest("[data-bookmark]");
  if (bookmarkButton) {
    const route = bookmarkButton.dataset.bookmark;
    if (!route) return;
    const saved = savedArticles();
    setSavedArticles(saved.includes(route) ? saved.filter((item) => item !== route) : [...saved, route]);
  }

  const readButton = event.target.closest("[data-read-flag]");
  if (readButton) {
    const route = readButton.dataset.readFlag;
    if (!route) return;
    const read = readItems();
    setReadItems(read.includes(route) ? read.filter((item) => item !== route) : [...read, route]);
  }
});

const progress = document.querySelector("[data-progress]");
const currentReading = document.querySelector("[data-current-reading]");
const readingSections = [...document.querySelectorAll("main section, .article-body h2, .article-body h3")]
  .filter((item) => item.matches("h2, h3") || item.querySelector("h1, h2, h3") || item.getAttribute("aria-label"));
if (progress || currentReading) {
  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const percent = Math.max(0, Math.min(1, scrollTop / max)) * 100;
    if (progress) progress.style.width = `${percent}%`;
    if (currentReading) {
      const active = [...readingSections].reverse().find((item) => item.getBoundingClientRect().top <= 140);
      const label = active?.querySelector?.("h1, h2, h3")?.textContent || active?.getAttribute("aria-label") || document.title;
      currentReading.querySelector("strong").textContent = label.trim().slice(0, 72);
      currentReading.querySelector("small").textContent = `${Math.round(percent)}%`;
    }
  };
  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

const counters = document.querySelectorAll("[data-counter]");
if (counters.length) {
  const animateCounter = (counter) => {
    const target = Number(counter.dataset.counter || "0");
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const progressValue = Math.min(1, (now - start) / duration);
      counter.textContent = String(Math.round(target * progressValue));
      if (progressValue < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return;
      entry.target.dataset.counted = "true";
      animateCounter(entry.target);
    });
  }, { threshold: 0.4 });
  counters.forEach((counter) => observer.observe(counter));
}

const modal = document.querySelector("[data-subscribe-modal]");
const openSubscribe = document.querySelector("[data-open-subscribe]");
const subscribeForm = document.querySelector("[data-journal-subscribe]");

function showSubscribe() {
  if (!modal) return;
  modal.hidden = false;
  modal.querySelector("input[name='email']")?.focus();
}

function closeSubscribe() {
  if (modal) modal.hidden = true;
}

openSubscribe?.addEventListener("click", showSubscribe);
document.querySelectorAll("[data-close-subscribe]").forEach((button) => button.addEventListener("click", closeSubscribe));

if (modal && !storage.get("sansara.subscribeSeen", false)) {
  window.setTimeout(() => {
    storage.set("sansara.subscribeSeen", true);
    showSubscribe();
  }, 1600);
}

subscribeForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(subscribeForm);
  const email = formData.get("email") || "";
  const name = formData.get("name") || "";
  const interest = formData.get("interest") || "";
  storage.set("sansara.journalSubscriber", { email, name, interest, savedAt: new Date().toISOString() });
  const note = subscribeForm.querySelector("[data-subscribe-note]");
  if (note) note.textContent = "You are on the local mailing list draft. An email draft is opening so this can be added to the real list.";
  window.location.href = `mailto:hello@braininnovation.club?subject=${encodeURIComponent("Sansara research journal subscription")}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nInterest: ${interest}`)}`;
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select")) return;
  if (event.key === "/") {
    event.preventDefault();
    searchInput?.focus();
  }
  if (event.key.toLowerCase() === "s") {
    event.preventDefault();
    showSubscribe();
  }
  if (event.key === "Escape") {
    closeSubscribe();
    document.querySelectorAll("[data-preview]").forEach((preview) => {
      preview.hidden = true;
      preview.closest("[data-article-card]")?.classList.remove("preview-open");
    });
    document.querySelectorAll("[data-preview-toggle]").forEach((button) => {
      button.textContent = "Preview";
    });
  }
  if (event.key.toLowerCase() === "j" || event.key.toLowerCase() === "k") {
    const visibleCards = articleCards.filter((card) => !card.classList.contains("hidden"));
    if (!visibleCards.length) return;
    const currentIndex = Math.max(0, visibleCards.indexOf(document.activeElement.closest?.("[data-article-card]")));
    const nextIndex = event.key.toLowerCase() === "j"
      ? Math.min(visibleCards.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);
    visibleCards[nextIndex].focus();
  }
  if (event.key.toLowerCase() === "b") {
    const focusedCard = document.activeElement.closest?.("[data-content-card], [data-article-card]");
    focusedCard?.querySelector("[data-bookmark]")?.click();
  }
  if (event.key.toLowerCase() === "r") {
    const focusedCard = document.activeElement.closest?.("[data-content-card], [data-article-card]");
    focusedCard?.querySelector("[data-read-flag]")?.click();
  }
});

document.querySelectorAll("a[href^='/'], a[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href") || "";
    if (href.startsWith("#")) return;
    if (link.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    document.documentElement.classList.add("page-leaving");
  });
});

const trainingForm = document.querySelector("[data-training-form]");
if (trainingForm) {
  trainingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(trainingForm);
    const recipient = trainingForm.dataset.mailto || "hello@sansara.yoga";
    const subject = "Sansara teacher workshop inquiry";
    const body = [
      `Name: ${formData.get("name") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Teaching background: ${formData.get("background") || ""}`,
      "",
      "Message:",
      formData.get("message") || "",
    ].join("\n");
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

applyResearchFilters();
updateContentState();
