const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    film: { type: mongoose.Schema.Types.ObjectId, ref: 'Film', required: true},
    star: { type: Number, required: true },
    text: { type: String, required: true },
}, {
    timestamps: true 
});

const CommentModel = mongoose.model('Comment', CommentSchema)

module.exports = CommentModel