const { typeSchedule } = require("../constants")
const FilmModel = require("../models/FilmModel")
const ScheduleModel = require("../models/ScheduleModel")
// const cron = require('node-cron');

// cron.schedule( *, () => {
//     console.log('Đến ngày cập nhật dữ liệu!');
// });

const addSchedule = async (req, res) => {
    const { film, startDate, endDate } = req.body
    if (endDate < startDate) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn ngày bắt đầu"
        })
    }

    if (new Date(startDate) < new Date().setHours(0, 0, 0, 0)) {
        return res.status(400).json({
            message: "Ngày bắt đầu không thể sớm hơn hôm nay"
        });
    }
    
    if (new Date(endDate).getTime() < new Date().setHours(0, 0, 0, 0)) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn hôm nay"
        });
    }
    
    try {
        let type
        if (new Date(startDate).getTime() > new Date().setHours(0, 0, 0, 0)) {
            type = typeSchedule[2]
        }
        if (
            new Date(startDate).getTime() <= new Date().setHours(0, 0, 0, 0) 
            && new Date(endStart).getTime() >= new Date().setHours(0, 0, 0, 0)
        ) {
            type = typeSchedule[1]
        }
        const data = await ScheduleModel.create({...req.body, type})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateSchedule = async (req, res) => {
    // const { film, startDate, endDate } = req.body
    const id = req.params.id

    if (endDate < startDate) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn ngày bắt đầu"
        })
    }

    if (endDate < Date.now() || startDate < Date.now()) {
        return res.status(400).json({
            message: "Lịch chiếu khổng thể sớm hơn hôm nay"
        })
    }

    try {
        const data = await ScheduleModel.findByIdAndUpdate(id, req.body, {new: true})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allSchedule = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await ScheduleModel.find({isDelete: false}).sort({createdAt: -1})
        const searchAll = await Promise.all(
            all.map(async (item) => {
                const films = await FilmModel.findById(item.film)
                // , ...genres.map(genre => genre.name)
                const searchStrings = [films];

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
        const start = (parseInt(number) - 1) * parseInt(show);
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

const detailSchedule = async (req, res) => {
    const id = req.params.id
    try {
        const data = await ScheduleModel.findById(id);
        res.status(200).json(data)
    } catch (error) {
        console.log(id)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addSchedule,
    updateSchedule,
    allSchedule,
    detailSchedule
}