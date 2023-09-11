window.addEventListener("DOMContentLoaded", async () => {
    let searchParams = new URLSearchParams(window.location.search);
    let connectionName = searchParams.get("connection-name");
    
    /** @type {import("../../server/leveldbModule").connection} */
    let connection = await window.leveldb.getConnection(connectionName);
    document.connection["originalName"].value = connection.name;
    document.connection["name"].value = connection.name;
    document.connection["string"].value = connection.string;
    document.connection["entity"].value = connection.entity;
    document.connection["type"].value = connection.type;
    document.connection["color"].value = connection.color;
    
});

document.forms[0].addEventListener('submit', e => {
    e.preventDefault();
    /** @type {HTMLFormElement} */
    let f = e.target;
    let updateConnection = {
        name: f.name.value,
        string: f.string.value,
        entity: f.entity.value,
        type: f.type.value,
        color: f.color.value
    };
    let originalName = f.originalName.value;
    try {
        f.bsubmit.disabled = true;
        validateForm(f);
        window.leveldb.updateConnection(originalName, updateConnection).then( () => {
            sessionStorage.setItem("currentMenu", "Available connections");
            document.location.href = "../list-connections/list-connections.html";
        });
    } catch (error) {
        console.error(error.message);
    } finally {
        f.bsubmit.disabled = false;
    }
});


/**
 * form validation
 * @param {HTMLFormElement} f 
 */
function validateForm(f) {
    /** @type {HTMLInputElement[]} */
    let inputs = Array.from(f.elements).filter(e => e.nodeName === 'INPUT' && e.type === 'text');
    for (let input of inputs) {
        if (input.validity.valueMissing || input.value.trim().length === 0) {
            input.setCustomValidity("required field");
            input.reportValidity();
            throw Error("required field");
        }
        
    }
}