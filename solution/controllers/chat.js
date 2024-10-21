var Chat = require('../models/chat')

//add a new chat to the database

/**
 * Add a new chat to the database using Promises,
 * to avoid using a post form from view sighting page
 *
 * @param sightingId - Equal to the socket room number.
 * @param name - Username of the message sender.
 * @param text - Content of the message.
 * @returns {Promise}
 */
exports.create = function(sightingId, name, text) {
    let dateTime = new Date()

    let chat = new Chat({
        sightingId: sightingId,
        username: name,
        text: text,
        dateTime: dateTime
    });

    return new Promise(function(res, rej) {
        chat.save(function(err) {
            if(err) {
                rej(chat)
            }
            res(chat)
        })
    })
}

/**
 * Function to return all chats with given sighting ID.
 *
 * @param sightingId - Sighting ID to be searched for.
 * @returns {QueryWithHelpers<Array<EnforceDocument<unknown, {}>>, EnforceDocument<unknown, {}>, {}, unknown>}
 */
exports.withSightingId = function(sightingId) {
    return Chat.find({ sightingId: sightingId });
}