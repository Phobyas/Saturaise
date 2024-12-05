document.addEventListener('DOMContentLoaded', _ => {
    const containerElem = document.getElementById('announcement-bar');
    const leftSideOfContainer = containerElem.getBoundingClientRect().left;
    const listElem = document.getElementById('marquee-track');
    let currentLeftValue = 0;

    window.setInterval(animationLoop, 50);

    function animationLoop() {
        const firstListItem = listElem.querySelector('.marquee-content:first-child');
        
        let rightSideOfFirstItem = firstListItem.getBoundingClientRect().right;

        if(rightSideOfFirstItem == leftSideOfContainer){
            currentLeftValue = -1;
            listElem.appendChild(firstListItem);
        }
        
        listElem.style.marginLeft = `${currentLeftValue}px`;
        currentLeftValue--;
    }
});