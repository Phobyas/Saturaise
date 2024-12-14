
function handleTabClick(button) {
    const targetTab = button.getAttribute('data-tab');
    const modalContent = button.closest('.tab-block');
    
    if (modalContent) {
      const tabButtons = modalContent.querySelectorAll('[data-name="table-nav"]');
      const tabContents = modalContent.querySelectorAll('[data-name="table-content"]');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      modalContent.querySelector(`[data-tab="${targetTab}"][data-name="table-content"]`).classList.add('active');
    }
  }
  
  function initSizeChartTabs() {
    document.addEventListener('click', function(event) {
      if (event.target.matches('[data-name="table-nav"]')) {
        handleTabClick(event.target);
      }
    });
  }
  
  document.addEventListener('wau.modal.after.open', function(event) {
    initSizeChartTabs();
  });
 
  document.addEventListener('DOMContentLoaded', function() {
    initSizeChartTabs();
  });