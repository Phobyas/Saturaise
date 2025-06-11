/**
 * Fixed Size Chart Modal JS - Prevents Auto-Display and Ensures Proper Closing
 */
(function () {
  "use strict";

  let isInitialized = false;
  let modalContainer = null;
  let backdrop = null;

  // Initialize function with proper error handling
  function initialize() {
    if (isInitialized) return;

    try {
      setupModal();
      setupTabFunctionality();
      setupCloseHandlers();
      setupKeyboardHandlers();
      isInitialized = true;
      console.log("Size chart modal initialized successfully");
    } catch (error) {
      console.error("Error initializing size chart modal:", error);
    }
  }

  // Setup modal container and ensure it's hidden by default
  function setupModal() {
    modalContainer = document.querySelector(
      '[data-wau-modal="size-chart-modal"]'
    );

    if (!modalContainer) {
      console.warn("Size chart modal container not found");
      return;
    }

    // Force modal to be hidden initially
    modalContainer.style.display = "none";
    modalContainer.classList.remove("modal--active");
    modalContainer.setAttribute("aria-hidden", "true");

    // Create or find backdrop
    backdrop =
      document.querySelector(".js-modal-overlay") ||
      document.getElementById("size-chart-backdrop");

    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "size-chart-backdrop";
      backdrop.className = "js-modal-overlay";
      backdrop.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9998;
        cursor: pointer;
      `;
      document.body.appendChild(backdrop);
    }

    // Ensure backdrop is hidden initially
    backdrop.style.display = "none";
    backdrop.classList.remove("modal-open");
  }

  // Setup tab functionality with error handling
  function setupTabFunctionality() {
    document.addEventListener("click", function (e) {
      const tab = e.target.closest('[data-name="table-nav"]');
      if (!tab) return;

      e.preventDefault();
      e.stopPropagation();

      try {
        const tabId = tab.getAttribute("data-tab");
        const tabBlock = tab.closest(".tab-block");

        if (!tabBlock || !tabId) return;

        // Remove active class from all tabs
        tabBlock.querySelectorAll('[data-name="table-nav"]').forEach((t) => {
          t.classList.remove("active");
        });

        // Add active class to clicked tab
        tab.classList.add("active");

        // Hide all content panes
        tabBlock
          .querySelectorAll('[data-name="table-content"]')
          .forEach((content) => {
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

          const table = activeContent.querySelector("table");
          if (table) {
            table.style.display = "table";
          }
        }
      } catch (error) {
        console.error("Error in tab functionality:", error);
      }
    });

    // Activate first tab after a delay to ensure DOM is ready
    setTimeout(activateFirstTab, 100);
  }

  // Activate first tab if none are active
  function activateFirstTab() {
    try {
      const tabContainer = document.querySelector(".tab-block");
      if (!tabContainer) return;

      const activeTab = tabContainer.querySelector(
        '[data-name="table-nav"].active'
      );
      if (activeTab) return; // Already has active tab

      const firstTab = tabContainer.querySelector('[data-name="table-nav"]');
      if (firstTab) {
        firstTab.click();
      }
    } catch (error) {
      console.error("Error activating first tab:", error);
    }
  }

  // Setup close handlers
  function setupCloseHandlers() {
    // Close button handler
    document.addEventListener("click", function (e) {
      if (e.target.closest(".js-modal-close, .modal__trigger--close")) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }
    });

    // Backdrop click handler
    if (backdrop) {
      backdrop.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    // Setup size chart trigger buttons
    document.addEventListener("click", function (e) {
      const trigger = e.target.closest(
        '[data-wau-modal-target="size-chart-modal"]'
      );
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }
    });
  }

  // Setup keyboard handlers
  function setupKeyboardHandlers() {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isModalOpen()) {
        e.preventDefault();
        closeModal();
      }
    });
  }

  // Check if modal is open
  function isModalOpen() {
    return (
      modalContainer &&
      modalContainer.classList.contains("modal--active") &&
      modalContainer.style.display !== "none"
    );
  }

  // Open modal function
  function openModal() {
    if (!modalContainer) {
      console.error("Modal container not found");
      return;
    }

    try {
      // Ensure we have a backdrop
      if (!backdrop) {
        setupModal();
      }

      // Show and activate backdrop first
      if (backdrop) {
        backdrop.style.display = "block";
        backdrop.classList.add("modal-open");
        // Force backdrop to be visible
        backdrop.style.opacity = "1";
        backdrop.style.visibility = "visible";
      }

      // Add modal wrapper classes to body/document
      const wrapper =
        document.querySelector(".js-modal-toggle-wrapper") || document.body;
      wrapper.classList.add("modal--open");

      // Show modal
      modalContainer.style.display = "block";
      modalContainer.classList.add("modal--active");
      modalContainer.setAttribute("aria-hidden", "false");

      // Lock body scroll
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");

      // Add specific modal class to wrapper
      wrapper.classList.add("modal-size-chart-modal--open");

      // Ensure first tab is active
      setTimeout(activateFirstTab, 50);

      console.log("Size chart modal opened with backdrop");
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  }

  // Close modal function
  function closeModal() {
    if (!modalContainer) return;

    try {
      // Hide and deactivate backdrop
      if (backdrop) {
        backdrop.style.display = "none";
        backdrop.classList.remove("modal-open");
        backdrop.style.opacity = "0";
        backdrop.style.visibility = "hidden";
      }

      // Remove modal wrapper classes from body/document
      const wrapper =
        document.querySelector(".js-modal-toggle-wrapper") || document.body;
      wrapper.classList.remove("modal--open");
      wrapper.classList.remove("modal-size-chart-modal--open");

      // Hide modal
      modalContainer.style.display = "none";
      modalContainer.classList.remove("modal--active");
      modalContainer.setAttribute("aria-hidden", "true");

      // Unlock body scroll
      document.body.style.removeProperty("overflow");
      document.body.classList.remove("modal-open");

      console.log("Size chart modal closed with backdrop hidden");
    } catch (error) {
      console.error("Error closing modal:", error);
    }
  }

  // Force close any open modals on page load
  function forceCloseOnLoad() {
    // Close all modals
    const openModals = document.querySelectorAll(
      ".modal--active, [data-wau-modal].modal--active"
    );
    openModals.forEach((modal) => {
      modal.style.display = "none";
      modal.classList.remove("modal--active");
      modal.setAttribute("aria-hidden", "true");
    });

    // Close all backdrops
    const openBackdrops = document.querySelectorAll(
      ".js-modal-overlay, #size-chart-backdrop"
    );
    openBackdrops.forEach((backdrop) => {
      backdrop.style.display = "none";
      backdrop.classList.remove("modal-open");
      backdrop.style.opacity = "0";
      backdrop.style.visibility = "hidden";
    });

    // Remove modal classes from wrapper and body
    const wrapper =
      document.querySelector(".js-modal-toggle-wrapper") || document.body;
    wrapper.classList.remove("modal--open", "modal-size-chart-modal--open");

    document.body.style.removeProperty("overflow");
    document.body.classList.remove("modal-open");
  }

  // Override WAU.Modal if it exists to prevent conflicts
  function overrideWAUModal() {
    if (typeof WAU !== "undefined" && WAU.Modal) {
      const originalOpen = WAU.Modal._openByName;
      const originalClose = WAU.Modal._closeByName;

      WAU.Modal._openByName = function (name) {
        if (name === "size-chart-modal") {
          openModal();
          return;
        }
        if (originalOpen) {
          originalOpen.call(this, name);
        }
      };

      WAU.Modal._closeByName = function (name) {
        if (name === "size-chart-modal") {
          closeModal();
          return;
        }
        if (originalClose) {
          originalClose.call(this, name);
        }
      };
    }
  }

  // Initialize when DOM is ready
  function initWhenReady() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        forceCloseOnLoad();
        setTimeout(initialize, 100);
        setTimeout(overrideWAUModal, 200);
      });
    } else {
      forceCloseOnLoad();
      setTimeout(initialize, 100);
      setTimeout(overrideWAUModal, 200);
    }
  }

  // Also initialize on window load as backup
  window.addEventListener("load", function () {
    if (!isInitialized) {
      forceCloseOnLoad();
      initialize();
      overrideWAUModal();
    }
  });

  // Handle Shopify section reloads
  document.addEventListener("shopify:section:load", function () {
    isInitialized = false;
    setTimeout(function () {
      forceCloseOnLoad();
      initialize();
      overrideWAUModal();
    }, 100);
  });

  // Expose global functions for debugging
  window.SizeChartModal = {
    open: openModal,
    close: closeModal,
    isOpen: isModalOpen,
    reinitialize: function () {
      isInitialized = false;
      initialize();
    },
  };

  // Start initialization
  initWhenReady();
})();
