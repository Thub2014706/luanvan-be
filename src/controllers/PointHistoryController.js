const PointHistoryModel = require("../models/PointHistoryModel");

const allPointHistory = async (req, res) => {
    const id = req.params.id
    // const {number} = req.query
    try {
        const data = await PointHistoryModel.find({user: id})

        const start = (parseInt(number) - 1) * 5
        const end = start + 5;
        const newAll = data.slice(start, end);
        const totalPages = Math.ceil(data.length / 5)
        
        res.status(200).json({
            data: newAll,
            length: totalPages
        })
    } catch (error) {
        console.log('ee', error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {allPointHistory}