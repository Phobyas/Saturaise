const Header = {
  init: function init(container) {
    const themeHeader = document.querySelector(".js-theme-header"),
      clearElement = document.querySelector(".js-clear-element"),
      menuItemsWithNestedDropdowns = document.querySelectorAll(
        ".js-menuitem-with-nested-dropdown"
      ),
      doubleTapToGoItems = document.querySelectorAll(".js-doubletap-to-go"),
      searchSlideout = container.querySelector(".searchbox");

    if (container.querySelector(".js-stickynav")) {
      setTimeout(function () {
        Header.clearSticky();
        Header.prepareSticky();
      }, 300);
    }

    if (document.querySelectorAll(".js-search-toggle").length > 0) {
      Header.initSearch(container, searchSlideout);
    }

    if (menuItemsWithNestedDropdowns) {
      Header.nestedDropdowns(menuItemsWithNestedDropdowns);
    }

    if (doubleTapToGoItems) {
      Header.doubleTapToGo(doubleTapToGoItems);
    }

    // Aria support
    WAU.a11yHelpers.setUpAriaExpansion();
    WAU.a11yHelpers.setUpAccessibleNavigationMenus();

    window.addEventListener("resize", function (event) {
      setTimeout(function () {
        Header.clearSticky();
        Header.prepareSticky();
      }, 300);
    });
    document.addEventListener("shopify:section:select", function (event) {
      setTimeout(function () {
        Header.clearSticky();
        Header.prepareSticky();
      }, 300);
    });
  },
  /**
   * Helper method to clear left overs from sticky container. In the context of
   * the Theme Editor integration.
   * @return {[type]} [description]
   */
  clearSticky: function clearSticky() {
    // Get the elements.
    const headerEl = document.querySelector(".js-theme-header");
    const clearEls = document.querySelectorAll(".js-clear-element");

    // Bail if no header element.
    if (!headerEl) {
      console.warn("Warning. Did not find an element to clear.");
      return false;
    }

    // Remove sticky navigation class from header.
    if (headerEl.classList.contains("sticky--active")) {
      headerEl.classList.remove("sticky--active");
    }
    // Check that we have a style attribute and remove it.
    if (headerEl.hasAttribute("style")) {
      headerEl.removeAttribute("style");
    }
  },
  prepareSticky: function prepareSticky() {
    let isMobile = window.innerWidth < 767,
      topBar = document.querySelector(".js-top-bar"),
      isSticky = false,
      elementClass;

    switch (isMobile) {
      case true:
        elementClass = ".js-mobile-header";
        isSticky = document.querySelector(".js-mobile-header")
          ? document
              .querySelector(".js-mobile-header")
              .classList.contains("stickynav")
          : "";
        break;
      case false:
        elementClass = ".js-theme-header";
        isSticky = document.querySelector(".js-theme-header")
          ? document
              .querySelector(".js-theme-header")
              .classList.contains("stickynav")
          : "";
        break;
    }

    if (isSticky) {
      const stickyElement = document.querySelector(elementClass);
      if (stickyElement) {
        stickyElement.classList.add("sticky-enabled");

        // Simple scroll monitoring for showing/hiding the header
        let scrollPos = 0;
        window.addEventListener("scroll", function () {
          const currentPos = window.scrollY;

          if (currentPos > 300) {
            if (currentPos < scrollPos) {
              // Scrolling up - show header
              stickyElement.classList.add("sticky--visible");
              stickyElement.classList.remove("sticky--hidden");
            } else {
              // Scrolling down - hide header
              stickyElement.classList.add("sticky--hidden");
              stickyElement.classList.remove("sticky--visible");
            }
          } else {
            // At top of page
            stickyElement.classList.remove("sticky--hidden");
            stickyElement.classList.add("sticky--visible");
          }

          scrollPos = currentPos;
        });
      }
    }
  },
  nestedDropdowns: function nestedDropdowns(dropdown) {
    // Making sure that nested dropdowns are properly placed in the correct place if they're offscreen.
    dropdown.forEach(function (menuItem) {
      menuItem.addEventListener("mouseenter", function (event) {
        const nestedDropdown = menuItem.querySelector(".js-dropdown-nested");

        if (nestedDropdown) {
          if (WAU.Helpers.isElementPastEdge(nestedDropdown)) {
            nestedDropdown.classList.add("dropdown--edge");

            // Check if first level menu item
            if (menuItem.classList.contains("js-first-level")) {
              // Add relative class
              menuItem.classList.add("relative");
            }
          }
        }
      });
    });
  },
  doubleTapToGo: function doubleTapToGo(items) {
    items.forEach(function (doubleTapItem) {
      let preventClick = false,
        prevEventTarget = undefined;

      const activeClass = doubleTapItem.getAttribute("data-active-class");

      Events.on("device:touchstart", function () {
        preventClick = true;
      });

      doubleTapItem.addEventListener("click", function (event) {
        if (preventClick) {
          event.preventDefault();
        }
      });

      doubleTapItem.addEventListener(
        "touchstart",
        function (event) {
          event.target.setAttribute("aria-expanded", "false");
          Header.closeMenu(activeClass);

          if (prevEventTarget === event.target) {
            preventClick = false;
          } else {
            event.target.classList.toggle(activeClass);
            event.target.setAttribute("aria-expanded", "true");
          }

          prevEventTarget = event.target;
        },
        { passive: true }
      );
    });
  },
  closeMenu: function closeMenu(activeClass) {
    document
      .querySelectorAll(`[data-active-class="${activeClass}"]`)
      .forEach(function (activeMenu) {
        activeMenu.classList.remove(activeClass);
      });
  },
};

document
  .querySelectorAll('[data-section-type="header"]')
  .forEach(function (container) {
    Header.init(container);
  });
