const { ipcMain, app, Notification } = require('electron');
const { ClientServiceBus } = require('./ServiceBusWrapper');
const fs = require('fs/promises');

ipcMain.on('init-download', async (event, topicData) => {
    event.sender.send('progress-download', 'Initiating download...');
    let sbClient = new ClientServiceBus(topicData.connectionString, topicData.name, topicData.subsName);
    
    let totalMessages = [];
    await sbClient.peekAndProcess(3, topicData.dlCheck, messages => {
        totalMessages = totalMessages.concat(messages);
        event.sender.send('progress-download', `having ${totalMessages.length}`);
    });
    event.sender.send('progress-download', `Complete. Saving ${totalMessages.length} messages..`);
    const dir = app.getPath("downloads");
    const filePath = `${dir}/${new Date().toJSON()}_${topicData.name}_${topicData.subsName}_${totalMessages.length}.json`;
    await fs.writeFile(filePath, JSON.stringify(totalMessages));
    event.sender.send('progress-download', 'Done');
    new Notification(
        {
            title: "File saved",
            body: `${filePath}`
        }
    ).show();

});