const {Level} = require('level');

const db = new Level('./db', {valueEncoding: 'json'});

const KEY_CONNECTIONS = "key_connections";

/**
 * @typedef {Object} connection
 * @property {string} name
 * @property {string} string
 * @property {string} entity
 * @property {string} type
 */

/**
 * set an array of connections to leveldb
 * @param {connection[]} connections 
 */
async function setConnections(connections) {
    await db.put(KEY_CONNECTIONS, connections);
}

/**
 * return the array of available connections from leveldb
 * @returns {Promise<connection[]>}
 */
async function getConnections() {
    try {
        return await db.get(KEY_CONNECTIONS);        
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * add a connection
 * @param {connection} connection 
 */
async function addConnection(connection) {
    let currentConnections = await getConnections();
    currentConnections.push(connection);
    await setConnections(currentConnections);
}

/**
 * removes a connection by name
 * @param {String} connectionName 
 */
async function deleteConnection(connectionName) {
    let currentConnections = await getConnections();
    let filteredConnections = currentConnections.filter(connection => connection.name !== connectionName);
    await setConnections(filteredConnections);
}

module.exports = {
    setConnections,
    getConnections,
    addConnection,
    deleteConnection
}