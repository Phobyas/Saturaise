/**
 * Fixed Zoom Button - Enhanced Version
 * Add this as assets/fixed-zoom-button.js
 */

(function () {
  "use strict";

  let initialized = false;
  let currentModalImage = null;

  function initFixedZoom() {
    if (initialized) return;

    // Wait for images to be loaded
    setTimeout(() => {
      const galleryContainer = document.getElementById(
        "scrollGalleryContainer"
      );
      const images = document.querySelectorAll(
        ".scroll--gallery_item img.product__image"
      );

      if (!galleryContainer || images.length === 0) {
        console.log("Gallery not ready, retrying...");
        setTimeout(initFixedZoom, 1000);
        return;
      }

      console.log("Found", images.length, "images in gallery");
      createFixedZoomButton(galleryContainer);
      initialized = true;
    }, 1000);
  }

  function createFixedZoomButton(container) {
    // Remove any existing fixed zoom button
    const existing = container.querySelector(".fixed-zoom-btn");
    if (existing) existing.remove();

    // Create the button
    const button = document.createElement("button");
    button.className = "fixed-zoom-btn";
    button.type = "button";
    button.setAttribute("aria-label", "Zoom image");
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
        <line x1="8" y1="11" x2="14" y2="11"></line>
        <line x1="11" y1="8" x2="11" y2="14"></line>
      </svg>
    `;

    // Add click event
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const currentImage = getCurrentImage();
      if (currentImage) {
        openZoomModal(currentImage);
      }
    });

    container.appendChild(button);
    console.log("Fixed zoom button created");
  }

  function getCurrentImage() {
    // Mobile: get selected slide
    if (window.innerWidth < 1024) {
      const selected = document.querySelector(
        ".scroll--gallery_item.is-selected img.product__image"
      );
      if (selected) return selected;

      // Fallback: get first visible image in Flickity
      const flickityContainer = document.getElementById(
        "scrollGalleryContainer"
      );
      if (
        flickityContainer &&
        flickityContainer.classList.contains("flickity-enabled")
      ) {
        const flickityInstance =
          window.Flickity && window.Flickity.data(flickityContainer);
        if (flickityInstance) {
          const selectedCell = flickityInstance.selectedElement;
          if (selectedCell) {
            const img = selectedCell.querySelector("img.product__image");
            if (img) return img;
          }
        }
      }
    }

    // Desktop: get first image or clicked image
    const firstImage = document.querySelector(
      ".scroll--gallery_item img.product__image"
    );
    return firstImage;
  }

  function openZoomModal(image) {
    // Remove existing modal
    const existing = document.getElementById("zoom-modal");
    if (existing) existing.remove();

    // Get high res image
    const highResSrc = getHighResSrc(image);

    // Store current image for navigation
    currentModalImage = image;

    // Create modal
    const modal = document.createElement("div");
    modal.id = "zoom-modal";
    modal.className = "zoom-modal";

    const images = Array.from(
      document.querySelectorAll(".scroll--gallery_item img.product__image")
    );
    const currentIndex = images.indexOf(image);

    modal.innerHTML = `
      <div class="zoom-modal__backdrop"></div>
      <div class="zoom-modal__container">
        <button class="zoom-modal__close" aria-label="Close">×</button>
        <div class="zoom-modal__image-container">
          <img src="${highResSrc}" alt="${
      image.alt || "Product image"
    }" class="zoom-modal__image">
        </div>
        ${createNavigationButtons()}
      </div>
    `;

    document.body.appendChild(modal);

    // Get modal image element
    const modalImage = modal.querySelector(".zoom-modal__image");
    const imageContainer = modal.querySelector(".zoom-modal__image-container");

    // Initialize zoom functionality
    initializeImageZoom(modalImage, imageContainer);

    // Add image load handler
    modalImage.onload = function () {
      modalImage.classList.add("loaded");
    };

    modalImage.onerror = function () {
      console.error("Failed to load zoom image:", highResSrc);
      // Try fallback image
      const fallbackSrc = image.src || image.getAttribute("src");
      if (fallbackSrc && fallbackSrc !== highResSrc) {
        modalImage.src = fallbackSrc;
      }
    };

    // Set initial counter
    const counter = modal.querySelector(".zoom-modal__current");
    if (counter && currentIndex !== -1) {
      counter.textContent = currentIndex + 1;
    }

    // Add events
    modal
      .querySelector(".zoom-modal__close")
      .addEventListener("click", closeModal);
    modal
      .querySelector(".zoom-modal__backdrop")
      .addEventListener("click", closeModal);

    // Close modal when clicking outside the image container
    modal.addEventListener("click", (e) => {
      // Check if click is outside the image container
      const imageContainer = modal.querySelector(
        ".zoom-modal__image-container"
      );
      const navigation = modal.querySelector(".zoom-modal__navigation");
      const counter = modal.querySelector(".zoom-modal__counter");
      const closeBtn = modal.querySelector(".zoom-modal__close");

      // Don't close if clicking on the image container, navigation, counter, or close button
      if (
        !imageContainer.contains(e.target) &&
        !navigation?.contains(e.target) &&
        !counter?.contains(e.target) &&
        !closeBtn?.contains(e.target)
      ) {
        closeModal();
      }
    });

    // Prevent modal from closing when clicking on the image container itself
    modal
      .querySelector(".zoom-modal__image-container")
      .addEventListener("click", (e) => {
        e.stopPropagation();
      });

    // Navigation events
    const prevBtn = modal.querySelector(".zoom-modal__prev");
    const nextBtn = modal.querySelector(".zoom-modal__next");

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        navigateImage(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        navigateImage(1);
      });
    }

    // Enhanced touch/swipe support with zoom awareness
    initializeSwipeNavigation(imageContainer, modalImage);

    // Keyboard events
    document.addEventListener("keydown", handleKeydown);

    // Show modal
    setTimeout(() => {
      modal.classList.add("zoom-modal--active");
      document.body.style.overflow = "hidden";
    }, 10);

    function closeModal() {
      modal.classList.remove("zoom-modal--active");
      document.body.style.removeProperty("overflow");
      document.removeEventListener("keydown", handleKeydown);
      currentModalImage = null;
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 300);
    }

    function handleKeydown(e) {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          closeModal();
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigateImage(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateImage(1);
          break;
        case " ": // Spacebar
          e.preventDefault();
          navigateImage(1);
          break;
      }
    }
  }

  function createNavigationButtons() {
    const images = Array.from(
      document.querySelectorAll(".scroll--gallery_item img.product__image")
    );

    if (images.length <= 1) {
      return "";
    }

    return `
      <div class="zoom-modal__navigation">
        <button class="zoom-modal__nav zoom-modal__prev" aria-label="Previous image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <button class="zoom-modal__nav zoom-modal__next" aria-label="Next image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
      <div class="zoom-modal__counter">
        <span class="zoom-modal__current">1</span> / <span class="zoom-modal__total">${images.length}</span>
      </div>
    `;
  }

  function navigateImage(direction) {
    if (!currentModalImage) return;

    const images = Array.from(
      document.querySelectorAll(".scroll--gallery_item img.product__image")
    );
    const currentIndex = images.indexOf(currentModalImage);

    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;

    // Wrap around
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;

    const newImage = images[newIndex];
    if (!newImage) return;

    currentModalImage = newImage;

    // Update modal image with smooth transition
    const modal = document.getElementById("zoom-modal");
    if (modal) {
      const modalImage = modal.querySelector(".zoom-modal__image");
      const imageContainer = modal.querySelector(
        ".zoom-modal__image-container"
      );

      if (modalImage && imageContainer) {
        // Reset zoom before changing image
        if (window.resetImageZoom) {
          window.resetImageZoom();
        }

        // Add slide transition effect
        imageContainer.style.transform = `translateX(${
          direction > 0 ? "100px" : "-100px"
        })`;
        imageContainer.style.opacity = "0.7";

        setTimeout(() => {
          // Add loading state
          modalImage.classList.remove("loaded");
          modalImage.style.opacity = "0.5";

          // Preload the new image
          const tempImg = new Image();
          tempImg.onload = function () {
            modalImage.src = getHighResSrc(newImage);
            modalImage.alt = newImage.alt || "Product image";
            modalImage.style.opacity = "1";
            modalImage.classList.add("loaded");

            // Reset container position and opacity
            imageContainer.style.transform = "translateX(0)";
            imageContainer.style.opacity = "1";

            // Reinitialize zoom for new image
            setTimeout(() => {
              initializeImageZoom(modalImage, imageContainer);
            }, 100);
          };
          tempImg.onerror = function () {
            // Fallback to original src
            modalImage.src = newImage.src || newImage.getAttribute("src");
            modalImage.alt = newImage.alt || "Product image";
            modalImage.style.opacity = "1";

            // Reset container position and opacity
            imageContainer.style.transform = "translateX(0)";
            imageContainer.style.opacity = "1";

            // Reinitialize zoom for new image
            setTimeout(() => {
              initializeImageZoom(modalImage, imageContainer);
            }, 100);
          };
          tempImg.src = getHighResSrc(newImage);
        }, 150);
      }

      // Update counter
      const counter = modal.querySelector(".zoom-modal__current");
      if (counter) {
        counter.textContent = newIndex + 1;
      }

      // Update navigation button states
      updateNavigationButtons(modal, newIndex, images.length);
    }

    // Update gallery selection if needed
    if (window.switchToImage) {
      const mediaId = newImage
        .closest(".scroll--gallery_item")
        ?.getAttribute("data-image-id");
      if (mediaId) {
        window.switchToImage(mediaId);
      }
    }
  }

  function updateNavigationButtons(modal, currentIndex, totalImages) {
    const prevBtn = modal.querySelector(".zoom-modal__prev");
    const nextBtn = modal.querySelector(".zoom-modal__next");

    if (prevBtn && nextBtn) {
      // Always enable both buttons for wrap-around navigation
      prevBtn.disabled = false;
      nextBtn.disabled = false;

      // Add visual feedback
      prevBtn.style.opacity = "1";
      nextBtn.style.opacity = "1";
    }
  }

  // Initialize pinch-to-zoom functionality
  function initializeImageZoom(image, container) {
    let scale = 1;
    let lastScale = 1;
    let posX = 0;
    let posY = 0;
    let lastPosX = 0;
    let lastPosY = 0;
    let isPanning = false;
    let isZoomed = false;

    // Touch events for pinch-to-zoom
    let initialDistance = 0;
    let initialScale = 1;

    // Mouse wheel zoom for desktop
    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.min(Math.max(scale + delta, 1), 4);

      if (newScale !== scale) {
        scale = newScale;
        updateImageTransform();

        if (scale > 1) {
          isZoomed = true;
          image.style.cursor = "grab";
        } else {
          isZoomed = false;
          posX = 0;
          posY = 0;
          image.style.cursor = "pointer";
        }
      }
    });

    // Touch start
    container.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        // Two fingers - prepare for pinch zoom
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = getDistance(touch1, touch2);
        initialScale = scale;
      } else if (e.touches.length === 1 && isZoomed) {
        // One finger on zoomed image - prepare for pan
        e.preventDefault();
        isPanning = true;
        lastPosX = e.touches[0].clientX - posX;
        lastPosY = e.touches[0].clientY - posY;
        image.style.cursor = "grabbing";
      }
    });

    // Touch move
    container.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        // Two fingers - pinch zoom
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = getDistance(touch1, touch2);
        const scaleChange = currentDistance / initialDistance;
        scale = Math.min(Math.max(initialScale * scaleChange, 1), 4);

        updateImageTransform();

        if (scale > 1) {
          isZoomed = true;
        } else {
          isZoomed = false;
          posX = 0;
          posY = 0;
        }
      } else if (e.touches.length === 1 && isPanning && isZoomed) {
        // One finger - pan
        e.preventDefault();
        posX = e.touches[0].clientX - lastPosX;
        posY = e.touches[0].clientY - lastPosY;

        // Constrain panning to image bounds
        constrainPanning();
        updateImageTransform();
      }
    });

    // Touch end
    container.addEventListener("touchend", (e) => {
      if (e.touches.length === 0) {
        isPanning = false;
        initialDistance = 0;
        image.style.cursor = isZoomed ? "grab" : "pointer";

        // Reset if zoomed out completely
        if (scale <= 1) {
          scale = 1;
          posX = 0;
          posY = 0;
          isZoomed = false;
          updateImageTransform();
        }
      }
    });

    // Mouse events for desktop panning
    container.addEventListener("mousedown", (e) => {
      if (isZoomed) {
        e.preventDefault();
        isPanning = true;
        lastPosX = e.clientX - posX;
        lastPosY = e.clientY - posY;
        image.style.cursor = "grabbing";
      }
    });

    container.addEventListener("mousemove", (e) => {
      if (isPanning && isZoomed) {
        e.preventDefault();
        posX = e.clientX - lastPosX;
        posY = e.clientY - lastPosY;
        constrainPanning();
        updateImageTransform();
      }
    });

    container.addEventListener("mouseup", () => {
      isPanning = false;
      image.style.cursor = isZoomed ? "grab" : "pointer";
    });

    container.addEventListener("mouseleave", () => {
      isPanning = false;
      image.style.cursor = isZoomed ? "grab" : "pointer";
    });

    // Double tap to zoom
    let lastTap = 0;
    container.addEventListener("touchend", (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 500 && tapLength > 0 && e.touches.length === 0) {
        e.preventDefault();

        if (scale === 1) {
          // Zoom in
          scale = 2;
          isZoomed = true;
          image.style.cursor = "grab";
        } else {
          // Zoom out
          scale = 1;
          posX = 0;
          posY = 0;
          isZoomed = false;
          image.style.cursor = "pointer";
        }
        updateImageTransform();
      }
      lastTap = currentTime;
    });

    function getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function constrainPanning() {
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

    function updateImageTransform() {
      image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    }

    // Reset zoom when image changes
    window.resetImageZoom = function () {
      scale = 1;
      posX = 0;
      posY = 0;
      isZoomed = false;
      updateImageTransform();
      image.style.cursor = "pointer";
    };
  }

  // Initialize swipe navigation with zoom awareness
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
        const endTime = Date.now();

        const diffX = startX - endX;
        const diffY = startY - endY;
        const timeDiff = endTime - startTime;

        // Only handle swipes on non-zoomed images or quick swipes
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
            // Swipe left - next image
            navigateImage(1);
          } else {
            // Swipe right - previous image
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
    // Try data-zoom-src first
    const zoomSrc = image.getAttribute("data-zoom-src");
    if (zoomSrc) return zoomSrc;

    // Get src and try to make it higher res
    let src = image.src || image.getAttribute("src");

    if (src) {
      // Try to get the highest resolution from srcset
      const srcset = image.getAttribute("srcset");
      if (srcset) {
        const sources = srcset.split(",").map((s) => {
          const parts = s.trim().split(" ");
          return {
            url: parts[0],
            width: parts[1] ? parseInt(parts[1]) : 0,
          };
        });

        // Get the highest resolution
        const highest = sources.reduce(
          (max, current) => (current.width > max.width ? current : max),
          sources[0]
        );

        if (highest && highest.url) {
          return highest.url;
        }
      }

      // Try to replace size with larger version
      if (src.includes("_")) {
        src = src.replace(/_\d+x\d*\./, "_1920x.");
      }
    }

    return src || image.src;
  }

  // Initialize when DOM and images are ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFixedZoom);
  } else {
    initFixedZoom();
  }

  // Also try on window load as backup
  window.addEventListener("load", function () {
    if (!initialized) {
      initFixedZoom();
    }
  });

  // Shopify section reload
  document.addEventListener("shopify:section:load", function (event) {
    if (event.target.querySelector('[data-section-type="product"]')) {
      initialized = false;
      setTimeout(initFixedZoom, 500);
    }
  });

  // Reinitialize when gallery changes
  document.addEventListener("variant:change", function () {
    setTimeout(() => {
      if (initialized) {
        const container = document.getElementById("scrollGalleryContainer");
        if (container && !container.querySelector(".fixed-zoom-btn")) {
          createFixedZoomButton(container);
        }
      }
    }, 500);
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (initialized) {
        const container = document.getElementById("scrollGalleryContainer");
        if (container && !container.querySelector(".fixed-zoom-btn")) {
          createFixedZoomButton(container);
        }
      }
    }, 250);
  });
})();
