const mongoose = require('mongoose');

const PerformerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    avatar: { type: String },
    birth: { type: Date },
    description: { type: String },
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const PerformerModel = mongoose.model('Performer', PerformerSchema)

module.exports = PerformerModel