document.addEventListener("DOMContentLoaded", function () {
  function handleTabClick(button) {
    const targetTab = button.getAttribute("data-tab");
    const modalContent = button.closest(".tab-block");

    if (modalContent) {
      // Remove active class from all tabs and tab contents
      const tabButtons = modalContent.querySelectorAll(
        '[data-name="table-nav"]'
      );
      const tabContents = modalContent.querySelectorAll(
        '[data-name="table-content"]'
      );

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab and corresponding content
      button.classList.add("active");
      modalContent
        .querySelector(`[data-tab="${targetTab}"][data-name="table-content"]`)
        .classList.add("active");
    }
  }

  // Event delegation for tab switching
  document.addEventListener("click", function (event) {
    const tabButton = event.target.closest('[data-name="table-nav"]');
    if (tabButton) {
      event.preventDefault();
      handleTabClick(tabButton);
    }
  });

  // Scroll Prevention
  function disablePageScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollTop}px`;
    document.body.style.left = `-${scrollLeft}px`;
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";

    document.body.dataset.scrollTop = scrollTop;
    document.body.dataset.scrollLeft = scrollLeft;
  }

  function enablePageScroll() {
    const scrollTop = parseInt(document.body.dataset.scrollTop || "0");
    const scrollLeft = parseInt(document.body.dataset.scrollLeft || "0");

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.width = "";
    document.body.style.height = "";
    document.body.style.overflow = "";

    window.scrollTo(scrollLeft, scrollTop);
  }

  // Modal Open/Close Handlers
  function setupModalHandlers() {
    const modalTriggers = document.querySelectorAll(
      '.js-modal-open[data-wau-modal-target="size-chart-modal"]'
    );
    const modalCloseButtons = document.querySelectorAll(".js-modal-close");
    const modalOverlay = document.querySelector(".js-modal-overlay");

    // Open modal handlers
    modalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", disablePageScroll);
    });

    // Close modal handlers
    modalCloseButtons.forEach((closer) => {
      closer.addEventListener("click", enablePageScroll);
    });

    // Overlay close handler
    if (modalOverlay) {
      modalOverlay.addEventListener("click", enablePageScroll);
    }

    // Escape key close handler
    document.addEventListener("keyup", function (event) {
      if (event.key === "Escape") {
        enablePageScroll();
      }
    });
  }

  // Initialize modal handlers
  setupModalHandlers();
});
