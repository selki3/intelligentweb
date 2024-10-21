let socket = io();
let username = ''
let room = ''
const DB_NAME = "usernames"

/**
 * Set up general page functionality.
 */
function init() {
    if ('indexedDB' in window) {
        initDatabase();
    }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then(function (registration) {
                console.log('Service Worker registered with scope:', registration.scope);
            }, function(err) {
                console.log('Service Worker registration failed with error:', err);
            });
    }
    updateUsernames();

    if (navigator.onLine) {
        console.log("Application online.");
        socket.connect();
    } else {
        console.log("Application offline.");
        socket.disconnect();
    }
}

async function initRoot() {
    init();

    if (!navigator.onLine) {
        loadOfflineSightings();
    }
}

/**
 * Set up page functionality specifically for viewing a sighting.
 */
async function initViewSighting() {
    init();
    initChatRoom();

    let signatures = await window.getSignatures();

    let signatureElements = document.querySelectorAll(".signature");
    for (let se of signatureElements) {
        se.value = JSON.stringify(signatures);
    }
}

/**
 * Set up page functionality for pages with a chat room.
 */
function initChatRoom() {
    //connect to the chat room when the page is loaded
    username = 'Guest'; //default value for testing
    let currentURL = window.location.href;
    room = getSightingIdFromURL(currentURL);

    socket.emit('join', room, username)

    socket.on('joined', function (room, userId, chatResult) {
        //render the chat from database here
        writeDatabaseChats(chatResult);
    });

    //new chat recieved
    socket.on('chat', function(room, username, text) {
        writeOnHistory(username, text);
    });
}

async function loadOfflineSightings() {
    console.log("Loading offline sightings");
    let sightings = await getSightingCachedData();

    let sightingsHTML = "";
    for (let sighting of sightings) {
        sightingsHTML += `<div className="row g-2">
            <!-- image and details will be side-by-side -->
            <div className="sighting-image col-md-2">
                <img className="img-fluid img-thumbnail rounded" src="/uploads/${sighting.img}">
            </div>
            <div className="details col-md-9">
                <div className="container">
                    <div className="row mb-1">
                        <div className="col-md-3 font-weight-bold">Uploaded by:</div>
                        <div className="col-md-9">
                            ${sighting.uploadedBy}
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-md-3 font-weight-bold">Identification:</div>
                        <div className="col-md-9">
                            ${sighting.identification}
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-md-3 font-weight-bold">Time seen:</div>
                        <div className="col-md-9">
                            ${sighting.dateTime}
                        </div>
                    </div>
                    <div className="row mb-1">
                        <div className="col-md-3 font-weight-bold">Coordinates:</div>
                        <div className="col-md-9">
                            ${sighting.latitude}, ${sighting.longitude}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 text-right">
                            Not currently uploaded.
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }
    let parentElement = document.getElementById("offlineSightings");
    parentElement.innerHTML = sightingsHTML;
}

/**
 * Update all HTML elements with the value of the nickname stored in indexedDB.
 */
async function updateUsernames() {
    let usernames = await getUsernameCachedData();
    let username = getLastUsername(usernames);
    const usernameElements = document.querySelectorAll(".nickname");

    // set text to username value for each
    usernameElements.forEach((element) => {
        if (element.tagName === "INPUT") {
            element.value = username;
        } else {
            element.textContent = username;
        }
    })
}
window.updateUsernames = updateUsernames;

/**
 * Get sighting ID from a given URL.
 * @param url - url to take sighting ID from.
 * @returns {String} - the sighting ID.
 */
function getSightingIdFromURL(url) {
    return url.split('/').pop();
}

/**
 * Get chat history from the database.
 *
 * Append the text in the HTML.
 */
function writeOnHistory(username, text) {
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = username + ': ' + text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}

/**
 * Write all chats from the network into the chat window.
 * @param result - chat entries.
 */
function writeDatabaseChats(result) {
    //loop through each chat entry
    for(let i = 0; i < result.length; i++) {
        //extract the chat data
        let { id, username, text, date } = result[i];

        writeOnHistory(username, text);
    }
}

/**
 * Called when the Send button is pressed.
 *
 * Gets the text to send from the interface
 * and sends the message via socket.
 *
 * Adds the chat to the database.
 */
async function sendChatText() {
    //send the message, update view
    let message = document.getElementById('chat_input').value;

    let usernames = await getUsernameCachedData();
    username = getLastUsername(usernames);

    if(navigator.onLine){
        socket.emit('message', room, username, message);
        await storeChatCachedData(room, username, message, new Date().toDateString(), true)
    }
    else {
        await storeChatCachedData(room, username, message, new Date().toDateString(), false)
    }
    writeOnHistory(username, message);
}

/**
 * Stores username from change username form.
 */
function storeNewUsername() {
    let username = document.getElementById('username').value;
    storeUsernameCachedData(username);
    updateUsernames();
}


/**
 * Sync chat data when back online and connect to sockets.
 */
window.addEventListener('online', function(e) {
    console.log('Application back online.')
    socket.connect();

    syncData();
}, false)

/**
 * Disconnect from sockets when offline.
 */
window.addEventListener('offline', function(e) {
    console.log('Application going offline.')
    socket.disconnect();
}, false)

/**
 * Sync any data that may have been sent when offline.
 */
async function syncData() {
    console.log("Syncing data...")
    let cachedData = await getChatCachedData()

    if(cachedData && cachedData.length > 0) {
        for(let res of cachedData) {
            //check if the data synced
            if(!res.synced) {
                //emit the message to sync it
                socket.emit('message', res.sightingId, res.username, res.text)

                await syncChatCachedData(res.id, res.sightingId, res.username, res.text, res.dateTime)
            }
        }
    }

    const sightings = await getSightingCachedData();

    //sync all the sightings
    await fetch('/sync-sightings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(sightings)
    })

    await clearSightingCachedData()
}

/**
 * Store a sighting in indexedDB.
 */
async function storeNewSighting() {
    const formElement = document.getElementById('sighting-form')
    const formData = new FormData(formElement);

    const signature = document.getElementById("signature").value;
    await storeSignature(signature);


    if(navigator.onLine) {
        await fetch('/add-sighting', {
            method: "POST",
            body: formData
        }).then((response) => {
            window.location = '/'
        })
    }
    else {
        const bird = document.getElementById("bird-list").value;
        const description = document.querySelector("textarea[name='description']").value;
        const latitude = document.getElementById("latitude").value;

        const longitude = document.getElementById("longitude").value;
        let usernames = await getUsernameCachedData();
        let uploadedBy = getLastUsername(usernames);

        // Create a new sighting object
        const sighting = {
            uploadedBy: uploadedBy,
            identification: bird,
            description: description,
            dateTime: new Date(),
            latitude: latitude,
            longitude: longitude,
            img: "default.jpeg",
            signature: signature
        }
        console.log("Storing sighting.")
        await storeSightingData(sighting);

        window.location = '/';
    }
}
window.storeNewSighting = storeNewSighting

