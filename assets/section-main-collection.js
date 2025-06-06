const CollectionFilters = {
  init: function init(container, sectionId) {
    WAU.Slideout.init("collection-filters");

    this.typeToggle(container);
    this.drawerFilters();
    this.currentFilters();
    this.updateCollectionMsg(container);

    if (container.querySelector("[data-filters-price-range]")) {
      this.priceRange();
      this.priceSlider();
    }
    this.filterData = [];
  },
  priceRange: function priceRange() {
    const priceInputs = document.querySelectorAll(
      "input.js-filter-range-input"
    );
    setMinAndMaxValues(priceInputs);

    priceInputs.forEach((element) => {
      element.addEventListener("change", (event) => {
        onRangeChange(event);
        setFilter(event);
      });
    });

    function onRangeChange(event) {
      adjustToValidValues(event.currentTarget);
      setMinAndMaxValues();
    }

    function setMinAndMaxValues() {
      const minInput = priceInputs[0];
      const maxInput = priceInputs[1];

      if (maxInput.value)
        minInput.setAttribute("max", parseInt(maxInput.value).toFixed());
      if (minInput.value)
        maxInput.setAttribute("min", parseInt(minInput.value).toFixed());

      let maxRound = parseInt(maxInput.getAttribute("max")).toFixed();
      if (minInput.value === "") maxInput.setAttribute("min", 0);
      if (maxInput.value === "") minInput.setAttribute("max", maxRound);
    }

    function adjustToValidValues(input) {
      const value = Number(input.value);
      const min = Number(input.getAttribute("min"));
      const max = Number(input.getAttribute("max"));

      if (value < min) input.value = min;
      if (value > max) input.value = max;
    }

    function setFilter(event) {
      setTimeout(function () {
        const formData = new FormData(event.target.closest("form"));
        const searchParams = new URLSearchParams(formData).toString();

        CollectionFilters.renderPage(searchParams);
      }, 3000);
    }
  },
  priceSlider: function priceSlider() {
    var parents = document.querySelectorAll(".js-price-range");

    if (!parents) return false;

    parents.forEach((parent, i) => {
      var rangeS = parent.querySelectorAll("input[type=range]"),
        numberS = parent.querySelectorAll("input[type=number]");

      rangeS.forEach(function (el) {
        el.oninput = function () {
          var slide1 = parseFloat(rangeS[0].value),
            slide2 = parseFloat(rangeS[1].value);

          var slide1Dec = (Math.round(slide1 * 100) / 100).toFixed(),
            slide2Dec = (Math.round(slide2 * 100) / 100).toFixed();

          if (parseFloat(slide1Dec) > parseFloat(slide2Dec)) {
            [slide1Dec, slide2Dec] = [slide2Dec, slide1Dec];
          }

          numberS[0].value = slide1Dec;
          numberS[1].value = slide2Dec;
        };
      });

      rangeS[0].onchange = function () {
        numberS[0].dispatchEvent(new Event("change", { bubbles: true }));
      };
      rangeS[1].onchange = function () {
        numberS[1].dispatchEvent(new Event("change", { bubbles: true }));
      };
    });
  },
  resetAllSubmenus: function (container) {
    if (!container) return false;
    container
      .querySelectorAll("[data-menu-handle]")
      .forEach((menu) => (menu.style.display = "none"));
  },
  setActiveSubmenu: function (container, current) {
    if (!container) return false;
    if (!current) return false;
    let activeMenu = container.querySelector(`[data-menu-handle="${current}"]`);
    activeMenu.style.display = "block";
  },
  typeToggle: function typeToggle(container) {
    const sessionStorageId = "wau-current-submenu";
    this.resetAllSubmenus(container);
    const lastMenuType = sessionStorage.getItem(sessionStorageId);
    this.setActiveSubmenu(container, lastMenuType);

    container.querySelectorAll("[data-toggle-menu").forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        this.resetAllSubmenus(container);
        const currentSubmenu = e.target.dataset.toggleMenu;
        sessionStorage.setItem(sessionStorageId, currentSubmenu);
        this.setActiveSubmenu(container, currentSubmenu);
      });
    });
  },
  currentFilters: function currentFilters() {
    const filters = document.querySelectorAll(".js-current-filter");

    filters.forEach((item, i) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        CollectionFilters.onActiveFilterClick(event);
      });
    });
  },
  drawerFilters: function drawerFilters() {
    const filters = document.querySelectorAll(".js-filter");

    filters.forEach((item, i) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();

        if (item.querySelector('input[type="checkbox"]').checked) {
          item.classList.remove("current");
          item.querySelector('input[type="checkbox"]').checked = false;
        } else {
          item.classList.add("current");
          item.querySelector('input[type="checkbox"]').checked = true;
        }

        const formData = new FormData(item.closest("form"));
        const searchParams = new URLSearchParams(formData).toString();

        CollectionFilters.renderPage(searchParams);
      });
    });
  },
  renderFilters: function renderFilters() {
    var container = document.querySelector('[data-section-type="collection"]');
    WAU.Slideout.init("collection-filters");

    // Removed automatic drawer reopening code to prevent jamming
    // DO NOT ADD IT BACK

    this.typeToggle(container);
    this.drawerFilters();
    this.currentFilters();
    this.updateCollectionMsg(container);

    if (container.querySelector("[data-filters-price-range]")) {
      this.priceRange();
      this.priceSlider();
    }

    WAU.Quickshop.init();
    WAU.ProductGridVideo.init();
  },
  renderSectionFromFetch: function renderSectionFromFetch(url, section) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        this.filterData = [...this.filterData, { html, url }];
        this.renderProductGrid(html);
        this.renderFilters();
      });
  },
  renderSectionFromCache: function renderSectionFromCache(
    filterDataUrl,
    section
  ) {
    const html = this.filterData.find(filterDataUrl).html;
    this.renderProductGrid(html);
    this.renderFilters();
  },
  renderPage: function renderPage(searchParams, updateURLHash = true) {
    const sections = this.getSections();

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      this.filterData.some(filterDataUrl)
        ? this.renderSectionFromCache(filterDataUrl, section)
        : this.renderSectionFromFetch(url, section);
    });

    if (updateURLHash) this.updateURLHash(searchParams);
  },
  renderProductGrid: function renderProductGrid(html) {
    const innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById("CollectionProductGrid").innerHTML;

    document.getElementById("CollectionProductGrid").innerHTML = innerHTML;
  },
  updateCollectionMsg: function updateCollectionMsg(container) {
    var empty = container.getAttribute("data-empty"),
      filterMsg = container.querySelector(".js-coll-empty-filter"),
      regMsg = container.querySelector(".js-coll-empty");

    if (!filterMsg || !regMsg) return false;

    if (empty === "true") {
      filterMsg.style.display = "none";
      regMsg.style.display = "block";
    } else {
      filterMsg.style.display = "block";
      regMsg.style.display = "none";
    }
  },
  onActiveFilterClick: function onActiveFilterClick(event) {
    event.preventDefault();
    this.renderPage(new URL(event.currentTarget.href).searchParams.toString());
  },
  updateURLHash: function updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
    );
  },
  getSections: function getSections() {
    return [
      {
        id: "main-collection-product-grid",
        section: document.getElementById("main-collection-product-grid").dataset
          .id,
      },
    ];
  },
};

document
  .querySelectorAll('[data-section-type="collection"]')
  .forEach(function (container) {
    WAU.Slideout.init("collection-filters");
    if (container.querySelector("[data-filters]")) {
      CollectionFilters.init(container, container.dataset.sectionId);
    }
  });

document.addEventListener("shopify:section:load", function (event) {
  if (event.target.querySelector('[data-section-type="collection"]')) {
    var container = event.target.querySelector(
      '[data-section-type="collection"]'
    );
    WAU.Slideout.init("collection-filters");
    if (container.querySelector("[data-filters]")) {
      CollectionFilters.init(container, container.dataset.sectionId);
    }
  }
});

// Add this at the end of section-main-collection.js
(function patchFilterDrawerVisibility() {
  // Wait for DOM to be ready
  document.addEventListener("DOMContentLoaded", function () {
    // SIMPLE FIX: Disable overlay for filter drawer completely
    function hideOverlayForFilterDrawer() {
      const overlay = document.querySelector(".js-slideout-overlay");
      if (overlay) {
        overlay.style.display = "none !important";
        overlay.style.visibility = "hidden !important";
        overlay.style.opacity = "0 !important";
        overlay.style.pointerEvents = "none !important";
      }
    }

    // Store original methods to preserve functionality
    if (window.WAU && window.WAU.Slideout) {
      const originalRenderPage = CollectionFilters.renderPage;

      // Override the renderPage method to preserve drawer state
      CollectionFilters.renderPage = function (
        searchParams,
        updateURLHash = true
      ) {
        // Save drawer state before update
        const drawer = document.querySelector(
          '[data-wau-slideout="collection-filters"]'
        );
        const drawerWasActive =
          drawer && drawer.classList.contains("slideout--active");

        // Call original method
        originalRenderPage.call(this, searchParams, updateURLHash);

        // If drawer was active, force it to stay active after update
        if (drawerWasActive && drawer) {
          setTimeout(function () {
            // Force drawer to stay open
            drawer.classList.add("slideout--active");
            drawer.classList.remove("slideout--close");
            drawer.setAttribute("aria-hidden", "false");

            // Ensure wrapper shows drawer is open
            const wrapper = document.querySelector(
              ".js-slideout-toggle-wrapper"
            );
            if (wrapper) {
              wrapper.classList.add("slideout-left--open");
              wrapper.classList.remove("slideout-left--closed");
            }

            // HIDE OVERLAY COMPLETELY
            hideOverlayForFilterDrawer();
          }, 100);
        }
      };

      // Override the renderFilters method to ensure drawer state consistency
      const originalRenderFilters = CollectionFilters.renderFilters;

      CollectionFilters.renderFilters = function () {
        // Save drawer state before update
        const drawer = document.querySelector(
          '[data-wau-slideout="collection-filters"]'
        );
        const drawerWasActive =
          drawer && drawer.classList.contains("slideout--active");

        // Call original method
        originalRenderFilters.call(this);

        // If drawer was active, force it to stay active after update
        if (drawerWasActive && drawer) {
          setTimeout(function () {
            // Force drawer to stay open
            drawer.classList.add("slideout--active");
            drawer.classList.remove("slideout--close");
            drawer.setAttribute("aria-hidden", "false");

            // Ensure wrapper shows drawer is open
            const wrapper = document.querySelector(
              ".js-slideout-toggle-wrapper"
            );
            if (wrapper) {
              wrapper.classList.add("slideout-left--open");
              wrapper.classList.remove("slideout-left--closed");
            }

            // HIDE OVERLAY COMPLETELY
            hideOverlayForFilterDrawer();
          }, 100);
        }
      };

      // Fix for reopening drawer after it's been closed
      const filterButtons = document.querySelectorAll(
        '[data-wau-slideout-target="collection-filters"]'
      );
      filterButtons.forEach(function (button) {
        // Add click handler that runs alongside WAU.Slideout
        button.addEventListener("click", function () {
          // HIDE OVERLAY when filter drawer opens
          setTimeout(function () {
            hideOverlayForFilterDrawer();
          }, 50);
        });
      });

      // Also hide overlay whenever filter drawer becomes active
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          const drawer = document.querySelector(
            '[data-wau-slideout="collection-filters"]'
          );
          if (drawer && drawer.classList.contains("slideout--active")) {
            hideOverlayForFilterDrawer();
          }
        });
      });

      const drawer = document.querySelector(
        '[data-wau-slideout="collection-filters"]'
      );
      if (drawer) {
        observer.observe(drawer, {
          attributes: true,
          attributeFilter: ["class"],
        });
      }
    }
  });
})();
