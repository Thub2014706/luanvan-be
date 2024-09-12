const FilmModel = require("../models/FilmModel")
const fs = require('fs');
const path = require('path');
const GenreModel = require("../models/GenreModel");
const ScheduleModel = require("../models/ScheduleModel");
const { typeSchedule } = require("../constants");
const { schedule } = require("node-cron");

const addFilm = async (req, res) => {
    const {name, time, nation, genre, director, releaseDate, endDate, age, performer, trailer, description} = req.body
    const image = req.file?.filename
    if (!name || !image || !time || !nation || !genre || !director || !releaseDate || !endDate || !age || !performer || !trailer || !description) {
        return res.status(400).json({
            message: "Yêu cầu nhập đầy đủ thông tin"
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
        res.end(Buffer.from(encode, 'base64')) // ket thuc phan hoi va gui image duoi dang nhi phan
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

const allFilm = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await FilmModel.find({}).sort({createdAt: -1})
        const searchAll = await Promise.all(
            all.map(async (item) => {
                // const genres = await Promise.all(item.genre.map(genre => GenreModel.findById(genre)))
                // , ...genres.map(genre => genre.name)
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

module.exports = {
    addFilm,
    getImage,
    updateFilm,
    detailFilm,
    allFilm,
    statusFilm,
    listFilm,
    listFilmBySchedule
}