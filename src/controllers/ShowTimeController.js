const moment = require("moment")
const { typeShowTime, typeSchedule } = require("../constants")
const FilmModel = require("../models/FilmModel")
const TheaterModel = require("../models/TheaterModel")
const ShowTimeModel = require("../models/ShowTimeModel")
const RoomModel = require("../models/RoomModel")

const addShowTime = async (req, res) => {
    const {theater, room, film, date, translate, timeStart, timeEnd} = req.body

    try {
        const filmFind = await FilmModel.findById(film)
        let type
        if (new Date(filmFind.releaseDate) > new Date().setUTCHours(0, 0, 0, 0)) {
            type = typeShowTime[0]
        } else {
            type = typeShowTime[1]
        }
        const data = await ShowTimeModel.create({...req.body, type, status: typeSchedule[2]})
        res.status(200).json(data)
    } catch (error) {
        console.log(error, filmFind)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

// const allShowTime = async (req, res) => {
//     const { theater, room, date } = req.query
//     try {
//         const all = await ShowTimeModel.find({isDelete: false, theater, room, date})

//         res.status(200).json(all)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }

// const allShowTime = async (req, res) => {
//     const { theater, room, date } = req.query
//     try {
//         const all = await ShowTimeModel.find({isDelete: false})
//         const array = all.map(item => {
//             let bool = true
//             if (theater) {               
//                 bool = bool && String(item.theater).trim() === theater
//             }
//             if (room) {
//                 bool = bool && String(item.room).trim() === room
//             }
//             if (date) {
//                 bool = bool && moment(item.date).format('YYYY-MM-DD') === date
//             }
//             return bool ? item : null
//         })
//         const data = array.filter(item => item !== null)
//         console.log(array )
//         res.status(200).json(data)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }

// const allShowTime = async (req, res) => {
//     const { theater, room, date } = req.query
//     let data
//     try {
//         if (theater) {
//             data = await fin
//         }
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }

const allShowTime = async (req, res) => {
    const { theater, room, date } = req.query
    try {
        let dataBig = []
        if (theater) {
            const theaterItem = await TheaterModel.findOne({ _id: theater, isDelete: false, status: true });
            if (room) {
                const roomItem = await RoomModel.findOne({_id: room._id, isDelete: false, status: true})
                const showTime = await ShowTimeModel.find({isDelete: false, theater, room: roomItem._id, date})
                dataBig.push({
                    room: roomItem,
                    shoeTime: showTime
                })
            } else {
                const rooms = await RoomModel.find({theater: theaterItem._id, isDelete: false, status: true})
                dataBig = await Promise.all(
                    rooms.map(async mini => {
                        const showTime = await ShowTimeModel.find({isDelete: false, theater, room: mini._id, date})
                        return {
                            room: mini,
                            showTime: showTime
                        }
                    })
                )
            }
        } else {
            const theaters = await TheaterModel.find({isDelete: false, status: true})
            dataBig = await Promise.all(
                theaters.map(async item => {
                    const rooms = await RoomModel.find({theater: item._id, isDelete: false, status: true})
                    const roomsData = await Promise.all(
                        rooms.map(async mini => {
                            const showTime = await ShowTimeModel.find({isDelete: false, theater, theater: item._id, room: mini._id, date})
                            return {
                                room: mini,
                                showTime: showTime
                            }
                        })
                    )
                })
            )
            return {
                theater: item,
                rooms: roomsData
            }
        }
        // const all = await ShowTimeModel.find({isDelete: false, theater, room, date})
        res.status(200).json(dataBig.flat())
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addShowTime,
    allShowTime
}