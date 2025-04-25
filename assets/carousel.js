// Ensure Flickity is available when needed
(function () {
  // Check if Flickity is loaded
  function ensureFlickityLoaded(callback) {
    if (typeof Flickity !== "undefined") {
      callback();
      return;
    }

    // If not loaded, load it from jsAssets
    if (typeof jsAssets !== "undefined" && jsAssets.flickity) {
      const script = document.createElement("script");
      script.src = jsAssets.flickity;
      script.onload = callback;
      document.head.appendChild(script);
    } else {
      console.error("Flickity asset not found in jsAssets");
    }
  }

  // Initialize all carousels in the section
  document
    .querySelectorAll('[data-section-type="carousel"]')
    .forEach(function (container) {
      ensureFlickityLoaded(function () {
        setTimeout(function () {
          carouselInit(container);
        }, 200);
      });
    });

  // Event handlers for Shopify section lifecycle events
  document.addEventListener("shopify:section:load", function (event) {
    if (!event.target.querySelector('[data-section-type="carousel"]'))
      return false;

    ensureFlickityLoaded(function () {
      setTimeout(function () {
        carouselInit(event.target);

        // If testimonials section
        if (
          event.target
            .querySelector("[data-section-type]")
            ?.matches(".section-testimonials")
        ) {
          carouselSlideLast(event.target);
        }
      }, 200);
    });
  });

  document.addEventListener("shopify:block:select", function (event) {
    var container = event.target.closest("[data-section-type]");
    if (
      container &&
      container.getAttribute("data-section-type") === "carousel"
    ) {
      ensureFlickityLoaded(function () {
        setTimeout(function () {
          carouselSlideEdit(event.target);
        }, 200);
      });
    }
  });

  document.addEventListener("shopify:block:deselect", function (event) {
    var container = event.target.closest("[data-section-type]");
    if (
      !container ||
      container.getAttribute("data-section-type") !== "carousel"
    )
      return;

    ensureFlickityLoaded(function () {
      if (container.classList.contains("section-image-carousel-text")) {
        carouselSlideReset(event.target);
      }
      // If testimonials section
      if (
        event.target
          .closest("[data-section-type]")
          ?.matches(".section-testimonials")
      ) {
        carouselSlideFirst(event.target);
      }
      carouselSlideRestart(event.target);
    });
  });
})();

function carouselSlideFirst(container) {
  let carousel = container.closest(".js-carousel");
  if (!carousel) return false;

  if (typeof Flickity === "undefined") {
    console.warn("Flickity not available for carouselSlideFirst");
    return false;
  }

  let flkty = Flickity.data(carousel);
  if (!flkty) return false;

  flkty.select(0);
}

function carouselSlideLast(container) {
  let carousel = container.querySelector(".js-carousel");
  if (!carousel) return false;

  if (typeof Flickity === "undefined") {
    console.warn("Flickity not available for carouselSlideLast");
    return false;
  }

  let flkty = Flickity.data(carousel);
  if (!flkty || !flkty.cells || !flkty.cells.length) return false;

  flkty.select(flkty.cells.length - 1);
}

function carouselInit(container) {
  var carousel = container.querySelector(".js-carousel");
  if (!carousel) return false;

  if (typeof Flickity === "undefined") {
    console.error("Flickity not available for carouselInit");
    return false;
  }

  if (carousel.classList.contains("carousel-loaded--false")) {
    carousel.classList.remove("carousel-loaded--false");
    carousel.classList.add("carousel-loaded--true");
  }

  var flktyOptions;

  try {
    // Carousel on mobile only
    if (
      container.querySelector("[data-flickity-mobile]") &&
      WAU.Helpers.isMobile()
    ) {
      const flktyData = carousel.getAttribute("data-flickity-mobile");
      flktyOptions = JSON.parse(flktyData);
    } else if (container.querySelector("[data-flickity-other]")) {
      const flktyData = carousel.getAttribute("data-flickity-other");
      flktyOptions = JSON.parse(flktyData);
    } else {
      const flktyData = carousel.getAttribute("data-flickity");
      flktyOptions = JSON.parse(flktyData);
    }

    new Flickity(carousel, flktyOptions);
    carousel.classList.remove("is-hidden");

    carouselResize(carousel);
    carouselAccesibility(carousel);

    var flkty = Flickity.data(carousel);
    if (flkty) flkty.offsetHeight;

    // Bail if a testimonials container
    if (!carousel.classList.contains("section-testimonials__inner-wrapper")) {
      // Carousel pagination
      var carouselPag = container.querySelector(".js-carousel-pagination");
      if (carouselPag) carouselPagination(carousel, carouselPag);
    }

    // Carousel Drag Fix on Mobile
    if (flkty) {
      flkty.on("dragStart", function () {
        document.ontouchmove = (e) => e.preventDefault();
      });
      flkty.on("dragEnd", function () {
        document.ontouchmove = () => true;
      });
    }
  } catch (e) {
    console.error("Error initializing carousel:", e);
    // Try to recover by displaying the carousel content without Flickity
    carousel.classList.remove("is-hidden");
    const slides = carousel.querySelectorAll(".slideshow__slide");
    if (slides && slides.length) {
      slides[0].style.display = "block";
      slides[0].style.opacity = "1";
    }
  }
}

function carouselAccesibility(carousel) {
  if (typeof Flickity === "undefined") return false;

  var flkty = Flickity.data(carousel);
  if (!flkty || !flkty.handles || !flkty.handles.length || !flkty.nextButton)
    return false;

  flkty.handles[0].before(flkty.nextButton.element);
  flkty.nextButton.element.before(flkty.prevButton.element);
}

function carouselSlideEdit(container) {
  var carousel = container.closest(".js-carousel");
  if (!carousel) return false;

  if (typeof Flickity === "undefined") return false;

  var flkty = Flickity.data(carousel);
  if (!flkty) return false;

  var slide = container.getAttribute("data-slide-index");
  flkty.select(slide);
  flkty.pausePlayer();
}

function carouselSlideRestart(container) {
  var carousel = container.closest(".js-carousel");
  if (!carousel) return false;

  if (typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (!flkty) return false;

  flkty.unpausePlayer();
}

function carouselSlideReset(container) {
  var carousel = container.closest(".js-carousel");
  if (!carousel) return false;

  if (typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (!flkty) return false;

  flkty.select(0);
}

function carouselResize(carousel) {
  if (typeof Flickity === "undefined") return false;

  var flkty = Flickity.data(carousel);
  if (!flkty) return false;

  flkty.resize();
}

function carouselPagination(carousel, pagination) {
  if (typeof Flickity === "undefined") return false;

  var flkty = Flickity.data(carousel);
  if (!flkty) return false;

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("js-nav-item")) {
      removeClasses();
      event.target.classList.add("is-nav-selected");
      flkty.select(event.target.dataset.slideIndex);
    }
  });

  flkty.on("change", function (index) {
    let item = pagination.querySelector(
      `[data-slide-index="${index}"].js-nav-item`
    );
    if (!item) return;

    removeClasses();
    item.classList.add("is-nav-selected");
  });

  function removeClasses() {
    pagination.querySelectorAll(".js-nav-item").forEach((item) => {
      item.classList.remove("is-nav-selected");
    });
  }
}
