const FilmModel = require("../models/FilmModel");
const PerformerModel = require("../models/PerformerModel")

const addPerformer = async (req, res) => {
    const {name, birth, description} = req.body
    let avatar;
    if (req.file) { 
        avatar = req.file.filename;
    }

    if (!name) {
        return res.status(400).json({
            message: "Yêu cầu nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await PerformerModel.create({...req.body, avatar: avatar})
        res.status(200).json(data)
    } catch (error) {
        console.log('ee', avatar)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updatePerformer = async (req, res) => {
    const id = req.params.id
    const {name, avatarId, birth, description} = req.body

    let avatar;
    if (avatarId) {
        avatar = avatarId
    } else if (req.file) { 
        avatar = req.file.filename;
    }
    // const avatar = avatarId ? avatarId : req.file.filename
    if (!name) {
        return res.status(400).json({
            message: "Yêu cầu nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await PerformerModel.findByIdAndUpdate(id, 
            {
                name, birth, avatar, description
            }, 
            {new: true})
        res.status(200).json(data)
    } catch (error) {
        console.log('qqq',error, image)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailPerformer = async (req, res) => {
    const id = req.params.id
    try {
        const data = await PerformerModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allPerformer = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await PerformerModel.find({}).sort({createdAt: -1})
        const searchAll = all.filter(item => item.name.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(
            search
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase(),
        ));
        const start = (parseInt(number) - 1) * parseInt(show)
        const end = start + parseInt(show);
        const newAll = searchAll.slice(start, end);
        const totalPages = Math.ceil(searchAll.length / parseInt(show))
        res.status(200).json({
            data: newAll,
            sumPage: totalPages,
            length: searchAll.length
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deletePerformer = async (req, res) => {
    const id = req.params.id
    try {
        await FilmModel.findOneAndUpdate({ performer: { $in: [id] } }, { $pull: { performer: id } }, {new: true})

        await PerformerModel.findOneAndDelete({_id: id})
        res.status(200).json({
            message: 'Xóa thành công'
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listPerfomer = async (req, res) => {
    try {
        const data = await PerformerModel.find({}).sort({createdAt: -1})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addPerformer,
    updatePerformer,
    detailPerformer,
    allPerformer,
    deletePerformer,
    listPerfomer
}