const FilmModel = require("../models/FilmModel")
const fs = require('fs');
const path = require('path');
const GenreModel = require("../models/GenreModel");
const ScheduleModel = require("../models/ScheduleModel");
const { typeSchedule, typePay } = require("../constants");
const { schedule } = require("node-cron");
const ShowTimeModel = require("../models/ShowTimeModel");
const TheaterModel = require("../models/TheaterModel");
const TicketRefundModel = require("../models/TicketRefundModel")
const OrderTicketModel = require("../models/OrderTicketModel")
const { log } = require("console");

const addFilm = async (req, res) => {
    const {name, time, nation, genre, director, releaseDate, endDate, age, performer, trailer, description} = req.body
    const image = req.file?.filename
    if (!name || !image || !time || !nation || !genre || !director || !releaseDate || !endDate || !age || !performer || !trailer || !description) {
        return res.status(400).json({
            message: "Yêu cầu nhập đầy đủ thông tin"
        })
    }
    if (new Date(endDate) < new Date(releaseDate)) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn ngày phát hành"
        })
    }

    try {
        const data = await FilmModel.create({...req.body, image: image})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const getImage = (req, res) => {
    try {
        const { name } = req.params
        const imgPath = path.join(__dirname, '../../uploads', name)
        const image = fs.readFileSync(imgPath)
        const encode = image.toString('base64');
        res.writeHead(200, { 'Content-Type': 'image/jpeg' }); // thiet lap phan hoi voi mine la image/jpeg
        res.end(Buffer.from(encode, 'base64')) // ket thuc phan hoi va gui image duoi dang nhi phann
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateFilm = async (req, res) => {
    const id = req.params.id
    const {name, time, nation, genre, director, releaseDate, endDate, age, performer, imageId, trailer, description} = req.body

    const image = imageId ? imageId : req.file.filename
    if (!name || !time || !nation || !genre || !director || !releaseDate || !endDate || !age || !performer || !image || !trailer || !description) {
        return res.status(400).json({
            message: "Yêu cầu nhập đầy đủ thông tin"
        })
    }
    if (new Date(endDate) < new Date(releaseDate)) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn ngày phát hành"
        })
    }
    try {
        const data = await FilmModel.findByIdAndUpdate(id, 
            {
                name, time, nation, 
                genre, director, releaseDate, 
                endDate, age, performer, 
                image, trailer, description
            }, 
            {new: true})
        res.status(200).json(data)
    } catch (error) {
        console.log('qqqq',error, image)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailFilm = async (req, res) => {
    const id = req.params.id
    try {
        const data = await FilmModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailFilmBySchedule = async (req, res) => {
    const id = req.params.id
    try {
        const schedule = await ScheduleModel.findById(id)
        const data = await FilmModel.findById(schedule.film)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}


const allFilm = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await FilmModel.find({}).sort({createdAt: -1})
        const searchAll = await Promise.all(
            all.map(async (item) => {
                const searchStrings = [item.name, item.nation];

                const matchesSearch = searchStrings.some(any => 
                    any
                    .toString()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .includes(
                        search
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .toLowerCase(),
                    )
                );
                return matchesSearch ? item : null
            })
        )
        const filteredResults = searchAll.filter(item => item !== null)
        const start = (parseInt(number) - 1) * parseInt(show)
        const end = start + parseInt(show);
        const newAll = filteredResults.slice(start, end);
        const totalPages = Math.ceil(filteredResults.length / parseInt(show))
        res.status(200).json({
            data: newAll,
            sumPage: totalPages,
            length: filteredResults.length
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const statusFilm = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await FilmModel.findById(id);
        const data = await FilmModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listFilm = async (req, res) => {
    try {
        const existing = await FilmModel.find({status: true});
        let data = []
        for (const item of existing) {
            const schedule = await ScheduleModel.find({film: item._id, isDelete: false});
            if (schedule.length > 0) {
                const hasType1 = schedule.some(item => item.type === typeSchedule[1] || item.type === typeSchedule[2]);
                if (!hasType1) {
                    data.push(item)
                }
            } else {
                data.push(item)
            }
        }
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listFilmBySchedule = async (req, res) => {
    const {type} = req.query
    try {
        const existing = await FilmModel.find({status: true});
        let data = []
        for (const item of existing) {
            const schedule = await ScheduleModel.find({film: item._id, isDelete: false});
            if (schedule.length > 0) {
                const hasType1 = schedule.some(item => item.type === type);
                if (hasType1) {
                    data.push(item)
                }
            }
        }
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listFilmByTheater = async (req, res) => {
    const {theater} = req.query
    try {
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
        const newData = filterData.filter((film, index, self) => 
            index === self.findIndex((f) => f._id.toString() === film._id.toString())
        );
    // console.log(newData)

        res.status(200).json(newData)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const searchFilm = async (req, res) => {
    const {search} = req.query
    try {
        
        const allFilm = await FilmModel.find({status: true})
        const allFilmSchedule = await Promise.all(allFilm.map(async item => {
            const test = await ScheduleModel.findOne({film: item._id, $or: [{type: typeSchedule[1]}, {type: typeSchedule[2]}]})
            return test ? item : null
        }))
        const filmFinal = allFilmSchedule.filter(item => item !== null)
        const allTheater = await TheaterModel.find({status: true, isDelete: false})
        const searchAllFilm = await Promise.all(
            filmFinal.map(async (item) => {
                const searchStrings = [item.name, item.description];

                const matchesSearch = searchStrings.some(any => 
                    any
                    .toString()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .includes(
                        search
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .toLowerCase(),
                    )
                );
                return matchesSearch ? item : null
            })
        )
        const allFilmResult = searchAllFilm.filter(item => item !== null)

        const searchAllTheater = await Promise.all(
            allTheater.map(async (item) => {
                const searchStrings = [item.name, item.address, item.province, item.district, item.ward];

                const matchesSearch = searchStrings.some(any => 
                    any
                    .toString()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .includes(
                        search
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .toLowerCase(),
                    )
                );
                return matchesSearch ? item : null
            })
        )
        const allTheaterResult = searchAllTheater.filter(item => item !== null)
        res.status(200).json({films: allFilmResult, theaters: allTheaterResult})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const filterFilm = async (req, res) => {
    const {genre, age, type} = req.query

    // console.log(genre, age);
    try {
        const existing = await FilmModel.find({status: true});
        let all = []
        for (const item of existing) {
            const schedule = await ScheduleModel.find({film: item._id, isDelete: false});
            if (schedule.length > 0) {
                const hasType1 = schedule.some(item => item.type === type);
                if (hasType1) {
                    all.push(item)
                }
            }
        }
        const setAll = await Promise.all(all.map(async item => {
            let bool = true
            if (genre) {
                const genrePar = JSON.parse(genre)
                // console.log(genrePar, item.genre);
                const isSubset = genrePar.every(element => item.genre.includes(element.toString()));
                bool = bool && isSubset
            }
            if (age) {
                bool = bool && item.age === age
            }
            return bool ? item : null

        }))
        const data = setAll.filter(item => item !== null)
        
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const numberTicketFilm = async (req, res) => {
    const {id} = req.params

    // console.log(genre, age);
    try {
        const refund =  await TicketRefundModel.find({})
        const schedules = await ScheduleModel.find({film: id})
        const showTimes = await ShowTimeModel.find({schedule: { $in: schedules.map(s => s._id) }})
        const orders = await OrderTicketModel.find({showTime: { $in: showTimes.map(s => s._id)}, status: typePay[1]})
        const filter = orders.filter(order => {
            return !refund.some(ref => ref.order.equals(order._id));
        });
        const numberTicket = filter.length

        res.status(200).json(numberTicket)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addFilm,
    getImage,
    updateFilm,
    detailFilm,
    allFilm,
    statusFilm,
    listFilm,
    listFilmBySchedule,
    listFilmByTheater,
    detailFilmBySchedule,
    searchFilm,
    filterFilm,
    numberTicketFilm
}