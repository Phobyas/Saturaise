// Add this at the beginning of your section-product.js file
// Mobile gallery stabilization to prevent layout shifts
function stabilizeMobileGallery() {
  if (window.innerWidth <= 1023) {
    const galleryContainer = document.querySelector(
      ".product-images__scroll-gallery-container"
    );
    if (galleryContainer) {
      // Set container properties
      galleryContainer.style.position = "relative";
      galleryContainer.style.minHeight = "300px";

      // Find selected item
      const selectedItem = galleryContainer.querySelector(".is-selected");
      if (selectedItem) {
        // Make selected item visible immediately
        selectedItem.style.opacity = "1";
        selectedItem.style.zIndex = "2";

        // Handle image loading
        const image = selectedItem.querySelector("img");
        if (image) {
          // Support aspect ratio calculation once image is loaded
          if (image.complete) {
            adjustContainerHeight(image, galleryContainer);
          } else {
            image.addEventListener("load", function () {
              adjustContainerHeight(image, galleryContainer);
            });
          }
        }
      }

      // Hide all non-selected items
      const nonSelectedItems = galleryContainer.querySelectorAll(
        ".scroll--gallery_item:not(.is-selected)"
      );
      nonSelectedItems.forEach((item) => {
        item.style.position = "absolute";
        item.style.opacity = "0";
        item.style.zIndex = "-1";
      });
    }
  }
}

function adjustContainerHeight(image, container) {
  // Calculate optimal container height based on original image aspect ratio
  if (image && container) {
    // Maintain original aspect ratio
    const originalAspect = image.naturalWidth / image.naturalHeight;
    const containerWidth = container.offsetWidth;

    // Ensure min-height of 300px
    container.style.height =
      Math.max(300, containerWidth / originalAspect) + "px";
  }
}

// Original loadAssets function
function loadAssets(container) {
  // Run mobile gallery stabilization first
  stabilizeMobileGallery();

  // Original code follows
  const loader = new WAU.Helpers.scriptLoader();

  loader.load([jsAssets.flickity]).finally(() => {
    if (container.dataset.productGallery === "scroll_gallery") {
      loader.load([jsAssets.scroll_gallery]).finally(() => {
        if (container.dataset.productVideo === "true") {
          loader.load([jsAssets.productVideo]).finally(() => {});
        }
        if (container.dataset.productModel === "true") {
          loader.load([jsAssets.productModel]).finally(() => {});
        }

        if (container.dataset.productPickupAvailability === "true") {
          loader.load([jsAssets.productPickupAvailability]).finally(() => {});
        }

        if (container.dataset.productComplementaryProducts === "true") {
          loader
            .load([jsAssets.productComplementaryProducts])
            .finally(() => {});
        }

        loader.load([jsAssets.product]).finally(() => {});
      });
    } else {
      if (container.dataset.productVideo === "true") {
        loader.load([jsAssets.productVideo]).finally(() => {});
      }
      if (container.dataset.productModel === "true") {
        loader.load([jsAssets.productModel]).finally(() => {});
      }
      if (container.dataset.productPickupAvailability === "true") {
        loader.load([jsAssets.productPickupAvailability]).finally(() => {});
      }

      if (container.dataset.productComplementaryProducts === "true") {
        loader.load([jsAssets.productComplementaryProducts]).finally(() => {});
      }

      loader.load([jsAssets.product]).finally(() => {});
    }
  });
}

// Listen for resize events to handle orientation changes
window.addEventListener("resize", function () {
  if (window.innerWidth <= 1023) {
    stabilizeMobileGallery();
  }
});

document
  .querySelectorAll('[data-section-type="product"].product-page')
  .forEach(function (container) {
    loadAssets(container);
  });

document.addEventListener("shopify:section:select", function (event) {
  if (event.target.querySelector('[data-section-type="product"]')) {
    loadAssets(event.target);
  }
});

document.addEventListener("shopify:block:select", function (event) {
  if (event.target.querySelector('[data-section-type="product"]')) {
    loadAssets(event.target);
  }
});
