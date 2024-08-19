const { typeSeatEnum } = require("../constants")
const RoomModel = require("../models/RoomModel")
const SeatModel = require("../models/SeatModel")

const addRoom = async (req, res) => {
    const { name, numCol, numRow, type, theater } = req.body

    const existing = await RoomModel.findOne({ name: name, theater: theater, isDelete: false })
    if (!name || !numCol || !numRow || !type ) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên phòng chiếu đã tồn tại"
        })
    }
    try {
        const data = await RoomModel.create(req.body)
        
        const promises = [];
        for (let i = 1; i <= numRow; i++) {
            for (let j = 1; j <= numCol; j++) {
                promises.push(
                    SeatModel.create({ row: i, col: j, type: typeSeatEnum[0], room: data._id })
                );
            }
        }
        await Promise.all(promises);

        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateRoom = async (req, res) => {
    const id = req.params.id
    const { name, numCol, numRow, type, theater } = req.body

    const existing = await RoomModel.findOne({
        _id: { $ne: id },
        name: name,
        theater: theater
    });
    if (!name || !numCol || !numRow || !type ) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên phòng chiếu đã tồn tại"
        })
    }
    try {
        const data = await RoomModel.findByIdAndUpdate(id, req.body, { new: true })

        const promises = [];
        const seats = await SeatModel.find({room: id, $or: [{col: {$gt: numCol}}, {row: {$gt: numRow}}]})
        seats.map(async item => await SeatModel.findByIdAndDelete(item._id))
        for (let i = 1; i <= numRow; i++) {
            for (let j = 1; j <= numCol; j++) {
                if (!(await SeatModel.findOne({row: i, col: j, room: id}))) {
                    promises.push(
                        SeatModel.create({ row: i, col: j, type: typeSeatEnum[0], room: data._id })
                    );
                }
                // if (await SeatModel.find({row: i, col: j}))
            }
        }
        await Promise.all(promises);

        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteRoom = async (req, res) => {
    const id = req.params.id
    try {
        await RoomModel.findByIdAndUpdate(id, {isDelete: true})
        res.status(200).json({
            message: 'Xóa thành công'
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const statusRoom = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await RoomModel.findById(id);
        const data = await RoomModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailRoom = async (req, res) => {
    const id = req.params.id
    try {
        const data = await RoomModel.findById(id);
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

// const allRoom = async (req, res) => {
//     const {search, number, show} = req.query
//     try {
//         const all = await RoomModel.find({}).sort({createdAt: -1})
//         const searchAll = all.filter(item => 
//             [item.name, item.province, item.ward, item.district, item.address].some(any =>
//                 any
//                 .normalize('NFD')
//                 .replace(/[\u0300-\u036f]/g, '')
//                 .toLowerCase()
//                 .includes(
//                     search
//                         .normalize('NFD')
//                         .replace(/[\u0300-\u036f]/g, '')
//                         .toLowerCase(),
//                 ))
//             )
            
//         const start = (parseInt(number) - 1) * parseInt(show);
//         const end = start + parseInt(show);
//         const newAll = searchAll.slice(start, end);
//         const totalPages = Math.ceil(searchAll.length / parseInt(show))
//         res.status(200).json({
//             data: newAll,
//             sumPage: totalPages,
//             length: searchAll.length
//         })
//     } catch (error) {
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }

const allRoom = async (req, res) => {
    const {idCinema} = req.query
    try {
        const data = await RoomModel.find({theater: idCinema, isDelete: false}).sort({createdAt: -1})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addRoom,
    updateRoom,
    deleteRoom,
    statusRoom,
    detailRoom,
    allRoom,
    allRoom
}
