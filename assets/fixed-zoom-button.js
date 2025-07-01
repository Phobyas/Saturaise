/**
 * Truly Isolated Zoom Modal - Zero CSS/Gallery Interference
 * Updated: No desktop hover effects + preload all images for faster navigation
 */

(function () {
  "use strict";

  let initialized = false;
  let currentModalImage = null;
  let modalOpen = false;
  let preloadedImages = new Set(); // Track preloaded images

  function initFixedZoom() {
    if (initialized) return;

    const checkGallery = () => {
      const galleryContainer = document.getElementById(
        "scrollGalleryContainer"
      );
      const images = document.querySelectorAll(
        ".scroll--gallery_item img.product__image"
      );

      if (!galleryContainer || images.length === 0) {
        setTimeout(checkGallery, 500);
        return;
      }

      createFixedZoomButton(galleryContainer);
      preloadAllImages(); // Preload all gallery images immediately
      initialized = true;
    };

    checkGallery();
  }

  function preloadAllImages() {
    const images = document.querySelectorAll(
      ".scroll--gallery_item img.product__image"
    );

    images.forEach((img, index) => {
      // Get the high-res source for preloading
      const highResSrc = getHighResSrc(img);

      if (!preloadedImages.has(highResSrc)) {
        const preloadImg = new Image();
        preloadImg.onload = () => {
          preloadedImages.add(highResSrc);
        };
        preloadImg.src = highResSrc;
      }
    });
  }

  function createFixedZoomButton(container) {
    const existing = container.querySelector(".fixed-zoom-btn");
    if (existing) existing.remove();

    const button = document.createElement("button");
    button.className = "fixed-zoom-btn";
    button.type = "button";
    button.setAttribute("aria-label", "Zoom image");

    // Responsive positioning - different for mobile vs desktop
    const isMobile = window.innerWidth < 1024;

    button.style.cssText = `
      position: absolute !important;
      top: ${isMobile ? "10px" : "15px"} !important;
      right: ${isMobile ? "10px" : "15px"} !important;
      z-index: 100 !important;
      background: #323232 !important;
      border: none !important;
      border-radius: 50% !important;
      width: ${isMobile ? "44px" : "48px"} !important;
      height: ${isMobile ? "44px" : "48px"} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      color: white !important;
      backdrop-filter: blur(5px) !important;
    `;

    button.innerHTML = `
      <svg width="${isMobile ? "20" : "24"}" height="${
      isMobile ? "20" : "24"
    }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
        <line x1="8" y1="11" x2="14" y2="11"></line>
        <line x1="11" y1="8" x2="11" y2="14"></line>
      </svg>
    `;

    // REMOVED: Desktop hover effects - only apply to mobile
    if (isMobile) {
      button.addEventListener("mouseenter", function () {
        this.style.background = "#404040";
        this.style.transform = "scale(1.05)";
      });

      button.addEventListener("mouseleave", function () {
        this.style.background = "#323232";
        this.style.transform = "scale(1)";
      });
    }

    let clicking = false;
    button.addEventListener("click", function (e) {
      if (clicking) return;
      clicking = true;

      e.preventDefault();
      e.stopPropagation();

      const currentImage = getCurrentImage();
      if (currentImage) {
        openZoomModal(currentImage);
      }

      setTimeout(() => {
        clicking = false;
      }, 300);
    });

    container.appendChild(button);
  }

  function getCurrentImage() {
    // For desktop, get the first visible image or selected image
    if (window.innerWidth >= 1024) {
      // Try to get selected image first
      const selected = document.querySelector(
        ".scroll--gallery_item.is-selected img.product__image"
      );
      if (selected) return selected;

      // Fallback to first visible image
      const firstImage = document.querySelector(
        ".scroll--gallery_item img.product__image"
      );
      if (firstImage) return firstImage;
    }

    // Mobile logic (unchanged)
    if (window.innerWidth < 1024) {
      const selected = document.querySelector(
        ".scroll--gallery_item.is-selected img.product__image"
      );
      if (selected) return selected;

      const flickityContainer = document.getElementById(
        "scrollGalleryContainer"
      );
      if (flickityContainer && typeof Flickity !== "undefined") {
        const flickityInstance = Flickity.data(flickityContainer);
        if (flickityInstance && flickityInstance.selectedElement) {
          const img =
            flickityInstance.selectedElement.querySelector(
              "img.product__image"
            );
          if (img) return img;
        }
      }
    }

    return document.querySelector(".scroll--gallery_item img.product__image");
  }

  function openZoomModal(image) {
    if (modalOpen) return;
    modalOpen = true;

    // Remove any existing modal
    const existing = document.getElementById("completely-isolated-zoom-modal");
    if (existing) existing.remove();

    const highResSrc = getHighResSrc(image);
    currentModalImage = image;

    const images = Array.from(
      document.querySelectorAll(".scroll--gallery_item img.product__image")
    );
    const currentIndex = images.indexOf(image);

    // Create modal in separate container to avoid CSS inheritance
    const modalContainer = document.createElement("div");
    modalContainer.id = "zoom-modal-container";
    modalContainer.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 999999 !important;
      pointer-events: none !important;
      contain: strict !important;
    `;

    const modal = document.createElement("div");
    modal.id = "completely-isolated-zoom-modal";
    modal.style.cssText = `
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transition: opacity 0.3s ease, visibility 0.3s ease !important;
      overscroll-behavior: contain !important;
      overflow: hidden !important;
      pointer-events: auto !important;
      isolation: isolate !important;
      contain: strict !important;
    `;

    modal.innerHTML = `
      <div class="zoom-modal__backdrop" style="
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 0, 0, 0.9) !important;
        cursor: pointer !important;
      "></div>
      <div class="zoom-modal__container" style="
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
      ">
        <button class="zoom-modal__close" aria-label="Close" style="
          position: absolute !important;
          top: 20px !important;
          right: 20px !important;
          z-index: 1000001 !important;
          background: rgba(255, 255, 255, 0.9) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 44px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          color: #333 !important;
          font-size: 24px !important;
          font-weight: bold !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        ">×</button>
        <div class="zoom-modal__image-container" style="
          height: 60vh !important;
          position: relative !important;
          max-width: 85vw !important;
          max-height: 85vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
          background-color: #f6f6f6 !important;
          border-radius: 8px !important;
          transition: transform 0.3s ease, opacity 0.3s ease !important;
          touch-action: pan-x pan-y pinch-zoom !important;
        ">
          <img src="${highResSrc}" alt="${
      image.alt || "Product image"
    }" class="zoom-modal__image" style="
            max-width: 100% !important;
            max-height: 100% !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
            transition: transform 0.3s ease, opacity 0.3s ease !important;
            cursor: pointer !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            mix-blend-mode: multiply !important;
            transform-origin: center center !important;
            opacity: 0 !important;
          ">
        </div>
        ${images.length > 1 ? createNavigationButtons(images.length) : ""}
      </div>
    `;

    modalContainer.appendChild(modal);

    // Create separate modal root to avoid CSS inheritance
    const modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    modalRoot.style.cssText = `
      all: initial !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 999999 !important;
      contain: strict !important;
      isolation: isolate !important;
    `;
    modalRoot.appendChild(modalContainer);

    // Add to body without triggering CSS
    document.body.appendChild(modalRoot);

    const modalImage = modal.querySelector(".zoom-modal__image");
    const imageContainer = modal.querySelector(".zoom-modal__image-container");

    // Initialize full zoom functionality
    initializeImageZoom(modalImage, imageContainer);

    // Faster image loading - check if already preloaded
    if (preloadedImages.has(highResSrc)) {
      modalImage.style.opacity = "1";
      modalImage.classList.add("loaded");
    } else {
      modalImage.onload = function () {
        modalImage.style.opacity = "1";
        modalImage.classList.add("loaded");
      };
    }

    modalImage.onerror = function () {
      const fallbackSrc = image.src || image.getAttribute("src");
      if (fallbackSrc && fallbackSrc !== highResSrc) {
        modalImage.src = fallbackSrc;
      }
    };

    // Set counter
    if (images.length > 1) {
      const counter = modal.querySelector(".zoom-modal__current");
      if (counter && currentIndex !== -1) {
        counter.textContent = currentIndex + 1;
      }
    }

    const closeBtn = modal.querySelector(".zoom-modal__close");
    const backdrop = modal.querySelector(".zoom-modal__backdrop");

    const closeModal = () => {
      if (!modalOpen) return;
      modalOpen = false;

      modal.style.opacity = "0";
      modal.style.visibility = "hidden";
      document.removeEventListener("keydown", handleKeydown);
      currentModalImage = null;

      // Clean removal without affecting gallery
      setTimeout(() => {
        if (modalRoot.parentNode) {
          modalRoot.remove();
        }
      }, 300);
    };

    const handleKeydown = (e) => {
      if (!modalOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          closeModal();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (images.length > 1) navigateImage(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (images.length > 1) navigateImage(1);
          break;
      }
    };

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    // Navigation events
    if (images.length > 1) {
      const prevBtn = modal.querySelector(".zoom-modal__prev");
      const nextBtn = modal.querySelector(".zoom-modal__next");

      if (prevBtn) {
        prevBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          navigateImage(-1);
        });

        // Navigation button hover effects (kept for modal)
        prevBtn.addEventListener("mouseenter", function () {
          this.style.background = "rgba(255, 255, 255, 0.3)";
          this.style.transform = "scale(1.1)";
        });

        prevBtn.addEventListener("mouseleave", function () {
          this.style.background = "rgba(255, 255, 255, 0.2)";
          this.style.transform = "scale(1)";
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          navigateImage(1);
        });

        // Navigation button hover effects (kept for modal)
        nextBtn.addEventListener("mouseenter", function () {
          this.style.background = "rgba(255, 255, 255, 0.3)";
          this.style.transform = "scale(1.1)";
        });

        nextBtn.addEventListener("mouseleave", function () {
          this.style.background = "rgba(255, 255, 255, 0.2)";
          this.style.transform = "scale(1)";
        });
      }

      initializeSwipeNavigation(imageContainer, modalImage);
    }

    document.addEventListener("keydown", handleKeydown);

    // Show modal
    requestAnimationFrame(() => {
      modal.style.opacity = "1";
      modal.style.visibility = "visible";
    });
  }

  function createNavigationButtons(totalImages) {
    return `
      <div class="zoom-modal__navigation" style="
        margin-top: 24px !important;
        display: flex !important;
        align-items: center !important;
        gap: 20px !important;
      ">
        <button class="zoom-modal__nav zoom-modal__prev" aria-label="Previous image" style="
          background: rgba(255, 255, 255, 0.2) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 44px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          color: white !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <button class="zoom-modal__nav zoom-modal__next" aria-label="Next image" style="
          background: rgba(255, 255, 255, 0.2) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 44px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          color: white !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
      <div class="zoom-modal__counter" style="
        color: white !important;
        font-size: 14px !important;
        margin-top: 10px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-weight: 500 !important;
      ">
        <span class="zoom-modal__current">1</span> / <span class="zoom-modal__total">${totalImages}</span>
      </div>
    `;
  }

  function navigateImage(direction) {
    if (!currentModalImage || !modalOpen) return;

    const images = Array.from(
      document.querySelectorAll(".scroll--gallery_item img.product__image")
    );
    const currentIndex = images.indexOf(currentModalImage);

    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;

    const newImage = images[newIndex];
    if (!newImage) return;

    currentModalImage = newImage;

    const modal = document.getElementById("completely-isolated-zoom-modal");
    if (modal) {
      const modalImage = modal.querySelector(".zoom-modal__image");
      const imageContainer = modal.querySelector(
        ".zoom-modal__image-container"
      );

      if (modalImage && imageContainer) {
        resetImageZoom();

        const highResSrc = getHighResSrc(newImage);

        // IMPROVED: Faster navigation with preloaded images
        if (preloadedImages.has(highResSrc)) {
          modalImage.src = highResSrc;
          modalImage.alt = newImage.alt || "Product image";
          modalImage.style.opacity = "1";
          modalImage.classList.add("loaded");
          setTimeout(() => initializeImageZoom(modalImage, imageContainer), 50);
        } else {
          // Fallback for non-preloaded images
          modalImage.style.opacity = "0.7";
          setTimeout(() => {
            modalImage.src = highResSrc;
            modalImage.alt = newImage.alt || "Product image";

            modalImage.onload = () => {
              modalImage.style.opacity = "1";
              modalImage.classList.add("loaded");
              setTimeout(
                () => initializeImageZoom(modalImage, imageContainer),
                100
              );
            };
          }, 100);
        }
      }

      const counter = modal.querySelector(".zoom-modal__current");
      if (counter) {
        counter.textContent = newIndex + 1;
      }
    }

    // Update gallery selection WITHOUT affecting gallery height
    if (window.switchToImage) {
      const mediaId = newImage
        .closest(".scroll--gallery_item")
        ?.getAttribute("data-image-id");
      if (mediaId) {
        window.switchToImage(mediaId);
      }
    }
  }

  function initializeImageZoom(image, container) {
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let isPanning = false;
    let isZoomed = false;
    let initialDistance = 0;
    let initialScale = 1;

    window.resetImageZoom = function () {
      scale = 1;
      posX = 0;
      posY = 0;
      isZoomed = false;
      updateImageTransform();
      image.style.cursor = "default";
    };

    function updateImageTransform() {
      image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
      image.style.transformOrigin = "center center";
    }

    function constrainPanning() {
      if (scale <= 1) {
        posX = 0;
        posY = 0;
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();

      const maxX = Math.max(
        0,
        (imageRect.width * scale - containerRect.width) / 2
      );
      const maxY = Math.max(
        0,
        (imageRect.height * scale - containerRect.height) / 2
      );

      posX = Math.min(Math.max(posX, -maxX), maxX);
      posY = Math.min(Math.max(posY, -maxY), maxY);
    }

    function getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    let lastTouchX = 0;
    let lastTouchY = 0;

    container.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = getDistance(touch1, touch2);
        initialScale = scale;
      } else if (e.touches.length === 1 && isZoomed) {
        e.preventDefault();
        isPanning = true;
        const touch = e.touches[0];
        lastTouchX = touch.clientX - posX;
        lastTouchY = touch.clientY - posY;
      }
    });

    container.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = getDistance(touch1, touch2);
        const scaleChange = currentDistance / initialDistance;
        scale = Math.min(Math.max(initialScale * scaleChange, 1), 4);

        updateImageTransform();
        isZoomed = scale > 1;

        if (!isZoomed) {
          posX = 0;
          posY = 0;
        }
      } else if (e.touches.length === 1 && isPanning && isZoomed) {
        e.preventDefault();
        const touch = e.touches[0];
        posX = touch.clientX - lastTouchX;
        posY = touch.clientY - lastTouchY;
        constrainPanning();
        updateImageTransform();
      }
    });

    container.addEventListener("touchend", (e) => {
      if (e.touches.length === 0) {
        isPanning = false;
        initialDistance = 0;

        if (scale <= 1) {
          scale = 1;
          posX = 0;
          posY = 0;
          isZoomed = false;
          updateImageTransform();
        }
      }
    });

    // Double tap to zoom
    let lastTap = 0;
    container.addEventListener("touchend", (e) => {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTap;

      if (tapLength < 500 && tapLength > 0 && e.changedTouches.length === 1) {
        e.preventDefault();

        if (scale === 1) {
          scale = 2;
          isZoomed = true;
        } else {
          scale = 1;
          posX = 0;
          posY = 0;
          isZoomed = false;
        }
        updateImageTransform();
      }
      lastTap = currentTime;
    });

    // Mouse wheel for desktop
    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      scale = Math.min(Math.max(scale + delta, 1), 4);

      if (scale <= 1) {
        scale = 1;
        posX = 0;
        posY = 0;
        isZoomed = false;
      } else {
        isZoomed = true;
      }

      updateImageTransform();
    });
  }

  function initializeSwipeNavigation(container, image) {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    container.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }
    });

    container.addEventListener("touchend", (e) => {
      if (e.changedTouches.length === 1 && startX && startY) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const timeDiff = Date.now() - startTime;

        const diffX = startX - endX;
        const diffY = startY - endY;

        const isZoomed =
          image.style.transform &&
          image.style.transform.includes("scale") &&
          !image.style.transform.includes("scale(1)");

        if (
          !isZoomed &&
          Math.abs(diffX) > Math.abs(diffY) &&
          Math.abs(diffX) > 50 &&
          timeDiff < 300
        ) {
          e.preventDefault();
          if (diffX > 0) {
            navigateImage(1);
          } else {
            navigateImage(-1);
          }
        }

        startX = 0;
        startY = 0;
        startTime = 0;
      }
    });
  }

  function getHighResSrc(image) {
    const zoomSrc = image.getAttribute("data-zoom-src");
    if (zoomSrc) return zoomSrc;

    const srcset = image.getAttribute("srcset");
    if (srcset) {
      const sources = srcset.split(",").map((s) => {
        const parts = s.trim().split(" ");
        return {
          url: parts[0],
          width: parts[1] ? parseInt(parts[1]) : 0,
        };
      });

      const highest = sources.reduce(
        (max, current) => (current.width > max.width ? current : max),
        sources[0]
      );

      if (highest && highest.url) {
        return highest.url;
      }
    }

    return image.src || image.getAttribute("src");
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initFixedZoom);
    } else {
      setTimeout(initFixedZoom, 100);
    }
  }

  document.addEventListener("shopify:section:load", function (event) {
    if (event.target.querySelector('[data-section-type="product"]')) {
      initialized = false;
      preloadedImages.clear(); // Clear preloaded cache on section reload
      setTimeout(initFixedZoom, 300);
    }
  });

  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const container = document.getElementById("scrollGalleryContainer");
      if (container && !modalOpen && initialized) {
        // Always recreate button on resize, for both mobile and desktop
        createFixedZoomButton(container);
      }
    }, 250);
  });

  init();
})();
