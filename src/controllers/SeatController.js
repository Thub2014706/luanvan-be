const SeatModel = require("../models/SeatModel")

const updateRow = async (req, res) => {
    const {numRow, colLength, room, type, status} = req.body
    
    try {
        const promises = [];
        for (let i = 1; i <= colLength; i++) {
            promises.push(
                SeatModel.create({ row: numRow, col: i, type, status, room })
            );
        }

        // Chờ tất cả các promises hoàn thành
        const data = await Promise.all(promises);

        // Trả về phản hồi với danh sách các ghế đã được tạo
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    updateRow
}