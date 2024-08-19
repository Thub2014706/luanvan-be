const RoomModel = require("../models/RoomModel")
const TheaterModel = require("../models/TheaterModel")

const addTheater = async (req, res) => {
    const { name, address, province, district, ward } = req.body

    const existing = await TheaterModel.findOne({ name: name, isDelete: false })
    if (!name || !address || !province || !district || !ward ) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên rạp phim đã tồn tại"
        })
    }
    try {
        const data = await TheaterModel.create(req.body)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateTheater = async (req, res) => {
    const id = req.params.id
    const { name, address, province, district, ward } = req.body

    const existing = await TheaterModel.findOne({
        _id: { $ne: id },
        name: name,
        isDelete: false
    });
    if (!name || !address || !province || !district || !ward ) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên rạp phim đã tồn tại"
        })
    }
    try {
        const data = await TheaterModel.findByIdAndUpdate(id, req.body, { new: true })
        console.log(rooms)
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteTheater = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await RoomModel.find({theater: id, isDelete: false})
        await Promise.all(existing.map(async item => 
            await RoomModel.findByIdAndDelete(item._id))
        )
        await TheaterModel.findByIdAndUpdate({_id: id}, {isDelete: true}, {new: true})
        res.status(200).json({
            message: 'Xóa thành công'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const statusTheater = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await TheaterModel.findById(id);
        const data = await TheaterModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailTheater = async (req, res) => {
    const id = req.params.id
    try {
        const data = await TheaterModel.findById(id);
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allTheater = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await TheaterModel.find({isDelete: false}).sort({createdAt: -1})
        const searchAll = all.filter(item => 
            [item.name, item.province, item.ward, item.district, item.address].some(any =>
                any
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .includes(
                    search
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase(),
                ))
            )
            
        const start = (parseInt(number) - 1) * parseInt(show);
        const end = start + parseInt(show);
        const newAll = searchAll.slice(start, end);
        const totalPages = Math.ceil(searchAll.length / parseInt(show))
        res.status(200).json({
            data: newAll,
            sumPage: totalPages,
            length: searchAll.length
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addTheater,
    updateTheater,
    deleteTheater,
    statusTheater,
    detailTheater,
    allTheater
}
