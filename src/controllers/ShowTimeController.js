const moment = require("moment-timezone")
const { typeShowTime, typeSchedule, typePay } = require("../constants")
const FilmModel = require("../models/FilmModel")
const TheaterModel = require("../models/TheaterModel")
const ShowTimeModel = require("../models/ShowTimeModel")
const RoomModel = require("../models/RoomModel")
const cron = require('node-cron');
const SeatModel = require("../models/SeatModel")
const OrderTicketModel = require("../models/OrderTicketModel")
const ScheduleModel = require("../models/ScheduleModel")


const addShowTime = async (req, res) => {
    const {theater, room, schedule, date, translate, timeStart, timeEnd} = req.body
    if (!date || !translate || !timeStart || !timeEnd) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin",
        })
    }

    const [hoursStart, minutesStart] = timeStart.split(':').map(Number);
    const [hoursEnd, minutesEnd] = timeEnd.split(':').map(Number);
    const now = new Date();
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (now.setUTCHours(0, 0, 0, 0) === new Date(date).getTime()) {
        if (hoursStart < hours || (hoursStart === hours && minutesStart < minutes)) {
            return res.status(400).json({
                message: "Đã quá thời gian đặt suất chiếu này",
            })
        }
    }

    const overlappingShowTime = await ShowTimeModel.findOne({
        theater,
        room,
        date,
        $or: [
            {
                timeStart: { $lte: timeStart },
                timeEnd: { $gte: timeStart }
            },
            {
                timeStart: { $lte: timeEnd },
                timeEnd: { $gte: timeEnd },
            },
        ],
    });

    // console.log(overlappingShowTime.timeEnd - timeStart)
    if (overlappingShowTime) {
        return res.status(400).json({
            message: "Lịch chiếu đã trùng với suất chiếu khác",
        });
    }


    try {
        const scheduleFind = await ScheduleModel.findById(schedule)
        const filmFind = await FilmModel.findById(scheduleFind.film)
        let type
        if (new Date(filmFind.releaseDate) > new Date(date).setUTCHours(0, 0, 0, 0)) {
            type = typeShowTime[0]
        } else {
            type = typeShowTime[1]
        }
        const data = await ShowTimeModel.create({...req.body, type, status: typeSchedule[2]})
        res.status(200).json(data)
    } catch (error) {
        console.log(error, req.body)
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

const detailShowTimeById = async (req, res) => {
    const id = req.params.id
    try {
        const data = await ShowTimeModel.findById(id)
        res.status(200).json(data)
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
                const showTime = await ShowTimeModel.find({isDelete: false, theater, room: roomItem._id, date}).sort({timeStart: 1})
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
                        const showTime = await ShowTimeModel.find({isDelete: false, theater, room: mini._id, date}).sort({timeStart: 1})
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
                            const showTime = await ShowTimeModel.find({isDelete: false, theater, theater: item._id, room: mini._id, date}).sort({timeStart: 1})
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
        // const now = new Date();
        // const hours = now.getHours();
        // const minutes = now.getMinutes();
        // const time = '21:30'
        // console.log(moment(time).format('HH:mm'))
        res.status(200).json(dataBig.flat())
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

cron.schedule(`0 0,5,10,15,20,25,30,35,40,45,50,55,59 0,1,2,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *`, async () => {
    try {
        const data1 = await ShowTimeModel.find({status: typeSchedule[2]})
        await Promise.all(data1.map(async item => {
            const [hoursStart, minutesStart] = item.timeStart.split(':').map(Number);
            const now = new Date();

            const hours = now.getHours();
            const minutes = now.getMinutes();
            if (item.date.setUTCHours(0, 0, 0, 0) < now.setUTCHours(0, 0, 0, 0)) {
                await ShowTimeModel.findByIdAndUpdate(item._id, {status: typeSchedule[0]}, {new: true})
            } else if (item.date.setUTCHours(0, 0, 0, 0) === now.setUTCHours(0, 0, 0, 0)) {
                if (hours >= hoursStart && minutes >= minutesStart) {
                    await ShowTimeModel.findByIdAndUpdate(item._id, {status: typeSchedule[1]}, {new: true})
                }   
            }
        }))
        const data2 = await ShowTimeModel.find({status: typeSchedule[1]})
        await Promise.all(data2.map(async item => {
            const [hoursEnd, minutesEnd] = item.timeEnd.split(':').map(Number);
            const now = new Date();

            const hours = now.getHours();
            const minutes = now.getMinutes();
            if (item.date.setUTCHours(0, 0, 0, 0) < now.setUTCHours(0, 0, 0, 0)) {
                await ShowTimeModel.findByIdAndUpdate(item._id, {status: typeSchedule[0]}, {new: true})
            } else if (item.date.setUTCHours(0, 0, 0, 0) === now.setUTCHours(0, 0, 0, 0)) {
                if (hours >= hoursEnd && minutes >= minutesEnd) {
                    await ShowTimeModel.findByIdAndUpdate(item._id, {status: typeSchedule[0]}, {new: true})
                }
            }
        }))    
        // console.log(data1, data2)  
    } catch (error) {
        console.log(error)
    }
})

const listShowTimeByDay = async (req, res) => {
    const { theater, date, schedule } = req.query
    try {
        const data = await ShowTimeModel.find({isDelete: false, theater, date, schedule}).sort({timeStart: 1, timeEnd: 1})
        res.status(200).json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listShowTimeByFilm = async (req, res) => {
    const { theater, date, film } = req.query
    try {
        const schedule = await ScheduleModel.findOne({film, $or: [{type: typeSchedule[1]}, {type: typeSchedule[2]}]})
        const data = await ShowTimeModel.find({isDelete: false, theater, date, schedule}).sort({timeStart: 1, timeEnd: 1})
        res.status(200).json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const soldOutSeat = async (req, res) => {
    const {showTime, room} = req.query
    try {
        const selled = await OrderTicketModel.findOne({showTime, status: typePay[1]})
        const seats = await SeatModel.find({room ,status: true, isDelete: false})
        // console.log(selled.seat.length, seats.length)
        if (selled?.seat.length === seats.length) {
            return res.status(200).json({message: 0})
        } else {
            return res.status(200).json({message: 1})
        }
    } catch (error) {
        console.log('ee', error, showTime)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const showTimeByTheater = async (req, res) => {
    const { theater, typeSchedule } = req.query
    try {
        const showTimes = await ShowTimeModel.find({isDelete: false, theater}).sort({timeStart: 1, timeEnd: 1})
        const data = await Promise.all(showTimes.map(async item => {
            const schedule = await ScheduleModel.findOne({type: typeSchedule})
            if (schedule) {
                return item
            }
        }))
        console.log(data)

        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listFilmByTheater = async (req, res) => {
    const { theater, date } = req.query;
    try {
        const showTimes = await ShowTimeModel.find({
            isDelete: false,
            theater,
            date
        })
        .populate('schedule')
        .sort({ timeStart: 1, timeEnd: 1 });

        const groupedByFilm = {};
        for (const item of showTimes) {
            const idFilm = item.schedule.film._id;

            if (!groupedByFilm[idFilm]) {
                const film = await FilmModel.findById(idFilm);
                groupedByFilm[idFilm] = {
                    film,
                    showTimes: []
                };
            }
            groupedByFilm[idFilm].showTimes.push(item);
        }

        const groupedFilmsArray = Object.values(groupedByFilm);
        console.log(groupedFilmsArray);

        res.status(200).json(groupedFilmsArray);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        });
    }
};

const listDateByFilm = async (req, res) => {
    const {film} = req.query
    try {
        const schedule = await ScheduleModel.findOne({film, $or: [{type: typeSchedule[1]}, {type: typeSchedule[2]}]})
        let allShowTime = []
        if (schedule) {
            allShowTime = await ShowTimeModel.find({isDelete: false, schedule})
        }
        res.status(200).json(allShowTime)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const showTimeFilter = async (req, res) => {
    const {theater, film, date} = req.query
    try {
        const theaters = await TheaterModel.find({status: true, isDelete: false})
        let films = []
        let dates = []
        let showTimes = []
        if (theater) {
            const allShowTime = await ShowTimeModel.find({isDelete: false, theater, status: typeSchedule[2], date: {$gte: new Date().setUTCHours(0, 0, 0, 0)}})
            const data = await Promise.all(allShowTime.map(async item => {
                const schedule = await ScheduleModel.findOne({_id: item.schedule, $or: [{type: typeSchedule[1]}, {type: typeSchedule[2]}]})
                if (schedule) {
                    const film = await FilmModel.findById(schedule.film)
                    return film;
                } else {
                    return null
                }     
            }))
            const filterData = data.filter(item => item !== null)
            films = filterData.filter((film, index, self) => 
                index === self.findIndex((f) => f._id.toString() === film._id.toString())
            );
            
            if (film) {
                const schedule = await ScheduleModel.findOne({film, $or: [{type: typeSchedule[1]}, {type: typeSchedule[2]}]})
                // let allShowTime = []
                if (schedule) {
                    const listDate = await ShowTimeModel.find({isDelete: false, schedule, theater, date: {$gte: new Date().setUTCHours(0, 0, 0, 0)}}, 'date -_id')
                    dates = listDate.filter((date, index, self) => 
                        index === self.findIndex((d) => new Date(d.date).getTime() === new Date(date.date).getTime())
                    );
                    
                    if (date) {
                        const listShow = await ShowTimeModel.find({isDelete: false, schedule, theater, date, status: typeSchedule[2]})
                        await Promise.all(listShow.map(async item => {
                            const selled = await OrderTicketModel.findOne({showTime: item._id, status: typePay[1]})
                            const seats = await SeatModel.find({room: item.room, status: true, isDelete: false})

                            // test thoi gian truoc 20p
                            const currentDate = new Date();
                            const minutes = currentDate.getMinutes();
                            const hours = currentDate.getHours();
                            const initialTime = moment.tz(item.timeStart, 'HH:mm', 'Asia/Ho_Chi_Minh');
                            const newTime = initialTime.subtract(20, 'minutes');
                            // console.log(newTime.hours())
                            if (selled?.seat.length !== seats.length &&
                                (new Date(item.date) > currentDate.setUTCHours(0, 0, 0, 0) ||
                                    (hours === newTime.hours() && minutes < newTime.minutes()) || 
                                    (hours < newTime.hours())
                                )
                            ) {
                                showTimes.push(item)
                            }
                        }))
                    }
                }

            }
        }
        res.status(200).json({theaters, films, dates, showTimes})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addShowTime,
    allShowTime,
    detailShowTimeByRoom,
    listShowTimeByDay,
    detailShowTimeById,
    soldOutSeat,
    showTimeByTheater,
    listFilmByTheater,
    listDateByFilm,
    showTimeFilter,
    listShowTimeByFilm
}