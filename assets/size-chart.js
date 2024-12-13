// Function to handle tab switching
function handleTabClick(button) {
    const targetTab = button.getAttribute('data-tab');
    const modalContent = button.closest('.tab-block');
    
    if (modalContent) {
      const tabButtons = modalContent.querySelectorAll('[data-name="table-nav"]');
      const tabContents = modalContent.querySelectorAll('[data-name="table-content"]');
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      modalContent.querySelector(`[data-tab="${targetTab}"][data-name="table-content"]`).classList.add('active');
    }
  }
  
  // Function to initialize tabs
  function initSizeChartTabs() {
    document.addEventListener('click', function(event) {
      if (event.target.matches('[data-name="table-nav"]')) {
        handleTabClick(event.target);
      }
    });
  }
  
  // Initialize when modal opens
  document.addEventListener('wau.modal.after.open', function(event) {
    initSizeChartTabs();
  });
  
  // Also initialize on DOM load
  document.addEventListener('DOMContentLoaded', function() {
    initSizeChartTabs();
  });