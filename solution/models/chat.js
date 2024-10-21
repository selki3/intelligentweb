/**
 * @description Module to model the chat collection in the sightings database.
 */

// Require the Mongoose library
var mongoose = require('mongoose');

// Get the Schema object from Mongoose
var Schema = mongoose.Schema;

// Create a new Schema for the Chat model
var ChatSchema = new Schema({
    // Define the fields for the Chat model
    sightingId: { type: String },      // ID of the associated sighting
    username: { type: String },        // Username of the chat participant
    text: { type: String },            // Chat message text
    dateTime: { type: String }         // Date and time of the chat message
});

// Set options for the ChatSchema
ChatSchema.set('toObject', { getters: true, virtuals: true });

// Create a model using the ChatSchema
var Chat = mongoose.model('Chat', ChatSchema);

// Export the Chat model to make it available in other parts of the application
module.exports = Chat;
