const mongoose = require('mongoose');

const DirectorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    avatar: { type: String },
    birth: { type: Date },
    description: { type: String },
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const DirectorModel = mongoose.model('Director', DirectorSchema)

module.exports = DirectorModel