const RoomModel = require("../models/RoomModel")
const SeatModel = require("../models/SeatModel")
const TheaterModel = require("../models/TheaterModel")

const addTheater = async (req, res) => {
    const { name, address, province, district, ward } = req.body
    const image = req.file?.filename

    const existing = await TheaterModel.findOne({ name: name, isDelete: false })
    if (!name || !image || !address || !province || !district || !ward ) {
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
        const data = await TheaterModel.create({...req.body, image})
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
    const { name, address, province, district, ward, imageId } = req.body
    const image = imageId ? imageId : req.file.filename

    const existing = await TheaterModel.findOne({
        _id: { $ne: id },
        name: name,
        isDelete: false
    });
    if (!name || !image || !address || !province || !district || !ward ) {
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
        const data = await TheaterModel.findByIdAndUpdate(id, {name, address, province, district, ward, image}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteTheater = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await RoomModel.find({theater: id})
        await RoomModel.findOneAndUpdate({theater: id}, {isDelete: true})
        await Promise.all(existing.map(async item => 
            await SeatModel.findOneAndUpdate({room: item._id}, {isDelete: true}))
        )
        await TheaterModel.findByIdAndUpdate(id, {isDelete: true}, {new: true})
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

const listTheater = async (req, res) => {
    try {
        const data = await TheaterModel.find({isDelete: false, status: true});
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listProvince = async (req, res) => {
    try {
        const data = await TheaterModel.find({isDelete: false, status: true}, 'province');
        const newData = data.filter((item, index, self) => 
            index === self.findIndex((i) => i.province === item.province)
        );
        res.status(200).json(newData)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listTheaterByProvince = async (req, res) => {
    const {province} = req.query
    try {
        const data = await TheaterModel.find({isDelete: false, status: true, province});
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const lengthRoomByTheater = async (req, res) => {
    const {id} = req.params
    try {
        const data = await RoomModel.countDocuments({isDelete: false, theater: id});
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const lengthSeatByTheater = async (req, res) => {
    const {id} = req.params
    try {
        const data = await RoomModel.find({isDelete: false, theater: id});
        const seats = await Promise.all(data.map(async item => {
            const num = await SeatModel.countDocuments({isDelete: false, room: item._id});
            return num
        }))
        const length = seats.reduce((a, b) => a + b, 0)
        res.status(200).json(length)
    } catch (error) {
        console.log(error);
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
    allTheater,
    listTheater,
    listProvince,
    listTheaterByProvince,
    lengthRoomByTheater,
    lengthSeatByTheater
}
