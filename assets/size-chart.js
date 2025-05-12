/**
 * Size Chart Modal JS - Only Table Content Scrolls
 */
(function () {
  // Initialize on document ready
  document.addEventListener("DOMContentLoaded", initialize);

  // Initialize on load
  window.addEventListener("load", initialize);

  // Initialize function
  function initialize() {
    setupTabFunctionality();
    enhanceWAUModal();
    setupCloseOnEscape();

    // Apply overflow fixes
    applyOverflowFixes();
  }

  // Function to force overflow settings
  function applyOverflowFixes() {
    // Apply once on init
    forceOverflowSettings();

    // And check again after a short delay to catch any late DOM changes
    setTimeout(forceOverflowSettings, 300);

    // Add a mutation observer to watch for DOM changes
    const modalContainer = document.querySelector(
      '[data-wau-modal="size-chart-modal"]'
    );
    if (modalContainer) {
      const observer = new MutationObserver(forceOverflowSettings);
      observer.observe(modalContainer, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
  }

  // Function to force correct overflow settings
  function forceOverflowSettings() {
    // Force modal and all wrappers to have no overflow
    const selectors = [
      '[data-wau-modal="size-chart-modal"]',
      ".modal__container",
      ".modal__inner-wrapper",
      ".modal__inner-content-container",
      ".sizing-modal__main",
      ".tab-block",
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        el.style.overflow = "hidden";
      });
    });

    // Force the tab-cont to be the only scrollable element
    const tabContElements = document.querySelectorAll(".tab-cont");
    tabContElements.forEach((el) => {
      el.style.overflowY = "auto";

      // Calculate proper height
      const modal = el.closest('[data-wau-modal="size-chart-modal"]');
      if (modal) {
        const modalHeight = modal.clientHeight;
        const tabMenu = modal.querySelector(".tab-mnu");
        const tabMenuHeight = tabMenu ? tabMenu.offsetHeight : 0;
        const padding = 60; // Approximate padding

        const availableHeight = modalHeight - tabMenuHeight - padding;
        el.style.maxHeight = availableHeight + "px";
      }
    });
  }

  // Function to set up tab functionality
  function setupTabFunctionality() {
    // Add click handler for tab navigation
    document.addEventListener("click", function (e) {
      // Check if clicked element is a tab
      if (
        e.target.getAttribute &&
        e.target.getAttribute("data-name") === "table-nav"
      ) {
        // Handle tab click
        const tab = e.target;
        const tabId = tab.getAttribute("data-tab");
        const tabBlock = tab.closest(".tab-block");

        if (!tabBlock) return;

        // Remove active class from all tabs
        const allTabs = tabBlock.querySelectorAll('[data-name="table-nav"]');
        allTabs.forEach(function (t) {
          t.classList.remove("active");
        });

        // Add active class to clicked tab
        tab.classList.add("active");

        // Hide all content panes
        const allContent = tabBlock.querySelectorAll(
          '[data-name="table-content"]'
        );
        allContent.forEach(function (content) {
          content.classList.remove("active");
          content.style.display = "none";
        });

        // Show clicked content pane
        const activeContent = tabBlock.querySelector(
          `[data-name="table-content"][data-tab="${tabId}"]`
        );
        if (activeContent) {
          activeContent.classList.add("active");
          activeContent.style.display = "block";

          // Make sure table is visible
          const table = activeContent.querySelector("table");
          if (table) {
            table.style.display = "table";
          }
        }

        // Reapply overflow settings after tab change
        forceOverflowSettings();
      }
    });

    // Activate first tab if none active
    setTimeout(activateFirstTabIfNeeded, 300);
  }

  // Function to activate first tab if none are active
  function activateFirstTabIfNeeded() {
    const tabContainers = document.querySelectorAll(".tab-block");

    tabContainers.forEach(function (container) {
      const activeTab = container.querySelector(
        '[data-name="table-nav"].active'
      );

      if (!activeTab) {
        const firstTab = container.querySelector('[data-name="table-nav"]');
        if (firstTab) {
          // Simulate click
          const event = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          firstTab.dispatchEvent(event);
        }
      }
    });
  }

  // Variable to store the backdrop element
  let backdropElement = null;

  // Function to enhance WAU.Modal with our additions
  function enhanceWAUModal() {
    if (typeof WAU === "undefined" || !WAU.Modal) return;

    // Store original functions
    const originalOpenByName = WAU.Modal._openByName;
    const originalCloseByName = WAU.Modal._closeByName;

    // Override open function
    WAU.Modal._openByName = function (name) {
      // Call original function
      originalOpenByName.call(this, name);

      // If it's our size chart modal, enhance it
      if (name === "size-chart-modal") {
        // Lock body scroll
        lockBodyScroll();

        // Force create and show backdrop
        forceShowBackdrop();

        // Make sure tabs work
        activateFirstTabIfNeeded();

        // Force correct overflow settings
        forceOverflowSettings();

        // Listen for window resize to maintain correct settings
        window.addEventListener("resize", forceOverflowSettings);
      }
    };

    // Override close function
    WAU.Modal._closeByName = function (name) {
      // Call original function
      originalCloseByName.call(this, name);

      // If it's the size chart modal, clean up
      if (name === "size-chart-modal") {
        // Unlock body scroll
        unlockBodyScroll();

        // Force hide backdrop
        forceHideBackdrop();

        // Remove resize listener
        window.removeEventListener("resize", forceOverflowSettings);
      }
    };

    // Make sure all size chart buttons use our enhanced modal
    setupSizeChartButtons();
  }

  // Function to force show backdrop
  function forceShowBackdrop() {
    // Create backdrop if it doesn't exist
    if (!backdropElement) {
      backdropElement = document.createElement("div");
      backdropElement.id = "size-chart-backdrop";
      backdropElement.style.position = "fixed";
      backdropElement.style.top = "0";
      backdropElement.style.left = "0";
      backdropElement.style.right = "0";
      backdropElement.style.bottom = "0";
      backdropElement.style.width = "100%";
      backdropElement.style.height = "100%";
      backdropElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      backdropElement.style.zIndex = "9998";
      backdropElement.style.cursor = "pointer";

      // Add click event
      backdropElement.addEventListener("click", function () {
        closeModal();
      });

      // Add to body
      document.body.appendChild(backdropElement);
    }

    // Force backdrop to be visible
    backdropElement.style.display = "block";
  }

  // Function to force hide backdrop
  function forceHideBackdrop() {
    if (backdropElement) {
      backdropElement.style.display = "none";
    }
  }

  // Function to set up close on escape key
  function setupCloseOnEscape() {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        const modal = document.querySelector(
          '[data-wau-modal="size-chart-modal"].modal--active'
        );
        if (modal) {
          closeModal();
        }
      }
    });
  }

  // Function to close modal
  function closeModal() {
    if (typeof WAU !== "undefined" && WAU.Modal) {
      WAU.Modal._closeByName("size-chart-modal");
    }
  }

  // Variable to track scroll position
  let scrollPosition = 0;

  // Function to lock body scroll
  function lockBodyScroll() {
    // Store current scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Add scroll-lock styles to body
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";
  }

  // Function to unlock body scroll
  function unlockBodyScroll() {
    // Remove scroll-lock styles from body
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("position");
    document.body.style.removeProperty("top");
    document.body.style.removeProperty("width");

    // Restore scroll position
    window.scrollTo(0, scrollPosition);
  }

  // Function to set up size chart buttons
  function setupSizeChartButtons() {
    const buttons = document.querySelectorAll(
      '[data-wau-modal-target="size-chart-modal"]'
    );

    buttons.forEach(function (button) {
      // Remove existing event listeners
      const newButton = button.cloneNode(true);
      if (button.parentNode) {
        button.parentNode.replaceChild(newButton, button);
      }

      // Add new click event
      newButton.addEventListener("click", function (e) {
        e.preventDefault();

        if (typeof WAU !== "undefined" && WAU.Modal) {
          WAU.Modal._openByName("size-chart-modal");
        }
      });
    });
  }

  // Initialize immediately
  initialize();
})();
