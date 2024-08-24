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
        if (new Date(filmFind.releaseDate) > new Date(date).setUTCHours(0, 0, 0, 0)) {
            type = typeShowTime[0]
        } else {
            type = typeShowTime[1]
        }
        const data = await ShowTimeModel.create({...req.body, type, status: typeSchedule[2]})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailShowTimeByRoom = async (req, res) => {
    const { theater, room, date } = req.query
    try {
        const data = await ShowTimeModel.find({isDelete: false, theater, room, date})
        let big = [] 
        data.map(item => {
            big.push({
                timeStart: item.timeStart,
                timeEnd: item.timeEnd
            }) 
        })
        res.status(200).json(big)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allShowTime = async (req, res) => {
    const { theater, room, date } = req.query
    try {
        let dataBig = []
        if (theater) {
            const theaterItem = await TheaterModel.findOne({ _id: theater, isDelete: false, status: true });
            if (room) {
                const roomItem = await RoomModel.findOne({_id: room, isDelete: false, status: true})
                const showTime = await ShowTimeModel.find({isDelete: false, theater, room: roomItem._id, date})
                dataBig.push({
                    theater: theaterItem,
                    rooms: [{
                        room: roomItem,
                        showTimes: showTime
                    }]
                })
            } else {
                const rooms = await RoomModel.find({theater: theaterItem._id, isDelete: false, status: true})
                let data = await Promise.all(
                    rooms.map(async mini => {
                        const showTime = await ShowTimeModel.find({isDelete: false, theater, room: mini._id, date})
                        return ({
                            room: mini,
                            showTimes: showTime
                        })
                    })
                )
                dataBig.push({
                    theater: theaterItem,
                    rooms: data
                })
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
                                showTimes: showTime
                            }
                        })
                    )
                    return {
                        theater: item,
                        rooms: roomsData
                    }
                })
            )
        }
        res.status(200).json(dataBig.flat())
    } catch (error) {
        console.log(error, theater, room)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addShowTime,
    allShowTime,
    detailShowTimeByRoom
}