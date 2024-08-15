const mongoose = require('mongoose');

const PerformerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    avatar: { type: String },
    birth: { type: Date },
    description: { type: String }
}, {
    timestamps: true 
});

const PerformerModel = mongoose.model('Performer', PerformerSchema)

module.exports = PerformerModel