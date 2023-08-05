const sb = require('./ServiceBusWrapper');

async function listRuntimeSubscriptions(connectionString, name) {
    const sbAdmin = new sb.AdminServiceBus(connectionString, name);
    return await sbAdmin.listSubscriptions({isRuntime: true});

}

async function getProps(connectionString, name, subsName) {
    const sbAdmin = new sb.AdminServiceBus(connectionString, name);
    let [configProps, rules] = await Promise.allSettled([sbAdmin.getSubscription(subsName), sbAdmin.listRules(subsName)]);
    return {
        config: configProps.value,
        rules: rules.value
    };
}

async function removeSubs(connectionString, name, subsName) {
    const sbAdmin = new sb.AdminServiceBus(connectionString, name);
    await sbAdmin.deleteSubscription(subsName);
}

async function createSubs(connectionString, name, newSubsName) {
    const sbAdmin = new sb.AdminServiceBus(connectionString, name);
    await sbAdmin.createSubscription(newSubsName);
}

async function updateConfig(connectionString, name, configObj) {
    const sbAdmin = new sb.AdminServiceBus(connectionString, name);
    await Promise.all([
        sbAdmin.updateSubsConfig(configObj.config),
        sbAdmin.persistRules(configObj.config.subscriptionName, configObj.rules)
    ]);
}

async function retrieveMessages(connectionString, name, subs, isDeadLetter, isPeekAndDelete) {
    const sbClient = new sb.ClientServiceBus(connectionString, name, subs);
    return await sbClient.peekMessages(isDeadLetter, isPeekAndDelete);
}

async function publish(connectionString, name, messages, applicationProps = {}) {
    const sbSender = new sb.SenderServiceBus(connectionString, name);
    if ( !Array.isArray(messages) ) {
        messages = [messages];
    }
    for (let message of messages) {
        await sbSender.publish(message, applicationProps);
    }
}

module.exports = {
    listRuntimeSubscriptions,
    getProps,
    removeSubs,
    createSubs,
    updateConfig,
    retrieveMessages,
    publish
};