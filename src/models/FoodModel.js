const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    isDelete: { type: Boolean, required: true, default: false },
    // status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const FoodModel = mongoose.model('Food', FoodSchema)

module.exports = FoodModel