(function () {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const themeStorageKey = "grammar-theme-v2";
  const storedTheme = localStorage.getItem(themeStorageKey);
  if (storedTheme === "dark" || storedTheme === "light") {
    root.dataset.theme = storedTheme;
  }

  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");

  function updateThemeButton() {
    const isDark = root.dataset.theme === "dark";
    if (themeLabel) {
      themeLabel.textContent = isDark ? "Light" : "Dark";
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  if (themeToggle) {
    updateThemeButton();
    themeToggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = nextTheme;
      localStorage.setItem(themeStorageKey, nextTheme);
      updateThemeButton();
    });
  }

  const mobileToggle = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector("#primary-nav");

  function closeMobileMenu() {
    if (!mobileToggle || !navMenu) return;
    mobileToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("is-open");
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", String(!isOpen));
      navMenu.classList.toggle("is-open", !isOpen);
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".nav-shell")) {
        closeMobileMenu();
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      closeMobileMenu();
      history.pushState(null, "", targetId);
    });
  });

  const sectionLinks = Array.from(document.querySelectorAll(".nav-menu a[href^='#']"));
  const pageSections = Array.from(document.querySelectorAll("main section[id]"));

  function setCurrentSection(sectionId) {
    sectionLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${sectionId}`) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (sectionLinks.length && pageSections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible && visible.target.id) {
          setCurrentSection(visible.target.id);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.12, 0.24, 0.4]
      }
    );

    pageSections.forEach((section) => navObserver.observe(section));
  }

  if (window.location.hash) {
    setCurrentSection(window.location.hash.slice(1));
    window.requestAnimationFrame(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
  } else {
    setCurrentSection("home");
  }

  const searchInput = document.querySelector("#lesson-search");
  const chips = Array.from(document.querySelectorAll("[data-category-filter]"));
  const lessonCards = Array.from(document.querySelectorAll(".lesson-card"));
  const emptyState = document.querySelector("#empty-state");
  let activeCategory = "All";

  function filterLessons() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let visibleCount = 0;

    lessonCards.forEach((card) => {
      const category = card.dataset.category || "";
      const haystack = [
        card.dataset.title,
        card.dataset.keywords,
        card.textContent
      ].join(" ").toLowerCase();

      const matchesCategory = activeCategory === "All" || category === activeCategory;
      const matchesSearch = !query || haystack.includes(query);
      const shouldShow = matchesCategory && matchesSearch;

      card.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterLessons);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.categoryFilter || "All";
      chips.forEach((item) => {
        item.classList.toggle("is-active", item === chip);
      });
      filterLessons();
    });
  });

  document.querySelectorAll("[data-answer-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-answer-target");
      const answer = targetId ? document.getElementById(targetId) : null;
      if (!answer) return;

      const willShow = answer.hidden;
      answer.hidden = !willShow;
      button.textContent = willShow ? "Hide Answer" : "Show Answer";
    });
  });

  document.querySelectorAll("[data-collapse-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-collapse-target");
      const panel = targetId ? document.getElementById(targetId) : null;
      if (!panel) return;

      const willShow = panel.hidden;
      const label = button.querySelector("span");
      panel.hidden = !willShow;
      button.setAttribute("aria-expanded", String(willShow));

      if (label) {
        label.textContent = willShow
          ? button.dataset.openLabel || "Hide Note"
          : button.dataset.closedLabel || "Show Note";
      }
    });
  });

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }
})();
