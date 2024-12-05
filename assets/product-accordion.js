// Create the wrapper div
const wrapper = document.createElement('div');
wrapper.className = 'accordion'; // Optional: add a class to the wrapper div

// Select the elements to be wrapped
const elementsToWrap = document.querySelectorAll('.accordion-item');

// Insert the wrapper div before the first selected element
elementsToWrap[0].parentNode.insertBefore(wrapper, elementsToWrap[0]);

// Move each selected element into the wrapper div
elementsToWrap.forEach((element, index) => {
    const accordionHeader = element.querySelector('.accordion-header');
    accordionHeader.id = 'heading' + (index + 1);

    const button = element.querySelector('.accordion-button');
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', '.collapse' + (index + 1));
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-controls', 'collapse' + (index + 1));
    
    const collapseElem = element.querySelector('.accordion-collapse');
    collapseElem.setAttribute('aria-labelledby', 'heading' + (index + 1));
    collapseElem.setAttribute('data-bs-parent', '#accordion-container');
    collapseElem.classList.add('collapse' + (index + 1))
    collapseElem.id = `#collapse${index + 1}`

    wrapper.appendChild(element);
});

document.addEventListener('DOMContentLoaded', function () {
    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const collapse = document.querySelector(this.dataset.bsTarget);
        
            if (isExpanded) {
                collapse.classList.remove('show');
                } else {
                collapse.classList.add('show');
            }
        
            // Optionally, close other open items (accordion behavior)
            const otherCollapses = document.querySelectorAll('.accordion-collapse');

            otherCollapses.forEach(function (other) {
                if (other !== collapse) {
                    other.classList.remove('show');

                    if(other.previousElementSibling !== collapse){
                        other.previousElementSibling.querySelector('.accordion-button').setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    });
});