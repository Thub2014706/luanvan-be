const EventModel = require("../models/EventModel")

const addEvent = async (req, res) => {
    const image = req.file?.filename
    const {title, content} = req.body

    if (!image || !title || !content) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await EventModel.create({ image, title, content})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateEvent = async (req, res) => {
    const id = req.params.id
    const { title, content, imageId } = req.body
    const image = imageId ? imageId : req.file.filename

    if (!image || !title || !content) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await EventModel.findByIdAndUpdate(id, { title, content, image}, {new: true})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailEvent = async (req, res) => {
    const id = req.params.id

    try {
        const data = await EventModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allEvent = async (req, res) => {
    const {number, show} = req.query

    try {
        const data = await EventModel.find({}).sort({createdAt: -1})
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

const statusEvent = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await EventModel.findById(id);
        const data = await EventModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listEvent = async (req, res) => {

    try {
        const data = await EventModel.find({status: true})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteEvent = async (req, res) => {
    const id = req.params.id

    try {
        await EventModel.findByIdAndDelete(id)
        res.status(200).json({message: 'Xóa thành công'})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addEvent,
    updateEvent,
    allEvent,
    detailEvent,
    statusEvent,
    listEvent,
    deleteEvent
}