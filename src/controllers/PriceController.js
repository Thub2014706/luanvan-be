const PriceModel = require("../models/PriceModel")

const addPrice = async (req, res) => {

    try {
        const data = await PriceModel.create(req.body)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}