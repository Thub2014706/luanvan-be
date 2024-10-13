const AdvertisementModel = require("../models/AdvertisementModel")

const addAdvertisement = async (req, res) => {
    const image = req.file?.filename
    const {link} = req.body

    if (!image || !link) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await AdvertisementModel.create({ link, image})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateAdvertisement = async (req, res) => {
    const id = req.params.id
    const { link, imageId } = req.body
    const image = imageId ? imageId : req.file.filename

    if (!image || !link) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await AdvertisementModel.findByIdAndUpdate(id, { link, image}, {new: true})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailAdvertisement = async (req, res) => {
    const id = req.params.id

    try {
        const data = await AdvertisementModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allAdvertisement = async (req, res) => {
    const {number, show} = req.query

    try {
        const data = await AdvertisementModel.find({status: true})
        const start = (parseInt(number) - 1) * parseInt(show)
        const end = start + parseInt(show);
        const newAll = data.slice(start, end);
        const totalPages = Math.ceil(data.length / parseInt(show))
        res.status(200).json({
            data: newAll,
            sumPage: totalPages,
            length: data.length
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const statusAdvertisement = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await AdvertisementModel.findById(id);
        const data = await AdvertisementModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addAdvertisement,
    updateAdvertisement,
    allAdvertisement,
    detailAdvertisement,
    statusAdvertisement
}