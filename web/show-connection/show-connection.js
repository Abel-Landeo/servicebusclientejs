window.addEventListener("DOMContentLoaded", async () => {
    let searchParams = new URLSearchParams(window.location.search);
    window.connectionString = searchParams.get("string");
    window.entity = searchParams.get("entity");
    window.connectionName = searchParams.get("name");

    window.leveldb.getBodies(window.connectionName).then(bodies => {
        document.querySelector("#idTaApplicationProps").value = JSON.stringify(bodies.applicationProps || {});
        document.querySelector("#idTaBodyMessage").value = JSON.stringify(bodies.body || {}, null, 2);
    });

    document.querySelector("#idTitle").innerHTML = `Connection name: ${window.entity}`;

    await displaySubs();
    
    document.querySelector("#idNewBtn").addEventListener('click', async evt => {
        let newSubsName = document.querySelector("#idTextNewSubs").value.trim();
        if (!newSubsName) {
            return alert("Invalid subs name!");
        }
        await window.servicebus.createSubs(window.connectionString, window.entity, newSubsName);
        await displaySubs();
    });

    document.querySelector("#idRefreshBtn").addEventListener('click', async evt => {
        await displaySubs();
    });

    document.querySelector("#idUpdateConfigBtn").addEventListener('click', updateConfig);

    document.querySelector("#idReceiveBtn").addEventListener('click', retrieveMessages);

    document.querySelector("#idDownloadBtn").addEventListener('click', downloadMessages)

    document.querySelector("#idSendBtn").addEventListener('click', sendMessages);

    document.querySelector("#idJsonfyLink").addEventListener('click', prettifyJson);

    window.ipcApi.handleProgress( (_event, value) => {
        document.querySelector('#idIpcLog').innerText = value;
    } );

});

async function displaySubs() {
    let listSubs = document.querySelector("#idListSubs");
    listSubs.innerHTML = "";
    document.querySelector("#idTextArea").value = "";
    document.querySelector("#idTextNewSubs").value = "";
    document.querySelector("#idTblTitle").innerText = "";
    document.querySelector("#idReceiveList").innerHTML = "";
    document.querySelector("#idTaMessage").value = "";

    /** @type {import("@azure/service-bus").SubscriptionRuntimeProperties[]} */
    let subs = await window.servicebus.listRuntimeSubscriptions(window.connectionString, window.entity);
    document.querySelector("#idHeaderSubs span").innerText = `Subscription list (${subs.length})`;
    for (let sub of subs) {
        let liElement = document.createElement("li");
        let propsBtn = document.createElement("button");
        propsBtn.innerText = "props";
        propsBtn.setAttribute("data-subs-name", sub.subscriptionName);
        propsBtn.addEventListener('click', showSubsProps);

        liElement.append(propsBtn, " ");

        liElement.append(`${sub.subscriptionName} - ( ${sub.totalMessageCount}, ${sub.activeMessageCount}, ${sub.deadLetterMessageCount} )`);

        let deleteSubsBtn = document.createElement("button");
        deleteSubsBtn.innerText = "delete";
        deleteSubsBtn.setAttribute("data-subs-name", sub.subscriptionName);
        deleteSubsBtn.addEventListener('click', deleteSubs);

        liElement.append(" ", deleteSubsBtn);

        listSubs.appendChild(liElement);
    }

    /** @type {HTMLSelectElement} */
    let receiverSelect = document.querySelector("#idReceiverSelect");
    receiverSelect.innerHTML = `<option value="">pick a subs</option>`;
    for (let sub of subs) {
        let optionElement = document.createElement('option');
        optionElement.innerText = `${sub.subscriptionName} - ( ${sub.totalMessageCount}, ${sub.activeMessageCount}, ${sub.deadLetterMessageCount} )`;
        optionElement.value = sub.subscriptionName;
        receiverSelect.appendChild(optionElement);

    }

}

/**
 * 
 * @param {MouseEvent} evt 
 */
async function showSubsProps(evt) {
    /** @type {HTMLButtonElement} */
    let targetBtn = evt.target;
    let subsName = targetBtn.getAttribute("data-subs-name");
    let propsSub = await window.servicebus.getProps(window.connectionString, window.entity, subsName);
    document.querySelector("#idTextArea").value = JSON.stringify(propsSub, null, 2);

}

/**
 * 
 * @param {MouseEvent} evt 
 */
async function deleteSubs(evt) {
    let subsName = evt.target.getAttribute("data-subs-name");
    if (confirm(`Remove ${subsName} subs?`)) {
        await window.servicebus.removeSubs(window.connectionString, window.entity, subsName);
        await displaySubs();
    }

}

/**
 * 
 * @param {MouseEvent} evt 
 */
async function updateConfig(evt) {
    let configContent = document.querySelector("#idTextArea").value;
    try {
        let configObj = JSON.parse(configContent);
        await window.servicebus.updateConfig(window.connectionString, window.entity, configObj);
        alert("config update success!");
    } catch (err) {
        console.error(err);
        alert("Invalid config");
    }

}

/**
 * 
 * @param {MouseEvent} evt 
 */
async function retrieveMessages(evt) {
    evt.target.disabled = true;
    try {
        let receiveCheck = document.querySelector("#idReceiveCheck").checked;
        if (receiveCheck) {
            if (!confirm('peek and delete?')) {
                return;
            }
        }
        
        /** @type {HTMLSelectElement} */
        let receiveSelect = document.querySelector("#idReceiverSelect");
        if (receiveSelect.value.trim() === '') {
            return alert("Pick a subs first");
        }

        let dlCheck = document.querySelector("#idDlCheck").checked;

        /** @type {import("@azure/service-bus").ServiceBusReceivedMessage[]} */
        let messages = await window.servicebus.retrieveMessages(
            window.connectionString,
            window.entity,
            receiveSelect.value,
            dlCheck,
            receiveCheck);

        document.querySelector("#idTblTitle").innerHTML = `<strong>Total: ${messages.length}</strong>`;

        let receiveList = document.querySelector("#idReceiveList");
        receiveList.innerHTML = "";
        for (let message of messages) {
            let curatedMessage = {
                enqueuedTimeUtc: message.enqueuedTimeUtc,
                deadLetterReson: message.deadLetterReason,
                deadLetterErrorDescription: message.deadLetterErrorDescription,
                body: message.body,
                applicationProperties: message.applicationProperties,
                messageId: message.messageId,
                deliveryCount: message.deliveryCount,
                enqueuedSequenceNumber: message.enqueuedSequenceNumber

            };
            let liElement = document.createElement("li");
            let showButton = document.createElement("button");
            showButton.innerText = "detail";
            showButton.setAttribute("data-message-body", JSON.stringify(curatedMessage));
            showButton.addEventListener('click', evt => {
                let targetBtn = evt.target;
                let messageObj = JSON.parse(targetBtn.getAttribute("data-message-body"));

                document.querySelector("#idTaMessage").value = JSON.stringify(messageObj, null, 2);

            });
            liElement.append(`${message.enqueuedTimeUtc.toJSON()} `, showButton);
            receiveList.append(liElement);
        }
        
    } finally {
        evt.target.disabled = false;
    }
}

function openTab(evt, idTab) {

    // Get all elements with class="tabcontent" and hide them
    let tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(idTab).style.display = "block";
    evt.currentTarget.classList.add("active");
}

/**
 * 
 * @param {MouseEvent} evt 
 */
async function sendMessages(evt) {
    try {
        evt.target.disabled = true;
        let applicationPropsContent = document.querySelector("#idTaApplicationProps").value;
        let applicationProps = JSON.parse(applicationPropsContent);

        let bodyContent = document.querySelector("#idTaBodyMessage").value;
        let body = JSON.parse(bodyContent);

        await window.servicebus.publish(window.connectionString, window.entity, body, applicationProps);
        await window.leveldb.setBodies(window.connectionName, {body, applicationProps});
        alert("Publish Ok");

    } catch(err) {
        console.error(err);
        alert("catch err");
    } finally {
        evt.target.disabled = false;
    }
    
}

/**
 * 
 * @param {MouseEvent} evt 
 */
async function downloadMessages(evt) {
    evt.target.disabled = true;
    try {
        let receiveCheck = document.querySelector("#idReceiveCheck").checked;
        if (receiveCheck) {
            if (!confirm('peek and delete?')) {
                return;
            }
        }
        
        /** @type {HTMLSelectElement} */
        let receiveSelect = document.querySelector("#idReceiverSelect");
        if (receiveSelect.value.trim() === '') {
            return alert("Pick a subs first");
        }

        let dlCheck = document.querySelector("#idDlCheck").checked;
        console.log("ff")
        window.ipcApi.initDownload({
            connectionString: window.connectionString,
            name: window.entity,
            subsName: receiveSelect.value,
            dlCheck,
            receiveCheck
        });
    } finally {
        evt.target.disabled = false;
    }

}

/**
 * 
 * @param {MouseEvent} evt 
 */
function prettifyJson(evt) {
    try {
        let preContent = document.querySelector("#idTaBodyMessage").value;
        let jsonContent = JSON.parse(preContent);
        document.querySelector("#idTaBodyMessage").value = JSON.stringify(jsonContent, null, 2);
    } catch(err) {
        console.error(err);
    }

}