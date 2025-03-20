document.addEventListener("DOMContentLoaded", () => {
  const containerElem = document.getElementById("announcement-bar");
  const trackElem = document.getElementById("marquee-track");

  // Parametry animacji
  const speed = 0.5; // Prędkość przesuwania (piksele na krok)

  if (!trackElem || !containerElem || trackElem.children.length === 0) return;

  // Oblicz całkowitą szerokość wszystkich elementów
  let totalWidth = 0;
  const itemElements = [...trackElem.children];

  itemElements.forEach((item) => {
    totalWidth +=
      item.offsetWidth + parseInt(window.getComputedStyle(item).marginRight);
  });

  // Duplikuj elementy, aby zapewnić ciągłość
  const cloneElements = [];
  itemElements.forEach((item) => {
    const clone = item.cloneNode(true);
    cloneElements.push(clone);
    trackElem.appendChild(clone);
  });

  // Druga duplikacja dla dłuższych pasków
  itemElements.forEach((item) => {
    const clone = item.cloneNode(true);
    trackElem.appendChild(clone);
  });

  // Początkowa pozycja
  let position = 0;

  // Funkcja animacji używająca requestAnimationFrame
  function animate() {
    position -= speed;

    // Gdy przewinęliśmy pełną szerokość oryginalnych elementów, resetujemy pozycję
    // To zapobiega skokowi, ponieważ elementy są już zduplikowane
    if (Math.abs(position) >= totalWidth) {
      position = 0;
    }

    trackElem.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animate);
  }

  // Rozpocznij animację
  requestAnimationFrame(animate);

  // Obsługa resize dla recalkulacji szerokości
  window.addEventListener("resize", () => {
    // Recalculate width after resize
    totalWidth = 0;
    const allItems = [...trackElem.children].slice(0, itemElements.length);

    allItems.forEach((item) => {
      totalWidth +=
        item.offsetWidth + parseInt(window.getComputedStyle(item).marginRight);
    });
  });
});
