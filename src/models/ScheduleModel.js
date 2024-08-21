const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    film: { type: mongoose.Schema.Types.ObjectId, ref: 'Film', required: true},
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, required: true },
    isDelete: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const ScheduleModel = mongoose.model('Schedule', ScheduleSchema)

module.exports = ScheduleModel