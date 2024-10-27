const InformationModel = require("../models/InformationModel")

const addInfomation = async (req, res) => {
    const {imageId, name, phone, email, tiktok, facebook, instagram, copy, youtube, timeStart, timeEnd} = req.body
    const image = imageId ? imageId : req.file.filename    
    if (!image || !name || !phone || !email || !tiktok || !facebook || !instagram || !copy || !youtube || !timeStart || !timeEnd) {
        return res.status(400).json({
            message: "Yêu cầu nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await InformationModel.findOneAndUpdate({}, {
            name, phone, email, tiktok, facebook, instagram, copy, youtube, timeStart, timeEnd, image
        }, { new: true, upsert: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error, req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailInfomation = async (req, res) => {
    try {
        const data = await InformationModel.findOne()
        res.status(200).json(data)
    } catch (error) {
        console.log(error, req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {addInfomation, detailInfomation}