const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const EventModel = mongoose.model('Event', EventSchema)

module.exports = EventModel