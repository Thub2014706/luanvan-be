const SurchargeModel = require("../models/SurchargeModel")

const addSurcharge = async (req, res) => {
    try {
        let data = []
        for (let i = 0; i < req.body.length; i++) {
            data.push(await SurchargeModel.findOneAndUpdate(
                {type: req.body[i].type}, 
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

const detailSurcharge = async (req, res) => {
    const {type} = req.query
    try {
        const data = await SurchargeModel.findOne({type})
        res.status(200).json(data)
    } catch (error) {
        console.log(error, req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addSurcharge,
    detailSurcharge
}