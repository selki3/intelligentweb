/**
 * @module sightings
 *
 * @description This module is responsible for opening the connection to mongodb, using the sightings database.
 *
 */
var mongoose = require('mongoose');

let mongoDB = 'mongodb://127.0.0.1:27017/sightings';

mongoose.Promise = global.Promise;

try{
    connection = mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });
    console.log('connection to mongodb successful.');
} catch(e) {
    console.log('error connecting to mongodb.: ' + e.message);
}
