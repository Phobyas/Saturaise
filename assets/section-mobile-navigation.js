function setupDrawer() {
  let mobileHeader = document.getElementById("shopify-section-mobile-header"),
    mobileNav = document.querySelector(".js-mobile-header"),
    mobileSearch = document.getElementById("mobile-search"),
    announcementBar = document.getElementById("announcement-bar");

  // Set header height and announcement bar height
  const headerHeight = mobileHeader ? mobileHeader.offsetHeight : 0;
  const announcementBarHeight = announcementBar
    ? announcementBar.offsetHeight
    : 0;

  document.documentElement.style.setProperty(
    "--header-height",
    `${headerHeight}px`
  );
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    `${announcementBarHeight}px`
  );

  function getHeight(element) {
    element = element.cloneNode(true);
    element.style.visibility = "hidden";
    document.body.appendChild(element);
    var height = element.offsetHeight + 0;
    document.body.removeChild(element);
    element.style.visibility = "visible";
    return height;
  }

  Events.on("slideout:open:mobile-navigation", function (slideout) {
    setTimeout(function () {
      if (mobileNav) mobileNav.style.zIndex = "14";
    }, 200);
  });

  Events.on("slideout:close:mobile-navigation", function (slideout) {
    setTimeout(function () {
      if (mobileSearch) mobileSearch.style.zIndex = "0";
      if (mobileNav) mobileNav.style.zIndex = "12";
    }, 200);
  });
}

function setupMobileSearch() {
  const searchToggle = document.querySelector(".js-mobile-search-toggle");
  const mobileSearch = document.getElementById("mobile-search");
  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");
  const backdrop = document.querySelector(".mobile-search-backdrop");

  if (searchToggle && mobileSearch && mobileHeader) {
    const updateHeaderHeight = () => {
      const headerHeight = mobileHeader.offsetHeight;
      document.documentElement.style.setProperty(
        "--header-height",
        `${headerHeight}px`
      );
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    // Create a MutationObserver to watch for style changes
    const observer = new MutationObserver((mutations) => {
      if (mobileSearch.classList.contains("mobile-search--visible")) {
        mobileHeader.style.zIndex = "15";
        mobileHeader.style.opacity = "1";
        mobileHeader.style.top = "0px";
      }
    });

    // Start observing the header for style changes
    observer.observe(mobileHeader, {
      attributes: true,
      attributeFilter: ["style"],
    });

    searchToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      mobileSearch.classList.toggle("mobile-search--visible");
      backdrop.classList.toggle("is-active");

      if (mobileSearch.classList.contains("mobile-search--visible")) {
        mobileHeader.style.zIndex = "15";
        mobileHeader.style.opacity = "1";
        mobileHeader.style.top = "0px";
      }
    });

    backdrop.addEventListener("click", function () {
      mobileSearch.classList.remove("mobile-search--visible");
      backdrop.classList.remove("is-active");
    });
  }
}

function handleMobileHeaderScroll() {
  const announcementBar = document.getElementById("announcement-bar");
  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");

  if (!announcementBar || !mobileHeader) return;

  const announcementBarHeight = announcementBar.offsetHeight;
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    `${announcementBarHeight}px`
  );

  let lastScrollTop = 0;
  const scrollThreshold = 10; // Amount of scroll needed to trigger the change

  const handleScroll = () => {
    const currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;

    // If we've scrolled past the threshold, hide announcement bar and adjust header
    if (currentScrollTop > scrollThreshold) {
      announcementBar.classList.add("is-hidden");
      mobileHeader.classList.add("announcement-hidden");
    } else {
      // At the top of the page - show announcement bar and position header below it
      announcementBar.classList.remove("is-hidden");
      mobileHeader.classList.remove("announcement-hidden");
    }

    lastScrollTop = currentScrollTop;
  };

  window.removeEventListener("scroll", handleScroll);
  window.addEventListener("scroll", handleScroll, { passive: true });
}

document
  .querySelectorAll('[data-section-type="mobile-header"]')
  .forEach(function (container) {
    WAU.Slideout.init("mobile-navigation");
    setupDrawer();
    setupMobileSearch();
    handleMobileHeaderScroll();

    if (
      document.querySelector(".mobile-nav__mobile-header .js-mini-cart-trigger")
    ) {
      document
        .querySelector(".mobile-nav__mobile-header .js-mini-cart-trigger")
        .addEventListener("click", function () {
          WAU.Slideout._closeByName("mobile-navigation");
        });
    }
  });

document.addEventListener("shopify:section:select", function (event) {
  if (event.target.querySelector('[data-section-type="mobile-header"]')) {
    var container = event.target.querySelector(
      '[data-section-type="mobile-header"]'
    );

    if (WAU.Helpers.isTouch() || WAU.Helpers.isMobile()) {
      WAU.Slideout._openByName("mobile-navigation");
      setupDrawer();
    }
  }
});

document.addEventListener("shopify:section:deselect", function (event) {
  if (event.target.querySelector('[data-section-type="mobile-header"]')) {
    WAU.Slideout._closeByName("mobile-navigation");
  }
});

document.addEventListener("shopify:block:select", function (event) {
  if (!event.target.querySelector('[data-section-type="mobile-header"]'))
    return false;
  if (WAU.Helpers.isTouch() || WAU.Helpers.isMobile()) {
    WAU.Slideout._openByName("mobile-navigation");
    setupDrawer();
  }
});
