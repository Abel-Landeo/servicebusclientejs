function printMenu() {
    
    let verticalMenu = document.querySelector(".vertical-menu");

    addMenuItem(verticalMenu, "create connection", "click", "../create-connection/create-connection.html");
    addMenuItem(verticalMenu, "Available connections", "click", `../list-connections/list-connections.html`);    
}

/**
 * add a menu item to a container from a label
 * @param {Element} menuContainer 
 * @param {string} menuLabel 
 * @param {string} event click, dbclick, etc.
 * @param {string} menuLink link to forward
 */
function addMenuItem(menuContainer, menuLabel, event, menuLink) {
    let menuItem = document.createElement('a');
    menuItem.setAttribute("href", "#");
    menuItem.innerHTML = menuLabel;
    if(event) {
        menuItem.addEventListener(event, () => {
            sessionStorage.setItem("currentMenu", menuLabel);
            document.location.href = menuLink;
        });
    }
    if(menuLabel === sessionStorage.getItem("currentMenu")) {
        menuItem.classList.add("active");
    }
    menuContainer.appendChild(menuItem);
}

printMenu();

