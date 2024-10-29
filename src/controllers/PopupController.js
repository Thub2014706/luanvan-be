const PopupModel = require("../models/PopupModel")

const addPopup = async (req, res) => {
    const {imageId} = req.body
    const image = imageId || (req.file && req.file.filename)  
    // if (!image) {
    //     return res.status(400).json({
    //         message: "Yêu cầu thêm hình ảnh"
    //     })
    // }
    try {
        const data = await PopupModel.findOneAndUpdate({}, {
            image
        }, { new: true, upsert: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error, req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailPopup = async (req, res) => {
    try {
        const data = await PopupModel.findOne()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deletePopup = async (req, res) => {
    try {
        const data = await PopupModel.findOneAndDelete()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {addPopup, detailPopup, deletePopup}