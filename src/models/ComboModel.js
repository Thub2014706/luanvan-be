const mongoose = require('mongoose');

const ComboSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    variants: [{
        food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true},
        quantity: { type: Number, required: true },
    }],
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const ComboModel = mongoose.model('Combo', ComboSchema)

module.exports = ComboModel