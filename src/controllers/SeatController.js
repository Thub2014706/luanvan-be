const SeatModel = require("../models/SeatModel")

const updateRow = async (req, res) => {
    const {numRow, room, type, status} = req.body
    
    try {
        const existing = await SeatModel.find({room, row: numRow})
        const promises = [];
        for (const item of existing) {
            promises.push(
                SeatModel.findByIdAndUpdate(
                    item._id, 
                    { row: numRow, col: item.col, type, status, room }, 
                    { new: true }
                )
            );
        }

        const data = await Promise.all(promises);

        console.log(data)
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allSeatRoom = async (req, res) => {
    const {room} = req.query
    try {
        const data = await SeatModel.find({room: room}).sort({row: 1, col: 1})
        res.status(200).json(data)
        // console.log(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailSeat = async (req, res) => {
    const id = req.params.id
    try {
        const data = await SeatModel.findById(id);
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateSeat = async (req, res) => {
    const id = req.params.id
    try {
        const data = await SeatModel.findByIdAndUpdate(id, req.body, {new: true})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteSeat = async (req, res) => {
    const id = req.params.id
    try {
        await SeatModel.findByIdAndUpdate(id, {isDelete: true})
        res.status(200).json({
            message: 'Xóa thành công'
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    updateRow,
    allSeatRoom,
    detailSeat,
    updateSeat,
    deleteSeat
}