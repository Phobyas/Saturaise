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

// Mobile Search Zoom Prevention
function preventMobileZoom() {
  // Prevent zoom on iOS devices when focusing on input fields
  const mobileSearchInputs = document.querySelectorAll(
    '.mobile-search-input, .section-header__mobile_search--input, #mobile-search input'
  );

  mobileSearchInputs.forEach(input => {
    // Ensure font-size is always 16px or larger
    input.style.fontSize = '16px';
    
    // Set attributes to prevent zoom
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    
    // Add event listeners to maintain font size
    input.addEventListener('focus', function() {
      this.style.fontSize = '16px';
      // Prevent any transform or zoom
      this.style.transform = 'none';
      this.style.zoom = '1';
    });

    input.addEventListener('blur', function() {
      this.style.fontSize = '16px';
    });

    input.addEventListener('input', function() {
      this.style.fontSize = '16px';
    });
  });
}

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

// Enhanced mobile search setup with zoom prevention
function setupMobileSearchWithZoomPrevention() {
  const searchToggle = document.querySelector(".js-mobile-search-toggle, .js-slideout-open[data-wau-slideout-target='mobile-search']");
  const mobileSearch = document.getElementById("mobile-search");
  const mobileSearchDrawer = document.getElementById("mobile-search-drawer");
  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");
  const backdrop = document.querySelector(".mobile-search-backdrop");

  if (searchToggle && (mobileSearch || mobileSearchDrawer) && mobileHeader) {
    // Create a fixed position handler for the search
    const positionSearchAndBackdrop = () => {
      const headerHeight = 66; // Fixed height to prevent CLS
      const announcementHeight =
        document.querySelector(".announcement-bar.wrapper")?.offsetHeight || 40;

      if (mobileSearch) {
        if (mobileHeader.classList.contains("announcement-hidden")) {
          mobileSearch.style.top = `${headerHeight}px`;
          if (backdrop) backdrop.style.top = `${headerHeight + 60}px`;
        } else {
          mobileSearch.style.top = `${headerHeight + announcementHeight}px`;
          if (backdrop)
            backdrop.style.top = `${headerHeight + announcementHeight + 60}px`;
        }
      }
    };

    searchToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Handle old mobile search
      if (mobileSearch) {
        mobileSearch.classList.toggle("mobile-search--visible");
        if (backdrop) backdrop.classList.toggle("is-active");
        positionSearchAndBackdrop();

        if (mobileSearch.classList.contains("mobile-search--visible")) {
          mobileHeader.style.zIndex = "15";
        }
      }

      // Handle new mobile search drawer
      if (mobileSearchDrawer && typeof WAU !== "undefined" && WAU.Slideout) {
        WAU.Slideout._openByName("mobile-search");
      }

      // Focus search input after a delay and prevent zoom
      setTimeout(function () {
        const searchContainer = mobileSearch || mobileSearchDrawer;
        const searchInput = searchContainer.querySelector(
          ".mobile-search-input, .section-header__mobile_search--input"
        );
        if (searchInput) {
          // Ensure font size is 16px before focusing
          searchInput.style.fontSize = '16px';
          searchInput.focus();
          
          // Additional zoom prevention
          searchInput.style.transform = 'none';
          searchInput.style.zoom = '1';
        }
      }, 300);
    });

    // Handle backdrop click for old mobile search
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        if (mobileSearch) {
          mobileSearch.classList.remove("mobile-search--visible");
          backdrop.classList.remove("is-active");
        }
      });
    }

    // Update search position on scroll for smoother experience
    if (mobileSearch) {
      window.addEventListener("scroll", positionSearchAndBackdrop, {
        passive: true,
      });
    }
  }

  // Initialize zoom prevention
  preventMobileZoom();
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
        WAU.Slideout.init("mobile-search");
      }
      setupDrawer();
      setupMobileSearchWithZoomPrevention(); // Use enhanced version
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

  // Add zoom prevention for all existing inputs
  preventMobileZoom();
  
  // Re-run zoom prevention when new elements are added
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        // Small delay to ensure elements are fully rendered
        setTimeout(preventMobileZoom, 100);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
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

    // Apply zoom prevention to search input
    searchInput.style.fontSize = '16px';
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('autocorrect', 'off');
    searchInput.setAttribute('autocapitalize', 'off');
    searchInput.setAttribute('spellcheck', 'false');

    // Handle search input with zoom prevention
    searchInput.addEventListener("input", function (e) {
      // Maintain font size
      this.style.fontSize = '16px';
      
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

    // Handle focus with zoom prevention
    searchInput.addEventListener('focus', function() {
      this.style.fontSize = '16px';
      this.style.transform = 'none';
      this.style.zoom = '1';
    });

    // Handle suggestion clicks
    document.addEventListener("click", function (e) {
      if (e.target.matches(".mobile-search-suggestion")) {
        e.preventDefault();
        const query = e.target.textContent.trim();
        searchInput.value = query;
        searchInput.style.fontSize = '16px'; // Maintain font size
        hideAllStates();
        showLoading();
        setTimeout(() => performPredictiveSearch(query), 100);
      }
    });

    // Focus search input when drawer opens with zoom prevention
    if (typeof Events !== "undefined") {
      Events.on("slideout:open:mobile-search", function () {
        setTimeout(() => {
          searchInput.style.fontSize = '16px';
          searchInput.focus();
          searchInput.style.transform = 'none';
          searchInput.style.zoom = '1';
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
      // Re-apply zoom prevention
      setTimeout(preventMobileZoom, 100);
    }
  });
})();

// Handle slideout events with zoom prevention
if (typeof Events !== "undefined") {
  Events.on("slideout:open:mobile-search", function () {
    setTimeout(() => {
      const searchInput = document.querySelector(
        "#mobile-search-drawer .mobile-search-input, #mobile-search .section-header__mobile_search--input"
      );
      if (searchInput) {
        searchInput.style.fontSize = '16px';
        searchInput.focus();
        searchInput.style.transform = 'none';
        searchInput.style.zoom = '1';
      }
      preventMobileZoom();
    }, 300);
  });
}