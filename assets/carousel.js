// Optimized Carousel JS - Reduced execution time and improved performance
(function () {
  // Set minimum heights immediately with CSS to prevent CLS
  const carouselCSS = document.createElement("style");
  carouselCSS.textContent = `
    [data-section-type="carousel"] .js-carousel {
      min-height: 350px;
      opacity: 1;
    }
    @media (min-width: 768px) {
      [data-section-type="carousel"] .js-carousel {
        min-height: 300px;
      }
    }
  `;
  document.head.appendChild(carouselCSS);
})();

// Cached Flickity loader with promise-based loading
const FlickityLoader = {
  loaded: false,
  loading: false,
  callbacks: [],

  load() {
    if (this.loaded) {
      return Promise.resolve();
    }

    if (this.loading) {
      return new Promise((resolve) => {
        this.callbacks.push(resolve);
      });
    }

    this.loading = true;

    return new Promise((resolve, reject) => {
      if (typeof Flickity !== "undefined") {
        this.loaded = true;
        this.loading = false;
        resolve();
        this.callbacks.forEach((cb) => cb());
        this.callbacks = [];
        return;
      }

      if (typeof jsAssets !== "undefined" && jsAssets.flickity) {
        const script = document.createElement("script");
        script.src = jsAssets.flickity;
        script.onload = () => {
          this.loaded = true;
          this.loading = false;
          resolve();
          this.callbacks.forEach((cb) => cb());
          this.callbacks = [];
        };
        script.onerror = () => {
          this.loading = false;
          reject(new Error("Flickity failed to load"));
        };
        document.head.appendChild(script);
      } else {
        this.loading = false;
        reject(new Error("Flickity asset not found"));
      }
    });
  },
};

// Optimized carousel initialization with lazy loading
function carouselInit(container) {
  const carousel = container.querySelector(".js-carousel");
  if (!carousel) return false;

  // Set minimum height immediately to prevent CLS
  carousel.style.minHeight = window.innerWidth < 768 ? "350px" : "300px";
  carousel.classList.remove("carousel-loaded--false");
  carousel.classList.add("carousel-loaded--true");

  return FlickityLoader.load()
    .then(() => {
      if (typeof Flickity === "undefined") {
        console.error("Flickity not available for carouselInit");
        return false;
      }

      let flktyOptions;

      try {
        // Parse Flickity options
        let flktyData;
        if (
          container.querySelector("[data-flickity-mobile]") &&
          window.innerWidth < 768
        ) {
          flktyData = carousel.getAttribute("data-flickity-mobile");
        } else if (container.querySelector("[data-flickity-other]")) {
          flktyData = carousel.getAttribute("data-flickity-other");
        } else {
          flktyData = carousel.getAttribute("data-flickity");
        }

        flktyOptions = JSON.parse(flktyData || "{}");

        // Performance optimizations
        Object.assign(flktyOptions, {
          pageDots: false,
          adaptiveHeight: false,
          resize: true,
          watchCSS: false,
          dragThreshold: 10,
          lazyLoad: 2, // Lazy load next 2 images
          imagesLoaded: false, // Don't wait for all images
          setGallerySize: false, // Let CSS handle sizing
        });

        // Initialize Flickity
        const flkty = new Flickity(carousel, flktyOptions);
        carousel.classList.remove("is-hidden");

        // Setup additional features
        setupCarouselFeatures(carousel, container, flkty);

        // Mark as loaded
        container.setAttribute("data-section-loaded", "true");

        return flkty;
      } catch (e) {
        console.error("Error initializing carousel:", e);
        fallbackCarouselDisplay(carousel);
        return false;
      }
    })
    .catch((error) => {
      console.error("Flickity loading failed:", error);
      fallbackCarouselDisplay(carousel);
      return false;
    });
}

// Optimized carousel features setup
function setupCarouselFeatures(carousel, container, flkty) {
  // Use requestIdleCallback for non-critical setup
  const setupTasks = [
    () => carouselResize(carousel),
    () => carouselAccesibility(carousel),
    () => setupCarouselPagination(carousel, container),
    () => setupDragFix(flkty),
  ];

  if ("requestIdleCallback" in window) {
    setupTasks.forEach((task) => {
      requestIdleCallback(task);
    });
  } else {
    setTimeout(() => {
      setupTasks.forEach((task) => task());
    }, 0);
  }
}

// Fallback display without Flickity
function fallbackCarouselDisplay(carousel) {
  carousel.classList.remove("is-hidden");
  carousel.setAttribute("data-section-loaded", "true");

  const slides = carousel.querySelectorAll(".slideshow__slide");
  if (slides && slides.length) {
    slides[0].style.cssText = "display: block; opacity: 1;";
  }
}

// Optimized carousel pagination
function setupCarouselPagination(carousel, container) {
  if (carousel.classList.contains("section-testimonials__inner-wrapper"))
    return;

  const carouselPag = container.querySelector(".js-carousel-pagination");
  if (carouselPag && typeof Flickity !== "undefined") {
    carouselPagination(carousel, carouselPag);
  }
}

// Optimized drag fix
function setupDragFix(flkty) {
  if (!flkty) return;

  let dragStartHandler, dragEndHandler;

  dragStartHandler = () => {
    document.ontouchmove = (e) => e.preventDefault();
  };

  dragEndHandler = () => {
    document.ontouchmove = () => true;
  };

  flkty.on("dragStart", dragStartHandler);
  flkty.on("dragEnd", dragEndHandler);
}

// Cached DOM queries for better performance
const selectorCache = new Map();

function getCachedElements(selector) {
  if (!selectorCache.has(selector)) {
    selectorCache.set(selector, document.querySelectorAll(selector));
  }
  return selectorCache.get(selector);
}

// Initialize carousels with intersection observer for better performance
function initializeCarousels() {
  const carouselSections = getCachedElements('[data-section-type="carousel"]');

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            carouselInit(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0,
      }
    );

    carouselSections.forEach((container) => {
      observer.observe(container);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    carouselSections.forEach((container) => {
      carouselInit(container);
    });
  }
}

// Optimized Shopify event handlers with debouncing
let eventTimeout;

function handleShopifyEvents() {
  document.addEventListener(
    "shopify:section:load",
    function (event) {
      if (eventTimeout) clearTimeout(eventTimeout);

      eventTimeout = setTimeout(() => {
        if (!event.target.querySelector('[data-section-type="carousel"]'))
          return;

        FlickityLoader.load().then(() => {
          carouselInit(event.target);

          if (event.target.querySelector(".section-testimonials")) {
            carouselSlideLast(event.target);
          }
        });
      }, 100);
    },
    { passive: true }
  );

  document.addEventListener(
    "shopify:block:select",
    function (event) {
      const container = event.target.closest("[data-section-type]");
      if (
        container &&
        container.getAttribute("data-section-type") === "carousel"
      ) {
        FlickityLoader.load().then(() => {
          carouselSlideEdit(event.target);
        });
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "shopify:block:deselect",
    function (event) {
      const container = event.target.closest("[data-section-type]");
      if (
        !container ||
        container.getAttribute("data-section-type") !== "carousel"
      )
        return;

      FlickityLoader.load().then(() => {
        if (container.classList.contains("section-image-carousel-text")) {
          carouselSlideReset(event.target);
        }
        if (
          event.target
            .closest("[data-section-type]")
            ?.matches(".section-testimonials")
        ) {
          carouselSlideFirst(event.target);
        }
        carouselSlideRestart(event.target);
      });
    },
    { passive: true }
  );
}

// Optimized carousel control functions
function carouselSlideFirst(container) {
  const carousel = container.closest(".js-carousel");
  if (!carousel || typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (flkty) flkty.select(0);
}

function carouselSlideLast(container) {
  const carousel = container.querySelector(".js-carousel");
  if (!carousel || typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (flkty && flkty.cells && flkty.cells.length) {
    flkty.select(flkty.cells.length - 1);
  }
}

function carouselSlideEdit(container) {
  const carousel = container.closest(".js-carousel");
  if (!carousel || typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (!flkty) return false;

  const slide = container.getAttribute("data-slide-index");
  if (slide !== null) {
    flkty.select(parseInt(slide));
    flkty.pausePlayer();
  }
}

function carouselSlideRestart(container) {
  const carousel = container.closest(".js-carousel");
  if (!carousel || typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (flkty) flkty.unpausePlayer();
}

function carouselSlideReset(container) {
  const carousel = container.closest(".js-carousel");
  if (!carousel || typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (flkty) flkty.select(0);
}

function carouselResize(carousel) {
  if (typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (flkty) flkty.resize();
}

function carouselAccesibility(carousel) {
  if (typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (!flkty || !flkty.handles || !flkty.handles.length || !flkty.nextButton)
    return false;

  flkty.handles[0].before(flkty.nextButton.element);
  flkty.nextButton.element.before(flkty.prevButton.element);
}

function carouselPagination(carousel, pagination) {
  if (typeof Flickity === "undefined") return false;

  const flkty = Flickity.data(carousel);
  if (!flkty) return false;

  // Use event delegation for better performance
  pagination.addEventListener(
    "click",
    (event) => {
      if (event.target.classList.contains("js-nav-item")) {
        removeClasses();
        event.target.classList.add("is-nav-selected");
        flkty.select(parseInt(event.target.dataset.slideIndex));
      }
    },
    { passive: false }
  );

  flkty.on("change", function (index) {
    const item = pagination.querySelector(
      `[data-slide-index="${index}"].js-nav-item`
    );
    if (item) {
      removeClasses();
      item.classList.add("is-nav-selected");
    }
  });

  function removeClasses() {
    pagination.querySelectorAll(".js-nav-item").forEach((item) => {
      item.classList.remove("is-nav-selected");
    });
  }
}

// Optimized resize handler with throttling
let resizeTimeout;
function handleResize() {
  if (resizeTimeout) return;

  resizeTimeout = requestAnimationFrame(() => {
    const carousels = document.querySelectorAll(
      '[data-section-type="carousel"] .js-carousel'
    );
    const minHeight = window.innerWidth < 768 ? "350px" : "300px";

    carousels.forEach((carousel) => {
      carousel.style.minHeight = minHeight;

      if (typeof Flickity !== "undefined") {
        const flkty = Flickity.data(carousel);
        if (flkty) {
          setTimeout(() => flkty.resize(), 100);
        }
      }
    });

    resizeTimeout = null;
  });
}

// Initialize everything when DOM is ready
function initCarouselSystem() {
  initializeCarousels();
  handleShopifyEvents();

  window.addEventListener("resize", handleResize, { passive: true });
}

// Use efficient loading strategy
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCarouselSystem, {
    once: true,
  });
} else {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(initCarouselSystem);
  } else {
    setTimeout(initCarouselSystem, 0);
  }
}
