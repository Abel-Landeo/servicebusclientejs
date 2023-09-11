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
        liElement.style.color = connection.color;
        liElement.style.fontWeight = 'bold';
                
        liElement.append(connection.name, " ");
        let openButtonElement = document.createElement("button");
        openButtonElement.innerText = "Open";
        openButtonElement.setAttribute("data-connection", JSON.stringify(connection));
        openButtonElement.addEventListener("click", openConnection);
        liElement.append(openButtonElement, " ");

        let updateButton = document.createElement("button");
        updateButton.innerText = "Update";
        updateButton.setAttribute("data-connection-name", connection.name);
        updateButton.addEventListener("click", updateConnection);
        liElement.append(updateButton, " ");
        
        let deleteButtonElement = document.createElement("button");
        deleteButtonElement.innerText = "Delete";
        deleteButtonElement.setAttribute("data-connection-name", connection.name);
        deleteButtonElement.addEventListener('click', deleteConnection);
        liElement.append(deleteButtonElement, " ");

        let spanUpElement = document.createElement("span");
        spanUpElement.append("up");
        spanUpElement.classList.add("linklike");
        spanUpElement.addEventListener('click', _evt => moveConnection(connection.name, -1));
        liElement.append(spanUpElement, " ");
        
        let spanDownElement = document.createElement("span");
        spanDownElement.append("down");
        spanDownElement.classList.add("linklike");
        spanDownElement.addEventListener('click', _evt => moveConnection(connection.name, 1));
        liElement.append(spanDownElement);        

        mainList.append(liElement);
    }
    /** @type {HTMLInputElement} */
    let inputFilter = document.querySelector("#inputFilterId");
    inputFilter.disabled = false;
    inputFilter.setAttribute("placeholder", "filter connection");
    inputFilter.focus();
    inputFilter.addEventListener("keyup", filterConnectionListener);
}

/**
 * 
 * @param {KeyboardEvent} evt 
 */
async function filterConnectionListener(evt) {
    let partialValue = evt.target.value;
    /** @type {NodeListOf<HTMLLIElement} */
    let liElements = document.querySelectorAll("#mainList li");
    let liArray = Array.from(liElements);
    liArray.forEach(e => e.style.display = '');
    liArray
        .filter(e => !e.innerHTML.startsWith(partialValue))
        .forEach(e => {
            e.style.display = 'none';
        });

        
}

async function moveConnection(connectionName, move) {
    await window.leveldb.moveConnection(connectionName, move);
    await displayConnections();
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

/**
 * 
 * @param {MouseEvent} evt 
 */
async function updateConnection(evt) {
    /** @type {HTMLButtonElement} */
    let updateButton = evt.target;
    let connectionName = updateButton.getAttribute("data-connection-name");
    let searchParams = new URLSearchParams();
    searchParams.append("connection-name", connectionName);
    document.location.href = `./../update-connection/update-connection.html?${searchParams.toString()}`;
}