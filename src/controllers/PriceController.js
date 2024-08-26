const PriceModel = require("../models/PriceModel")

const addPrice = async (req, res) => {
    try {
        let data = []
        for (let i = 0; i < req.body.length; i++) {
            data.push(await PriceModel.findOneAndUpdate({
                typeUser: req.body[i].typeUser, 
                time: req.body[i].time}, 
                req.body[i], 
                {new: true, upsert: true}
            ))
        }
        console.log(data)
        res.status(200).json(data)
    } catch (error) {
        console.log(error, req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailPrice = async (req, res) => {
    const {typeUser, time} = req.query
    try {
        const data = await PriceModel.findOne({typeUser, time})
        res.status(200).json(data)
    } catch (error) {
        console.log(error, req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addPrice,
    detailPrice
}