const FilmModel = require("../models/FilmModel")
const GenreModel = require("../models/GenreModel")

const addGenre = async (req, res) => {
    const { name } = req.body

    const existing = await GenreModel.findOne({ name: name })
    if (!name) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên thể loại đã tồn tại"
        })
    }
    try {
        const data = await GenreModel.create({
            name
        })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateGenre = async (req, res) => {
    const id = req.params.id
    const { name } = req.body

    const existing = await GenreModel.findOne({
        _id: { $ne: id },
        name: name,
    });
    if (!name) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên thể loại đã tồn tại"
        })
    }
    try {
        const data = await GenreModel.findByIdAndUpdate(id, req.body, { new: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteGenre = async (req, res) => {
    const id = req.params.id
    try {
        await FilmModel.updateMany({ genre: { $in: [id] } }, { $pull: { genre: id } }, {new: true})

        await GenreModel.findOneAndDelete({_id: id})
        res.status(200).json({
            message: 'Xóa thành công'
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailGenre = async (req, res) => {
    const id = req.params.id
    try {
        const data = await GenreModel.findById(id);
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allGenre = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await GenreModel.find({}).sort({createdAt: -1})
        const searchAll = all.filter(item => item.name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes(
                search
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase(),
            ));
        const start = (parseInt(number) - 1) * parseInt(show);
        const end = start + parseInt(show);
        const newAll = searchAll.slice(start, end);
        const totalPages = Math.ceil(searchAll.length / parseInt(show))
        res.status(200).json({
            data: newAll,
            length: totalPages
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listGenre = async (req, res) => {
    try {
        const data = await GenreModel.find().sort({createdAt: -1});
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = { 
    addGenre,
    updateGenre,
    deleteGenre,
    detailGenre,
    allGenre,
    listGenre
}