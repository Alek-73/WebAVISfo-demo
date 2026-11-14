const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    siteNav.classList.toggle("is-open", !isExpanded);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a") && window.matchMedia("(max-width: 680px)").matches) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

// Countdown labels are rendered by the server and refreshed here, so cached pages stay accurate.
document.querySelectorAll("[data-countdown]").forEach((label) => {
  const [year, month, day] = label.dataset.countdown.split("-").map(Number);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((new Date(year, month - 1, day) - today) / 86400000);

  if (days < 0) {
    label.textContent = "Conclusa";
  } else if (days === 0) {
    label.textContent = "Oggi";
  } else {
    label.textContent = days === 1 ? "Domani" : `Tra ${days} giorni`;
  }
});

const calendar = document.querySelector("[data-calendar]");
const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it");

if (calendar) {
  const toolbar = calendar.querySelector(".calendar-toolbar");
  const searchInput = calendar.querySelector("#race-search");
  const filterButtons = [...calendar.querySelectorAll(".filter-button")];
  const cards = [...calendar.querySelectorAll(".race-card")];
  const groups = [...calendar.querySelectorAll(".calendar-month-group")];
  const resultsNote = calendar.querySelector("#results-note");
  const emptyState = calendar.querySelector("#empty-state");
  const clearButton = calendar.querySelector("#clear-filters");
  let activeFilter = "tutte";

  const selectFilter = (filter) => {
    activeFilter = filter;
    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  };

  const applyFilters = () => {
    const query = normalize(searchInput.value.trim());
    let visible = 0;

    cards.forEach((card) => {
      const matchesType = activeFilter === "tutte"
        || (activeFilter === "competitiva" && card.dataset.competitive === "1")
        || (activeFilter === "non-competitiva" && card.dataset.open === "1");
      const show = matchesType && normalize(card.dataset.search).includes(query);
      card.hidden = !show;
      visible += show ? 1 : 0;
    });

    groups.forEach((group) => {
      group.hidden = !group.querySelector(".race-card:not([hidden])");
    });

    resultsNote.textContent = `${visible} ${visible === 1 ? "appuntamento" : "appuntamenti"} in programma`;
    emptyState.hidden = visible !== 0;
  };

  if (toolbar && searchInput) {
    toolbar.hidden = false;

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectFilter(button.dataset.filter);
        applyFilters();
      });
    });

    searchInput.addEventListener("input", applyFilters);

    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      selectFilter("tutte");
      applyFilters();
      searchInput.focus();
    });
  }
}

const photoArchive = document.querySelector("[data-photo-archive]");

if (photoArchive) {
  const activeYear = photoArchive.querySelector(".photo-years [aria-current]");
  const searchField = photoArchive.querySelector(".photo-toolbar .search-field");
  const searchInput = photoArchive.querySelector("#photo-search");
  const cards = [...photoArchive.querySelectorAll(".photo-card")];
  const groups = [...photoArchive.querySelectorAll(".calendar-month-group")];
  const resultsNote = photoArchive.querySelector("#results-note");
  const emptyState = photoArchive.querySelector("#empty-state");
  const clearButton = photoArchive.querySelector("#clear-search");
  const year = photoArchive.dataset.year;

  // Many years do not fit on a phone: bring the selected one into view.
  if (activeYear) {
    const tabs = activeYear.parentElement;
    tabs.scrollLeft = activeYear.offsetLeft - (tabs.clientWidth - activeYear.offsetWidth) / 2;
  }

  if (searchField && searchInput) {
    const label = (count) => `${count} ${count === 1 ? "servizio fotografico" : "servizi fotografici"}`;

    const applySearch = () => {
      const query = normalize(searchInput.value.trim());
      let visible = 0;

      cards.forEach((card) => {
        const show = normalize(card.dataset.search).includes(query);
        card.hidden = !show;
        visible += show ? 1 : 0;
      });

      groups.forEach((group) => {
        group.hidden = !group.querySelector(".photo-card:not([hidden])");
      });

      resultsNote.textContent = query
        ? `${label(visible)} su ${cards.length} nel ${year}`
        : `${label(visible)} nel ${year}`;
      emptyState.hidden = visible !== 0;
    };

    searchField.hidden = false;
    searchInput.addEventListener("input", applySearch);

    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      applySearch();
      searchInput.focus();
    });
  }
}

const photoGrid = document.querySelector("[data-photo-grid]");

// Without <dialog> support the thumbnails simply open the full photos.
if (photoGrid && typeof HTMLDialogElement === "function") {
  const links = [...photoGrid.querySelectorAll(".photo-thumb")];
  const icon = (path) => `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${path}"></path></svg>`;
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Foto a schermo intero");
  dialog.innerHTML = `
    <div class="lightbox-bar">
      <p class="lightbox-counter" aria-live="polite"></p>
      <a class="lightbox-original" target="_blank" rel="noopener">Apri originale</a>
      <button class="lightbox-close" type="button" aria-label="Chiudi" autofocus>${icon("M6 6l12 12M18 6 6 18")}</button>
    </div>
    <figure class="lightbox-figure">
      <img class="lightbox-image" alt="">
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
    <button class="lightbox-nav lightbox-prev" type="button" aria-label="Foto precedente">${icon("m15 5-7 7 7 7")}</button>
    <button class="lightbox-nav lightbox-next" type="button" aria-label="Foto successiva">${icon("m9 5 7 7-7 7")}</button>`;
  document.body.append(dialog);

  const counter = dialog.querySelector(".lightbox-counter");
  const original = dialog.querySelector(".lightbox-original");
  const figure = dialog.querySelector(".lightbox-figure");
  const image = dialog.querySelector(".lightbox-image");
  const caption = dialog.querySelector(".lightbox-caption");
  const prevButton = dialog.querySelector(".lightbox-prev");
  const nextButton = dialog.querySelector(".lightbox-next");
  let current = 0;
  let swipe = null;
  let swiped = false;

  const linkFromHash = () => links.findIndex((link) => `#${link.id}` === window.location.hash);
  const pageAddress = () => window.location.pathname + window.location.search;

  const preload = (index) => {
    if (links[index]) {
      new Image().src = links[index].href;
    }
  };

  const show = (index) => {
    const link = links[index];
    const thumb = link.querySelector("img");
    current = index;

    dialog.classList.add("is-loading");
    image.src = link.href;
    image.width = Number(link.dataset.width) || thumb.width;
    image.height = Number(link.dataset.height) || thumb.height;
    image.alt = thumb.alt;
    if (image.complete) {
      dialog.classList.remove("is-loading");
    }

    caption.textContent = link.dataset.caption || "";
    caption.hidden = !link.dataset.caption;
    counter.textContent = `${index + 1} di ${links.length}`;
    original.href = link.href;
    prevButton.disabled = index === 0;
    nextButton.disabled = index === links.length - 1;
    window.history.replaceState(window.history.state, "", `#${link.id}`);
    preload(index + 1);
    preload(index - 1);
  };

  const step = (delta) => {
    if (links[current + delta]) {
      show(current + delta);
    }
  };

  // Opening adds a history entry, so the phone's back button closes the photo.
  const open = (index) => {
    window.history.pushState({ lightbox: true }, "", `#${links[index].id}`);
    show(index);
    document.documentElement.classList.add("has-lightbox");
    dialog.showModal();
  };

  ["load", "error"].forEach((type) => {
    image.addEventListener(type, () => dialog.classList.remove("is-loading"));
  });

  photoGrid.addEventListener("click", (event) => {
    const link = event.target.closest(".photo-thumb");
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    open(links.indexOf(link));
  });

  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("has-lightbox");
    if (window.history.state && window.history.state.lightbox) {
      window.history.back();
    } else {
      window.history.replaceState(window.history.state, "", pageAddress());
    }
    links[current].focus();
  });

  window.addEventListener("popstate", () => {
    const index = linkFromHash();
    if (window.history.state && window.history.state.lightbox && index !== -1) {
      if (dialog.open) {
        show(index);
      } else {
        document.documentElement.classList.add("has-lightbox");
        show(index);
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  prevButton.addEventListener("click", () => step(-1));
  nextButton.addEventListener("click", () => step(1));

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    }
  });

  // A click on the dark area around the photo closes the viewer.
  dialog.addEventListener("click", (event) => {
    if (!swiped && (event.target === dialog || event.target === figure)) {
      dialog.close();
    }
    swiped = false;
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      dialog.classList.toggle("is-zoomed", window.visualViewport.scale > 1.01);
    });
  }

  // Swipe left or right to change photo, down to close. Pinch zoom is left to the browser.
  figure.addEventListener("pointerdown", (event) => {
    swiped = false;
    if (event.pointerType === "mouse" || dialog.classList.contains("is-zoomed")) {
      return;
    }
    swipe = swipe ? null : { id: event.pointerId, x: event.clientX, y: event.clientY };
  });

  figure.addEventListener("pointerup", (event) => {
    if (!swipe || swipe.id !== event.pointerId) {
      swipe = null;
      return;
    }
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    swipe = null;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      swiped = true;
      step(dx < 0 ? 1 : -1);
    } else if (dy > 90 && dy > Math.abs(dx) * 1.5) {
      swiped = true;
      dialog.close();
    }
  });

  figure.addEventListener("pointercancel", () => {
    swipe = null;
  });

  const initial = linkFromHash();
  if (initial !== -1) {
    window.history.replaceState(null, "", pageAddress());
    open(initial);
  }
}
