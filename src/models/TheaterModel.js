const mongoose = require('mongoose');

const TheaterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    // map: { type: String, required: true },
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const TheaterModel = mongoose.model('Theater', TheaterSchema)

module.exports = TheaterModel