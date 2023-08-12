const { ipcMain, app, Notification } = require('electron');
const { ClientServiceBus } = require('./ServiceBusWrapper');
const fs = require('fs');

ipcMain.on('init-download', async (event, topicData) => {
    event.sender.send('progress-download', 'Initiating download...');
    let sbClient = new ClientServiceBus(topicData.connectionString, topicData.name, topicData.subsName);
    const dir = app.getPath("downloads");
    const filePath = `${dir}/${new Date().toJSON()}_${topicData.name}_${topicData.subsName}_${topicData.dlCheck?"dl":"main"}.jsonl`;
    const fileWritable = fs.createWriteStream(filePath, { flags: "a" });
    let totalMessageCount = 0;
    await sbClient.peekAndProcess(5, topicData.dlCheck, messages => {
        messages.forEach(message => {
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
            fileWritable.write(JSON.stringify(curatedMessage));
        });
        totalMessageCount += messages.length;
        event.sender.send('progress-download', `${totalMessageCount} messages written`);
    });
    fileWritable.close();
    event.sender.send('progress-download', `Complete. ${totalMessageCount} messages saved`);
    new Notification(
        {
            title: "File saved",
            body: `${filePath}`
        }
    ).show();

});