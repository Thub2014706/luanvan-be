const mongoose = require('mongoose');

const FilmSchema = new mongoose.Schema({
    name: { type: String, required: true },
    time: { type: Number, required: true },
    nation: { type: String, required: true },
    genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre', required: true}], 
    director: { type: Array, required: true },
    releaseDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    age: { type: String, required: true },
    performer: { type: Array, required: true },
    image: { type: String, required: true },
    trailer: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const FilmModel = mongoose.model('Film', FilmSchema)

module.exports = FilmModel