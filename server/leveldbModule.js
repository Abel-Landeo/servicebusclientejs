const {Level} = require('level');

const db = new Level('./db', {valueEncoding: 'json'});

const KEY_CONNECTIONS = "key_connections";

/**
 * @typedef {Object} connection
 * @property {string} name
 * @property {string} string
 * @property {string} entity
 * @property {string} type
 * @property {string} color
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
 * retreive one connection from connectionName
 * @param {String} connectionName
 * @returns {connection}
 */
async function getConnection(connectionName) {
    let currentConnections = await getConnections();
    return currentConnections.find(c => c.name === connectionName, {});
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
 * update a connection
 * @param {String} originalName
 * @param {connection} connection 
 */
async function updateConnection(originalName, connection) {
    let currentConnections = await getConnections();
    let foundedIndex = currentConnections.findIndex(c => c.name === originalName);
    currentConnections[foundedIndex] = connection;
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

/**
 * Stores bodies per connection name
 * @param {String} connectionName 
 * @param {Map} bodies
 */
async function setBodies(connectionName, bodies) {
    await db.put(connectionName, bodies);    
}

/**
 * Retreives bodies from specific connection name
 * @param {String} connectionName 
 * @returns {Promise<Map>}
 */
async function getBodies(connectionName) {
    try {
        return await db.get(connectionName);
    } catch (err) {
        console.error(err);
        return {};
    }
}

async function moveConnection(connectionName, move) {
    let connections = await getConnections();
    let index = connections.findIndex(connection => connection.name === connectionName);
    if (index === -1) {
        return;
    }
    let newIndex = index + move;
    if (newIndex < 0 || newIndex >= connections.length ) {
        return;
    }
    [ connections[index], connections[newIndex] ] = [ connections[newIndex], connections[index] ];
    await setConnections(connections);
}

module.exports = {
    setConnections,
    getConnections,
    addConnection,
    updateConnection,
    getConnection,
    deleteConnection,
    setBodies,
    getBodies,
    moveConnection
}