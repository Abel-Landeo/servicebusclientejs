document.forms[0].addEventListener('submit', e => {
    e.preventDefault();
    /** @type {HTMLFormElement} */
    let f = e.target;
    let newConnection = {
        name: f.name.value,
        string: f.string.value,
        entity: f.entity.value,
        type: f.type.value
    };
    try {
        f.bsubmit.disabled = true;
        validateForm(f);
        window.leveldb.addConnection(newConnection).then( () => {
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