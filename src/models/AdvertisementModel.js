const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema({
    image: { type: String, required: true },
    link: { type: String, required: true },
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const AdvertisementModel = mongoose.model('Advertisement', AdvertisementSchema)

module.exports = AdvertisementModel