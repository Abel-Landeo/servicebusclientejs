window.addEventListener("DOMContentLoaded", async () => {
    await displayConnections();
    
});

async function displayConnections() {
    /**
     * @type {import("../../server/leveldbModule").connection[]}
     */
    const connections = await window.leveldb.getConnections();
    document.getElementById("totalConnections").innerText = connections.length;
    
    /** @type {HTMLOListElement} */
    let mainList = document.getElementById("mainList");
    mainList.innerHTML = "";
    for (let connection of connections) {
        let liElement = document.createElement("li");
        
        liElement.append(connection.name, " ");
        let openButtonElement = document.createElement("button");
        openButtonElement.innerText = "Open";
        openButtonElement.setAttribute("data-connection", JSON.stringify(connection));
        openButtonElement.addEventListener("click", openConnection);
        liElement.append(openButtonElement, " ");
        
        let deleteButtonElement = document.createElement("button");
        deleteButtonElement.innerText = "Delete";
        deleteButtonElement.setAttribute("data-connection-name", connection.name);
        deleteButtonElement.addEventListener('click', deleteConnection);
        liElement.append(deleteButtonElement);

        mainList.append(liElement);
    }
}

/**
 * 
 * @param {MouseEvent} evt 
 */
function openConnection(evt) {
    sessionStorage.removeItem("currentMenu");
    /** @type {HTMLButtonElement} */
    let button = evt.target;
    let connection = JSON.parse(button.getAttribute("data-connection"));
    let urlParams = new URLSearchParams(connection);
    window.location.href = "../show-connection/show-connection.html?" + urlParams.toString();
}

/**
 * 
 * @param {MouseEvent} evt 
 */
async function deleteConnection(evt) {
    
    /** @type {HTMLButtonElement} */
    let deleteButton = evt.target;
    let connectionName = deleteButton.getAttribute("data-connection-name");
    if(confirm(`Delete ${connectionName}?`)) {
        await window.leveldb.deleteConnection(connectionName);
        await displayConnections();
    }
        
}
