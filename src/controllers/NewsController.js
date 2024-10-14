const NewsModel = require("../models/NewsModel")

const addNews = async (req, res) => {
    const image = req.file?.filename
    const {title, content, staff} = req.body

    if (!image || !title || !content || !staff) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await NewsModel.create({ image, title, content, staff})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateNews = async (req, res) => {
    const id = req.params.id
    const { title, content, imageId, staff } = req.body
    const image = imageId ? imageId : req.file.filename

    if (!image || !title || !content || !staff) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await NewsModel.findByIdAndUpdate(id, { title, content, image, staff}, {new: true})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailNews = async (req, res) => {
    const id = req.params.id

    try {
        const data = await NewsModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allNews = async (req, res) => {
    const {number, show} = req.query

    try {
        const data = await NewsModel.find({}).sort({createdAt: -1})
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

const statusNews = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await NewsModel.findById(id);
        const data = await NewsModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listNews = async (req, res) => {

    try {
        const data = await NewsModel.find({status: true})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteNews = async (req, res) => {
    const id = req.params.id

    try {
        await NewsModel.findByIdAndDelete(id)
        res.status(200).json({message: 'Xóa thành công'})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addNews,
    updateNews,
    allNews,
    detailNews,
    statusNews,
    listNews,
    deleteNews
}