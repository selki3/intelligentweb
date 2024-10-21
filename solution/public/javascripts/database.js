import * as idb from './idb/index.js';

let db;

const DB_NAME = 'birdwatching';
const USERNAME_STORE_NAME= 'store_usernames';
const SIGHTINGS_STORE_NAME = 'store_sightings';
const CHAT_STORE_NAME = 'store_chat';
const SIGNATURE_STORE_NAME = 'store_signature';

/**
 * Initializes the database.
 * Creates the necessary object stores and indexes.
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(DB_NAME, 5, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(USERNAME_STORE_NAME)) {
                    let usernameDB = upgradeDb.createObjectStore(USERNAME_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    usernameDB.createIndex('username', 'username', {unique: false, multiEntry: true});
                }
                if (!upgradeDb.objectStoreNames.contains(SIGNATURE_STORE_NAME)) {
                    let usernameDB = upgradeDb.createObjectStore(SIGNATURE_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    usernameDB.createIndex('signature', 'signature', {unique: false, multiEntry: true});
                }
                if(!upgradeDb.objectStoreNames.contains(CHAT_STORE_NAME)) {
                    let chatDB = upgradeDb.createObjectStore(CHAT_STORE_NAME,  {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    //search by sightingId for the chat retrieval
                    chatDB.createIndex('sightingId', 'sightingId', { unique: false, multiEntry: true})
                }

                if (!upgradeDb.objectStoreNames.contains(SIGHTINGS_STORE_NAME)) {
                    let sightingDB = upgradeDb.createObjectStore(SIGHTINGS_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    sightingDB.createIndex('sighting', 'sighting', {
                        unique: false,
                        multiEntry: true
                    });
                }
            }
        });
    }
}
window.initDatabase= initDatabase;
/**
 * Stores the cached username data in the database.
 * If the database is not available, stores the data in local storage.
 *
 * @param {Object} username - The username data to be stored.
 */
async function storeUsernameCachedData(username) {
    if (!db)
        await initDatabase();
    if (db) {
        try{
            //code is reaching to at least here
            let tx = await db.transaction(USERNAME_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(USERNAME_STORE_NAME);

            //clear usernames
            await store.clear();

            //add the new username
            await store.put({ username: username });
            await  tx.complete;
        } catch(error) {
            //this error is triggered
            console.error(error);
            localStorage.setItem('username', JSON.stringify(username));
        };
    }
    else localStorage.setItem('username', JSON.stringify(username));
}
window.storeUsernameCachedData=storeUsernameCachedData;

/**
 * Retrieves the cached username data from the database.
 * If the database is not available, retrieves the data from local storage.
 *
 * @returns {Array} An array of cached usernames.
 */
async function getUsernameCachedData() {
    if(!db) {
        await initDatabase()
    }
    if(db) {
        try {
            let tx = await db.transaction(USERNAME_STORE_NAME, 'readonly');
            let store = await tx.objectStore(USERNAME_STORE_NAME);
            let index = await store.index('username');
            let readingsList = await index.getAll();
            await tx.complete;
            let finalResults=[];
            if (readingsList && readingsList.length > 0) {
                let max;
                for (let elem of readingsList)
                    if (!max || elem.date > max.date)
                        max = elem;
                if (max)
                    finalResults.push(max);
                return finalResults;
            } else {
                //GET FROM LOCAL STORAGE
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        //GET FROM LOCAL STORAGE
    }
}
/**
 * Stores the signature in the database.
 * If the database is not available, stores the data in local storage.
 *
 * @param {string} signature - The signature to be stored.
 */
async function storeSignature(signature) {
    if (!db) {
        await initDatabase();
    }
    if (db) {
        try{
            //code is reaching to at least here
            let tx = await db.transaction(SIGNATURE_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(SIGNATURE_STORE_NAME);

            //add the new username
            await store.put({ signature: signature });
            await  tx.complete;
        } catch(error) {
            //this error is triggered
            console.log('error');
            localStorage.setItem('signature', JSON.stringify(signature));
        };
    }
    else localStorage.setItem('signature', JSON.stringify(signature));
}
window.storeSignature = storeSignature;

/**
 * Retrieves the cached signatures from the database.
 *
 * @returns {Array} An array of cached signatures.
 */
async function getSignatures() {
    if (!db) {
        await initDatabase();
    }
    if (db) {
        try {
            let tx = await db.transaction(SIGNATURE_STORE_NAME, 'readonly');
            let store = await tx.objectStore(SIGNATURE_STORE_NAME);

            // get all signatures as list
            let signatures = await store.getAll();

            return signatures.map(s => s.signature);
        } catch (error) {
            console.log('Error getting signatures:', error);
        }
    } else {
        console.log('Database not initialised');
    }
}
window.getSignatures = getSignatures;

/**
 * Stores the sighting data in the database.
 * If the database is not available, stores the data in local storage.
 *
 * @param {Object} data - The sighting data to be stored.
 */
async function storeSightingData(data) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(SIGHTINGS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(SIGHTINGS_STORE_NAME);
            await store.put({sighting: data});
            await tx.complete;
        } catch (error) {
            console.log(error);
            localStorage.setItem('sighting', JSON.stringify(data));
        }
    } else {
        localStorage.setItem('sighting', JSON.stringify(data));
    }
}
/**
 * Retrieves the cached sighting data from the database.
 * If the database is not available, retrieves the data from local storage.
 *
 * @returns {Array} An array of cached sightings.
 */
async function getSightingCachedData() {
    if (!db) {
        await initDatabase();
    }
    if (db) {
        try {
            let tx = await db.transaction(SIGHTINGS_STORE_NAME, 'readonly');
            let store = await tx.objectStore(SIGHTINGS_STORE_NAME);

            // get all signatures as list
            let sightings = await store.getAll();

            return sightings.map(s => s.sighting);
        } catch (error) {
            console.log('Error getting sightings:', error);
        }
    } else {
        console.log('Database not initialised');
    }
}
window.storeSightingData = storeSightingData;
window.getSightingCachedData = getSightingCachedData;
window.getUsernameCachedData = getUsernameCachedData;

async function clearSightingCachedData() {
    if (!db) {
        await initDatabase();
    }
    if (db) {
        try {
            let tx = await db.transaction(SIGHTINGS_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(SIGHTINGS_STORE_NAME);

            //clear database
            await store.clear();
        } catch (error) {
            console.log('Error clearing sightings:', error);
        }
    } else {
        console.log('Database not initialised');
    }
}
window.clearSightingCachedData = clearSightingCachedData

/**
 * Returns the last cached username from the provided usernames.
 * If no usernames are available, returns 'Guest'.
 *
 * @param {Array} usernames - An array of cached usernames.
 * @returns {string} The last cached username.
 */
function getLastUsername(usernames) {
    try {
        return usernames[usernames.length - 1].username
    }
    catch(error) {
        return 'Guest'
    }
}
window.getLastUsername = getLastUsername;


/**
 * Retrieves the current username.
 * If no cached username is available, returns 'Guest'.
 *
 * @returns {string} The current username.
 */
function getUsername() {
    let usernames = getUsernameCachedData()
    try {
        return usernames[0].username
    }
    catch(error) {
        return 'Guest'
    }
}
window.getUsername = getUsername


/**
 * Stores the cached chat data in the database.
 *
 * @param {string} sightingId - The ID of the sighting associated with the chat.
 * @param {string} username - The username of the chat message.
 * @param {string} text - The chat message text.
 * @param {string} dateTime - The date and time of the chat message.
 * @param {boolean} synced - Indicates if the chat message is synced.
 */
async function storeChatCachedData(sightingId, username, text, dateTime, synced) {
    if (!db) {
        await initDatabase();
    }
    if (db) {
        try{
            //code is reaching to at least here
            let tx = await db.transaction(CHAT_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(CHAT_STORE_NAME);

            //add the new chat
            await store.put({
                sightingId: sightingId,
                username: username,
                text: text,
                dateTime: dateTime,
                synced: synced
            });
            await  tx.complete;
        } catch(error) {
            //this error is triggered
            console.log(error)
        }
    }
}
window.storeChatCachedData = storeChatCachedData

/**
 * Retrieves the cached chat data from the database.
 *
 * @returns {Array} An array of cached chat messages.
 */
async function getChatCachedData() {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(CHAT_STORE_NAME, 'readonly');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            let index = await store.index('sightingId');
            let readingsList = await index.getAll();
            await tx.complete;
            if (readingsList && readingsList.length > 0) {
               return readingsList
            } else {
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(sightingId);
        let finalResults=[];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}
window.getChatCachedData = getChatCachedData

/**
 * Syncs the cached chat data by marking it as synced in the database.
 *
 * @param {string} key - The key of the chat message.
 * @param {string} sightingId - The ID of the sighting associated with the chat.
 * @param {string} username - The username of the chat message.
 * @param {string} text - The chat message text.
 * @param {string} dateTime - The date and time of the chat message.
 */
async function syncChatCachedData(key, sightingId, username, text, dateTime) {
    if (!db) {
        await initDatabase();
    }
    if (db) {
        try{
            //code is reaching to at least here
            let tx = await db.transaction(CHAT_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(CHAT_STORE_NAME);

            //add the new chat
            await store.put({
                id: key,
                sightingId: sightingId,
                username: username,
                text: text,
                dateTime: dateTime,
                synced: true
            });
            await  tx.complete;
        } catch(error) {
            //this error is triggered
            console.error(error)
        }
    }
}
window.syncChatCachedData = syncChatCachedData