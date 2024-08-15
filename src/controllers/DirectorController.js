const DirectorModel = require("../models/DirectorModel")

const addDirector = async (req, res) => {
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
        const data = await DirectorModel.create({...req.body, avatar: avatar})
        res.status(200).json(data)
    } catch (error) {
        console.log('ee', avatar)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateDirector = async (req, res) => {
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
        const data = await DirectorModel.findByIdAndUpdate(id, 
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

const detailDirector = async (req, res) => {
    const id = req.params.id
    try {
        const data = await DirectorModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allDirector = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await DirectorModel.find({}).sort({createdAt: -1})
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

const deleteDirector = async (req, res) => {
    const id = req.params.id
    try {
        const data = await DirectorModel.findOneAndDelete({_id: id})
        res.status(200).json({
            message: 'Xóa thành công'
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listDirector = async (req, res) => {
    try {
        const data = await DirectorModel.find({}).sort({createdAt: -1})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addDirector,
    updateDirector,
    detailDirector,
    allDirector,
    deleteDirector,
    listDirector
}