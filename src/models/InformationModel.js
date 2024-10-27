const mongoose = require('mongoose');

const InformationSchema = new mongoose.Schema({
    image: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    facebook: { type: String, required: true },
    instagram: { type: String, required: true },
    titok: { type: String, required: true },
    youtube: { type: String, required: true },
    timeStart: { type: String, required: true },
    timeEnd: { type: String, required: true },
    copy: { type: String, required: true },
    // status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const InformationModel = mongoose.model('Information', InformationSchema)

module.exports = InformationModel