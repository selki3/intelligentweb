const Sighting = require('../models/sighting');
const path = require('path');
const Chat = require("../models/chat");

/**
 * Create a new sighting.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves to the saved sighting.
 */
exports.create = function (req, res) {
    let sightingData = req.body;
    let dateTime = new Date();
    let imagePath = "default.jpeg";

    // remove 'public/' from saved file path
    if (req.file) {
        imagePath = path.basename(req.file.path);
    }

    let sighting = new Sighting({
        uploadedBy: req.body.uploadedBy,
        identification: req.body.bird,
        description: sightingData.description,
        dateTime: dateTime,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        img: imagePath,
        signature: req.body.signature
    });

    // Return the promise
    return sighting.save()
        .then(sighting => {
            // return the saved sighting
            return sighting;
        })
        .catch(err => {
            // error saving sightings
            throw new Error('Sighting could not be saved.');
        });
};

/**
 * Sync a sighting to the database.
 *
 * @param {Object} sighting - The sighting object.
 * @returns {Promise} - A promise that resolves to the synced sighting.
 */
exports.sync = function(sighting) {
    let dateTime = new Date()

    //sighting is a JSON, we convert to mongo
    let s = new Sighting({
        uploadedBy: sighting.uploadedBy,
        identification: sighting.identification,
        description: sighting.description,
        dateTime: dateTime,
        longitude: sighting.longitude,
        latitude: sighting.latitude,
        img: sighting.img,
        signature: sighting.signature
    })

    return new Promise(function(res, rej) {
        s.save(function(err) {
            if(err) {
                rej(sighting)
            }
            res(sighting)
        })
    })
}
/**
 * Update a sighting.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves to the updated sighting.
 */
exports.update = function (req, res) {
    return Sighting.findByIdAndUpdate(req.body.id, {identification: req.body.bird}, {new: true})
        .then(sighting => {
            return sighting;
        })
        .catch(err => {
            throw new Error('Sighting could not be updated.')
        });
}

/**
 * Update a sighting with an image.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves to the updated sighting.
 */
exports.updateImg = function (req, res) {
    let imagePath = "default.jpeg";
    // remove 'public/' from saved file path
    if (req.file) {
        imagePath = path.basename(req.file.path);
    }

    return Sighting.findByIdAndUpdate(req.body.id, {img: imagePath}, {new: true})
        .then(sighting => {
            return sighting;
        })
        .catch(err => {
            throw new Error('Sighting could not be updated.')
        });
}

/**
 * Get all sightings.
 *
 * @returns {Promise} - A promise that resolves to an array of sightings.
 */
exports.getAll = async function () {
    return Sighting.find().sort({dateTime: -1});
};

/**
 * Get a sighting by ID.
 *
 * @param {string} id - The ID of the sighting.
 * @returns {Promise} - A promise that resolves to the sighting.
 */
exports.withID = async function(id) {
    return Sighting.findById(id);
};
