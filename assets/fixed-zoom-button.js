/**
 * Optimized Fixed Zoom Button - Enhanced Version
 * Replace your existing assets/fixed-zoom-button.js with this
 */

(function () {
  "use strict";

  let initialized = false;
  let currentModalImage = null;
  let modalOpen = false;

  function initFixedZoom() {
    if (initialized) return;

    // Wait for images to be loaded with better timing
    const checkGallery = () => {
      const galleryContainer = document.getElementById("scrollGalleryContainer");
      const images = document.querySelectorAll(".scroll--gallery_item img.product__image");

      if (!galleryContainer || images.length === 0) {
        console.log("Gallery not ready, retrying...");
        setTimeout(checkGallery, 500);
        return;
      }

      console.log("Found", images.length, "images in gallery");
      createFixedZoomButton(galleryContainer);
      initialized = true;
    };

    checkGallery();
  }

  function createFixedZoomButton(container) {
    // Remove any existing fixed zoom button
    const existing = container.querySelector(".fixed-zoom-btn");
    if (existing) existing.remove();

    // Only add zoom button on mobile/tablet
    if (window.innerWidth >= 1024) {
      console.log("Desktop detected, skipping zoom button");
      return;
    }

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

    // Add click event with debouncing
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

      setTimeout(() => { clicking = false; }, 300);
    });

    container.appendChild(button);
    console.log("Fixed zoom button created for mobile");
  }

  function getCurrentImage() {
    // For mobile: get selected slide first
    if (window.innerWidth < 1024) {
      const selected = document.querySelector(".scroll--gallery_item.is-selected img.product__image");
      if (selected) return selected;

      // Fallback: get current Flickity slide
      const flickityContainer = document.getElementById("scrollGalleryContainer");
      if (flickityContainer && typeof Flickity !== 'undefined') {
        const flickityInstance = Flickity.data(flickityContainer);
        if (flickityInstance && flickityInstance.selectedElement) {
          const img = flickityInstance.selectedElement.querySelector("img.product__image");
          if (img) return img;
        }
      }
    }

    // Final fallback: get first visible image
    const firstImage = document.querySelector(".scroll--gallery_item img.product__image");
    return firstImage;
  }

  function openZoomModal(image) {
    if (modalOpen) return;
    modalOpen = true;

    // Remove existing modal
    const existing = document.getElementById("zoom-modal");
    if (existing) existing.remove();

    // Get high res image
    const highResSrc = getHighResSrc(image);
    currentModalImage = image;

    // Create modal with improved structure
    const modal = document.createElement("div");
    modal.id = "zoom-modal";
    modal.className = "zoom-modal";

    const images = Array.from(document.querySelectorAll(".scroll--gallery_item img.product__image"));
    const currentIndex = images.indexOf(image);

    modal.innerHTML = `
      <div class="zoom-modal__backdrop"></div>
      <div class="zoom-modal__container">
        <button class="zoom-modal__close" aria-label="Close">×</button>
        <div class="zoom-modal__image-container">
          <img src="${highResSrc}" alt="${image.alt || "Product image"}" class="zoom-modal__image">
        </div>
        ${images.length > 1 ? createNavigationButtons(images.length) : ''}
      </div>
    `;

    document.body.appendChild(modal);

    // Get modal elements
    const modalImage = modal.querySelector(".zoom-modal__image");
    const imageContainer = modal.querySelector(".zoom-modal__image-container");

    // Initialize zoom with improved performance
    initializeImageZoom(modalImage, imageContainer);

    // Handle image loading
    modalImage.onload = function () {
      modalImage.classList.add("loaded");
    };

    modalImage.onerror = function () {
      console.error("Failed to load zoom image:", highResSrc);
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

    // Add event listeners with proper cleanup
    const closeBtn = modal.querySelector(".zoom-modal__close");
    const backdrop = modal.querySelector(".zoom-modal__backdrop");
    
    const closeModal = () => {
      if (!modalOpen) return;
      modalOpen = false;
      
      modal.classList.remove("zoom-modal--active");
      document.body.style.removeProperty("overflow");
      document.removeEventListener("keydown", handleKeydown);
      currentModalImage = null;
      
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
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

    // Navigation events (only if multiple images)
    if (images.length > 1) {
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

      // Touch swipe navigation (only when not zoomed)
      initializeSwipeNavigation(imageContainer, modalImage);
    }

    // Keyboard events
    document.addEventListener("keydown", handleKeydown);

    // Show modal with smooth animation
    requestAnimationFrame(() => {
      modal.classList.add("zoom-modal--active");
      document.body.style.overflow = "hidden";
    });
  }

  function createNavigationButtons(totalImages) {
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
        <span class="zoom-modal__current">1</span> / <span class="zoom-modal__total">${totalImages}</span>
      </div>
    `;
  }

  function navigateImage(direction) {
    if (!currentModalImage || !modalOpen) return;

    const images = Array.from(document.querySelectorAll(".scroll--gallery_item img.product__image"));
    const currentIndex = images.indexOf(currentModalImage);

    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;

    // Wrap around
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;

    const newImage = images[newIndex];
    if (!newImage) return;

    currentModalImage = newImage;

    // Update modal image smoothly
    const modal = document.getElementById("zoom-modal");
    if (modal) {
      const modalImage = modal.querySelector(".zoom-modal__image");
      const imageContainer = modal.querySelector(".zoom-modal__image-container");

      if (modalImage && imageContainer) {
        // Reset zoom first
        resetImageZoom();

        // Update image with fade effect
        modalImage.style.opacity = "0.7";
        
        setTimeout(() => {
          const highResSrc = getHighResSrc(newImage);
          modalImage.src = highResSrc;
          modalImage.alt = newImage.alt || "Product image";
          
          modalImage.onload = () => {
            modalImage.style.opacity = "1";
            modalImage.classList.add("loaded");
            // Reinitialize zoom for new image
            setTimeout(() => initializeImageZoom(modalImage, imageContainer), 100);
          };
        }, 100);
      }

      // Update counter
      const counter = modal.querySelector(".zoom-modal__current");
      if (counter) {
        counter.textContent = newIndex + 1;
      }
    }

    // Update gallery selection
    if (window.switchToImage) {
      const mediaId = newImage.closest(".scroll--gallery_item")?.getAttribute("data-image-id");
      if (mediaId) {
        window.switchToImage(mediaId);
      }
    }
  }

  // Optimized zoom functionality
  function initializeImageZoom(image, container) {
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let isPanning = false;
    let isZoomed = false;
    let initialDistance = 0;
    let initialScale = 1;

    // Reset function
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
      
      const maxX = Math.max(0, (imageRect.width * scale - containerRect.width) / 2);
      const maxY = Math.max(0, (imageRect.height * scale - containerRect.height) / 2);

      posX = Math.min(Math.max(posX, -maxX), maxX);
      posY = Math.min(Math.max(posY, -maxY), maxY);
    }

    function getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // Touch events
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

    let lastTouchX = 0;
    let lastTouchY = 0;

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

  // Optimized swipe navigation
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

        // Only swipe when not zoomed and it's a horizontal swipe
        const isZoomed = image.style.transform && image.style.transform.includes("scale") && !image.style.transform.includes("scale(1)");

        if (!isZoomed && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && timeDiff < 300) {
          e.preventDefault();
          if (diffX > 0) {
            navigateImage(1); // Swipe left - next image
          } else {
            navigateImage(-1); // Swipe right - previous image
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

    // Try srcset for highest resolution
    const srcset = image.getAttribute("srcset");
    if (srcset) {
      const sources = srcset.split(",").map(s => {
        const parts = s.trim().split(" ");
        return {
          url: parts[0],
          width: parts[1] ? parseInt(parts[1]) : 0
        };
      });

      const highest = sources.reduce((max, current) => 
        current.width > max.width ? current : max, sources[0]
      );

      if (highest && highest.url) {
        return highest.url;
      }
    }

    // Fallback to regular src
    return image.src || image.getAttribute("src");
  }

  // Initialization with better timing
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initFixedZoom);
    } else {
      setTimeout(initFixedZoom, 100);
    }
  }

  // Shopify section reload
  document.addEventListener("shopify:section:load", function (event) {
    if (event.target.querySelector('[data-section-type="product"]')) {
      initialized = false;
      setTimeout(initFixedZoom, 300);
    }
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const container = document.getElementById("scrollGalleryContainer");
      if (container) {
        const existingBtn = container.querySelector(".fixed-zoom-btn");
        if (window.innerWidth >= 1024 && existingBtn) {
          // Remove button on desktop
          existingBtn.remove();
        } else if (window.innerWidth < 1024 && !existingBtn && initialized) {
          // Add button on mobile
          createFixedZoomButton(container);
        }
      }
    }, 250);
  });

  // Start initialization
  init();
})();