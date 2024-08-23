const { typeSchedule } = require("../constants")
const FilmModel = require("../models/FilmModel")
const ScheduleModel = require("../models/ScheduleModel")
const cron = require('node-cron');

const addSchedule = async (req, res) => {
    const { film, startDate, endDate } = req.body
    console.log(new Date(endDate).getTime(), new Date().setUTCHours(0, 0, 0, 0))
    if (endDate < startDate) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn ngày bắt đầu"
        })
    }

    if (new Date(startDate) < new Date().setUTCHours(0, 0, 0, 0)) {
        return res.status(400).json({
            message: "Ngày bắt đầu không thể sớm hơn hôm nay"
        });
    }
    
    if (new Date(endDate).getTime() < new Date().setUTCHours(0, 0, 0, 0)) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn hôm nay"
        });
    }
    
    try {
        let type
        if (new Date(startDate).getTime() > new Date().setUTCHours(0, 0, 0, 0)) {
            type = typeSchedule[2]
        }
        if (
            new Date(startDate).getTime() <= new Date().setUTCHours(0, 0, 0, 0) 
            && new Date(endDate).getTime() >= new Date().setUTCHours(0, 0, 0, 0)
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

const listSchedule = async (req, res) => {
    try {
        const schedules = await ScheduleModel.find({$or: [{type: typeSchedule[1]} , {type: typeSchedule[2]}]})
        // const data
        const data = await Promise.all(schedules.map(async item => {
            const film = await FilmModel.findById(item.film)
            return {
                schedule: item,
                nameFilm: film.name
            }
        }))
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

// const deleteSchedule = async (req, res) => {
//     const id = req.params.id
//     try {
//         const existing = await ScheduleModel.findById(id)
//         if (existing.role === 0) {
//             res.status(400).json({
//                 message: 'Không thể xóa người dùng Admin'
//             })
//         } else {
//             await StaffModel.findByIdAndUpdate({_id: id}, {isDelete: true}, {new: true})
//             res.status(200).json({
//                 message: 'Xóa thành công'
//             })
//         }
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }

cron.schedule(`0 0 0 * * *`, async () => {
    try {
        const data1 = await ScheduleModel.find({type: typeSchedule[2]})
        await Promise.all(data1.map(async item => {
            if (item.startDate.setUTCHours(0, 0, 0, 0) === new Date().setUTCHours(0, 0, 0, 0)) {
                await ScheduleModel.findByIdAndUpdate(item._id, {type: typeSchedule[1]}, {new: true})
            }
        }))
        const data2 = await ScheduleModel.find({type: typeSchedule[1]})
        await Promise.all(data2.map(async item => {
            if (item.endDate.setUTCHours(0, 0, 0, 0) > new Date().setUTCHours(0, 0, 0, 0)) {
                await ScheduleModel.findByIdAndUpdate(item._id, {type: typeSchedule[0]}, {new: true})
            }
        }))    
        console.log(data1, data2)  
    } catch (error) {
        console.log(error)
    }
})

module.exports = {
    addSchedule,
    updateSchedule,
    allSchedule,
    detailSchedule,
    listSchedule
}