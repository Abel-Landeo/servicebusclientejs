const { ipcMain, app, Notification, dialog } = require('electron');
const { ClientServiceBus, SenderServiceBus } = require('./ServiceBusWrapper');
const fsm = require('./fsModule');
const fs = require('fs');

ipcMain.on('init-download', async (event, topicData) => {
    event.sender.send('progress-download', 'Initiating download...');
    let sbClient = new ClientServiceBus(topicData.connectionString, topicData.name, topicData.subsName);
    const dir = app.getPath("downloads");
    const filePath = `${dir}/${new Date().toJSON().replaceAll(":", "")}__${topicData.name}__${topicData.subsName}__${topicData.dlCheck ? "dl" : "main"}.jsonl`;
    const fileWritable = fs.createWriteStream(filePath, { flags: "a" });
    let totalMessageCount = 0;
    await sbClient.peekAndProcess(10, topicData.dlCheck, messages => {
        messages.forEach(message => {
            let curatedMessage = {
                enqueuedTimeUtc: message.enqueuedTimeUtc,
                deadLetterReason: message.deadLetterReason,
                deadLetterErrorDescription: message.deadLetterErrorDescription,
                body: message.body,
                applicationProperties: message.applicationProperties,
                messageId: message.messageId,
                deliveryCount: message.deliveryCount,
                enqueuedSequenceNumber: message.enqueuedSequenceNumber
            };
            fileWritable.write(`${JSON.stringify(curatedMessage)}\n`);
        });
        totalMessageCount += messages.length;
        event.sender.send('progress-download', `${totalMessageCount} messages written`);
    });
    fileWritable.close();
    await fs.promises.rename(filePath, `${filePath.slice(0, filePath.indexOf(".jsonl"))}__${totalMessageCount}.jsonl`);
    event.sender.send('progress-download', `Complete. ${totalMessageCount} messages saved`);
    new Notification(
        {
            title: "File saved",
            body: `${filePath}`
        }
    ).show();

});

ipcMain.on("open-dialog", async (event) => {
    let result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {name: "Json files", extensions: ["jsonl", "json"]}
        ]
    });
    if (!result.canceled) {
        let filePath = result.filePaths[0];
        let items = await fsm.loadJsonFile(filePath);
        event.sender.send('open-dialog-reply', JSON.stringify(items));
    }
});

ipcMain.on("massive-send-dialog", async (event, topicData) => {
    let result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {name: "Json files", extensions: ["jsonl", "json"]}
        ]
    });
    if (!result.canceled) {
        let filePath = result.filePaths[0];
        let items = await fsm.loadJsonFile(filePath);
        event.sender.send('massive-send-dialog-reply', `Loaded ${items.length} items, creating sender...`);
        let senderSb = new SenderServiceBus(topicData.connectionString, topicData.entity);
        let total = items.length;
        let c = 0;
        await senderSb.publish(items, topicData.applicationProps, () => {
            event.sender.send('massive-send-dialog-reply', `Published ${++c} of ${total}`);
        });
    }
});