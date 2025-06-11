// Mobile Navigation JS - Updated to improve performance and prevent CLS
// Set initial CSS variables to prevent layout shift
(function () {
  document.documentElement.style.setProperty("--header-mobile-height", "66px");
  document.documentElement.style.setProperty("--header-height", "66px");
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    "40px"
  );

  // Pre-set fixed dimensions for critical elements
  const headerSpacer = document.querySelector(".header-spacer");
  if (headerSpacer) {
    headerSpacer.style.height = "106px"; // 40px + 66px
  }
})();

function setupDrawer() {
  // Find key elements
  const mobileHeader = document.getElementById("shopify-section-mobile-header");
  const mobileNav = document.querySelector(".js-mobile-header");
  const mobileSearch = document.getElementById("mobile-search");
  const announcementBar = document.querySelector(".announcement-bar.wrapper");

  // Set header height and announcement bar height with fixed values to prevent CLS
  const headerHeight = 66; // Fixed height
  const announcementBarHeight = announcementBar
    ? announcementBar.offsetHeight || 40
    : 40;

  // Update CSS variables
  document.documentElement.style.setProperty(
    "--header-height",
    `${headerHeight}px`
  );
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    `${announcementBarHeight}px`
  );

  // Update the header-spacer
  const headerSpacer = document.querySelector(".header-spacer");
  if (headerSpacer && window.innerWidth < 768) {
    headerSpacer.style.height = `${announcementBarHeight + headerHeight}px`;
  }

  // Ensure announcement bar is visible
  if (announcementBar) {
    announcementBar.style.display = "block";
    announcementBar.style.visibility = "visible";
    announcementBar.style.opacity = "1";
    announcementBar.style.position = "fixed";
    announcementBar.style.top = "0";
    announcementBar.style.height = `${announcementBarHeight}px`;
  }

  // Handle slideout events if WAU is available
  if (typeof Events !== "undefined") {
    Events.on("slideout:open:mobile-navigation", function () {
      setTimeout(function () {
        if (mobileNav) mobileNav.style.zIndex = "14";
      }, 200);
    });

    Events.on("slideout:close:mobile-navigation", function () {
      setTimeout(function () {
        if (mobileSearch) mobileSearch.style.zIndex = "0";
        if (mobileNav) mobileNav.style.zIndex = "12";
      }, 200);
    });
  }

  // Fix dimensions for icon containers
  const iconContainers = document.querySelectorAll(
    ".mobile-header__cart-links--search, .mobile-header__cart-links--cart, .mobile-header__cart-links--nav"
  );

  iconContainers.forEach((container) => {
    if (container) {
      container.style.width = "32px";
      container.style.height = "32px";
    }
  });
}

function setupMobileSearch() {
  const searchToggle = document.querySelector(".js-mobile-search-toggle");
  const mobileSearch = document.getElementById("mobile-search");
  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");
  const backdrop = document.querySelector(".mobile-search-backdrop");

  if (searchToggle && mobileSearch && mobileHeader) {
    // Create a fixed position handler for the search
    const positionSearchAndBackdrop = () => {
      const headerHeight = 66; // Fixed height to prevent CLS
      const announcementHeight =
        document.querySelector(".announcement-bar.wrapper")?.offsetHeight || 40;

      if (mobileHeader.classList.contains("announcement-hidden")) {
        mobileSearch.style.top = `${headerHeight}px`;
        if (backdrop) backdrop.style.top = `${headerHeight + 60}px`;
      } else {
        mobileSearch.style.top = `${headerHeight + announcementHeight}px`;
        if (backdrop)
          backdrop.style.top = `${headerHeight + announcementHeight + 60}px`;
      }
    };

    searchToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      mobileSearch.classList.toggle("mobile-search--visible");
      backdrop.classList.toggle("is-active");

      positionSearchAndBackdrop();

      if (mobileSearch.classList.contains("mobile-search--visible")) {
        mobileHeader.style.zIndex = "15";

        // Focus search input
        const searchInput = mobileSearch.querySelector(
          ".section-header__mobile_search--input"
        );
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 50);
        }
      }
    });

    backdrop.addEventListener("click", function () {
      mobileSearch.classList.remove("mobile-search--visible");
      backdrop.classList.remove("is-active");
    });

    // Update search position on scroll for smoother experience
    window.addEventListener("scroll", positionSearchAndBackdrop, {
      passive: true,
    });
  }
}

function handleMobileHeaderScroll() {
  const announcementBar = document.querySelector(".announcement-bar.wrapper");
  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");

  if (!announcementBar || !mobileHeader) return;

  const announcementBarHeight = announcementBar.offsetHeight || 40;
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    `${announcementBarHeight}px`
  );

  let lastScrollTop = 0;
  const scrollThreshold = 10;
  let scrollTimeout;

  const handleScroll = () => {
    // Skip if there's an active timeout to improve performance
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // If we've scrolled past the threshold, hide announcement bar and move header up
      if (currentScrollTop > scrollThreshold) {
        announcementBar.classList.add("is-hidden");
        mobileHeader.classList.add("announcement-hidden");
      } else {
        // At the top of the page - show announcement bar and reset header position
        announcementBar.classList.remove("is-hidden");
        mobileHeader.classList.remove("announcement-hidden");
      }

      lastScrollTop = currentScrollTop;
      scrollTimeout = null;
    }, 10);
  };

  window.removeEventListener("scroll", handleScroll);
  window.addEventListener("scroll", handleScroll, { passive: true });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('[data-section-type="mobile-header"]')
    .forEach(function () {
      if (typeof WAU !== "undefined" && WAU.Slideout) {
        WAU.Slideout.init("mobile-navigation");
      }
      setupDrawer();
      setupMobileSearch();
      handleMobileHeaderScroll();

      // Setup mini-cart trigger
      const miniCartTrigger = document.querySelector(
        ".mobile-nav__mobile-header .js-mini-cart-trigger"
      );
      if (miniCartTrigger && typeof WAU !== "undefined" && WAU.Slideout) {
        miniCartTrigger.addEventListener("click", function () {
          WAU.Slideout._closeByName("mobile-navigation");
        });
      }
    });
});

// Handle Shopify section events
document.addEventListener("shopify:section:select", function (event) {
  if (event.target.querySelector('[data-section-type="mobile-header"]')) {
    var container = event.target.querySelector(
      '[data-section-type="mobile-header"]'
    );

    if (
      (typeof WAU !== "undefined" && WAU.Helpers && WAU.Helpers.isTouch()) ||
      (typeof WAU !== "undefined" && WAU.Helpers && WAU.Helpers.isMobile())
    ) {
      if (typeof WAU !== "undefined" && WAU.Slideout) {
        WAU.Slideout._openByName("mobile-navigation");
      }
      setupDrawer();
    }
  }
});

document.addEventListener("shopify:section:deselect", function (event) {
  if (event.target.querySelector('[data-section-type="mobile-header"]')) {
    if (typeof WAU !== "undefined" && WAU.Slideout) {
      WAU.Slideout._closeByName("mobile-navigation");
    }
  }
});

document.addEventListener("shopify:block:select", function (event) {
  if (!event.target.querySelector('[data-section-type="mobile-header"]'))
    return false;
  if (
    (typeof WAU !== "undefined" && WAU.Helpers && WAU.Helpers.isTouch()) ||
    (typeof WAU !== "undefined" && WAU.Helpers && WAU.Helpers.isMobile())
  ) {
    if (typeof WAU !== "undefined" && WAU.Slideout) {
      WAU.Slideout._openByName("mobile-navigation");
    }
    setupDrawer();
  }
});

// Cleanup any problematic inline styles
document.addEventListener("DOMContentLoaded", function () {
  // Find slider images with inline padding styles and remove them
  const sliderImages = document.querySelectorAll(".slideshow__slide-image");
  sliderImages.forEach((slide) => {
    if (slide.style.paddingBottom) {
      slide.style.paddingBottom = "";
    }
  });

  // Fix any mobile nav dimensions
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.style.height = "66px";
    mobileMenu.style.contain = "layout size";
  }

  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");
  if (mobileHeader) {
    mobileHeader.style.height = "66px";
    mobileHeader.style.contain = "layout";
  }
});

// Mobile Search Drawer - Using Existing Predictive Search System
// Add this to your section-mobile-navigation.js

(function () {
  function initMobileSearch() {
    const searchInput = document.querySelector(
      "#mobile-search-drawer .mobile-search-input"
    );
    const predictiveSearchContainer = document.querySelector(
      "#mobile-search-drawer #predictive-search"
    );
    const loadingState = document.querySelector(
      "#mobile-search-drawer .mobile-search-loading"
    );
    const emptyState = document.querySelector(
      "#mobile-search-drawer .mobile-search-empty"
    );
    const suggestionsContainer = document.querySelector(
      "#mobile-search-drawer .mobile-search-suggestions"
    );

    if (!searchInput || !predictiveSearchContainer) return;

    let searchTimeout;

    // Handle search input
    searchInput.addEventListener("input", function (e) {
      const query = e.target.value.trim();

      clearTimeout(searchTimeout);

      if (!query) {
        showSuggestions();
        return;
      }

      // Show loading state
      hideAllStates();
      showLoading();

      // Debounce search - use same timing as desktop
      searchTimeout = setTimeout(() => {
        performPredictiveSearch(query);
      }, 300);
    });

    // Handle suggestion clicks
    document.addEventListener("click", function (e) {
      if (e.target.matches(".mobile-search-suggestion")) {
        e.preventDefault();
        const query = e.target.textContent.trim();
        searchInput.value = query;
        hideAllStates();
        showLoading();
        setTimeout(() => performPredictiveSearch(query), 100);
      }
    });

    // Focus search input when drawer opens
    if (typeof Events !== "undefined") {
      Events.on("slideout:open:mobile-search", function () {
        setTimeout(() => {
          searchInput.focus();
          showSuggestions();
        }, 300);
      });

      Events.on("slideout:close:mobile-search", function () {
        searchInput.value = "";
        showSuggestions();
      });
    }

    // Use existing predictive search system
    function performPredictiveSearch(query) {
      // Use the same endpoint as desktop predictive search
      const predictiveSearchURL = "/search/suggest";

      fetch(
        `${predictiveSearchURL}?q=${encodeURIComponent(
          query
        )}&section_id=predictive-search&resources[limit]=8&resources[limit_scope]=each`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((text) => {
          hideLoading();

          const resultsMarkup = new DOMParser()
            .parseFromString(text, "text/html")
            .querySelector("#shopify-section-predictive-search");

          if (resultsMarkup && resultsMarkup.innerHTML.trim()) {
            // Process the results to add mobile-specific enhancements
            const processedHTML = processPredictiveResults(
              resultsMarkup.innerHTML,
              query
            );
            predictiveSearchContainer.innerHTML = processedHTML;
            predictiveSearchContainer.style.display = "block";
          } else {
            showEmptyState();
          }
        })
        .catch((error) => {
          console.error("Mobile search error:", error);
          hideLoading();
          showEmptyState();
        });
    }

    // Process predictive search results for mobile
    function processPredictiveResults(html, query) {
      // Create a temporary container to manipulate the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Find the predictive search results
      const resultsContainer = tempDiv.querySelector(
        ".predictive-search__results"
      );

      if (!resultsContainer) {
        return html;
      }

      // Add mobile-specific classes and structure
      const productsList = resultsContainer.querySelector(
        ".predictive-search__results-list"
      );
      if (productsList) {
        productsList.classList.add("mobile-search-results-grid");

        // Process each product item to match mobile layout
        const productItems = productsList.querySelectorAll(
          ".predictive-search__results-list-item"
        );
        productItems.forEach((item) => {
          item.classList.add("mobile-search-product-item");

          // Ensure proper image aspect ratio
          const imageContainer = item.querySelector(
            ".predictive-search__results-list-item-image"
          );
          if (imageContainer) {
            imageContainer.style.aspectRatio = "1/1";
            imageContainer.style.backgroundColor = "#eeeeee";
          }
        });
      }

      // Add "Zobacz wszystkie wyniki" button
      const seeAllButton = `
        <div class="search-see-all-wrapper">
          <a href="/search?q=${encodeURIComponent(
            query
          )}" class="search-see-all-btn">
            Zobacz wszystkie wyniki
          </a>
        </div>
      `;

      resultsContainer.insertAdjacentHTML("afterend", seeAllButton);

      return tempDiv.innerHTML;
    }

    // State management functions
    function showLoading() {
      if (loadingState) loadingState.classList.add("active");
    }

    function hideLoading() {
      if (loadingState) loadingState.classList.remove("active");
    }

    function showEmptyState() {
      if (emptyState) emptyState.classList.add("active");
    }

    function showSuggestions() {
      hideAllStates();
      if (suggestionsContainer) suggestionsContainer.style.display = "block";
    }

    function hideAllStates() {
      if (loadingState) loadingState.classList.remove("active");
      if (emptyState) emptyState.classList.remove("active");
      if (predictiveSearchContainer)
        predictiveSearchContainer.style.display = "none";
      if (suggestionsContainer) suggestionsContainer.style.display = "none";
    }

    // Initialize with suggestions
    showSuggestions();
  }

  // Initialize when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileSearch);
  } else {
    initMobileSearch();
  }

  // Re-initialize on section load
  document.addEventListener("shopify:section:load", function (event) {
    if (event.target.querySelector('[data-section-type="mobile-header"]')) {
      initMobileSearch();
    }
  });
})();
