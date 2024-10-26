const { isEmpty } = require("validator")
const CommentModel = require("../models/CommentModel")
const momentTimezone = require("moment-timezone")
const OrderTicketModel = require("../models/OrderTicketModel")
const { typePay } = require("../constants")
const moment = require('moment');

const addComment = async (req, res) => {
    const { user, film } = req.body

    const orders = await OrderTicketModel
        .find({member: user, status: typePay[1]})
        .populate({
            path: 'showTime',
            populate: {
                path: 'schedule',
                populate: {
                    path: 'film',
                    model: 'Film'
                }
            }
        })
    
    const flag = orders.some(order => order.showTime.schedule.film._id.toString() === film);    
    
    if (!flag) {
        return res.status(400).json({
            message: "Bạn cần mua vé xem phim này mới có thể tham gia đánh giá.",
        })
    }
    
    const comment = await CommentModel.findOne({user, film})
    if (comment) {
        return res.status(400).json({
            message: "Bạn đã gửi đánh giá cho phim này trước đó.",
        })
    }

    // const test = orders.some(order => {
    //     console.log(momentTimezone
    //         .tz(order.showTime.timeStart, 'HH:mm YYYY-MM-DD', 'Asia/Ho_Chi_Minh'), momentTimezone.tz(new Date(), 'HH:mm YYYY-MM-DD', 'Asia/Ho_Chi_Minh'));
        
    //     return momentTimezone
    //         .tz(order.showTime.timeStart, 'HH:mm YYYY-MM-DD', 'Asia/Ho_Chi_Minh')
    //         .isBefore(momentTimezone.tz(new Date(), 'HH:mm  YYYY-MM-DD', 'Asia/Ho_Chi_Minh'))
    // })

    const order = orders.filter(order => order.showTime.schedule.film._id.toString() === film)
        .sort((a, b) => new Date(a.showTime.date).getTime() - new Date(b.showTime.date).getTime());    
    // console.log(order);
    
    const dateShowTime = moment(order[0].showTime.date).format('YYYY-MM-DD')
    // console.log(order[0].showTime.date,momentTimezone
    //             .tz(`${dateShowTime} ${order[0].showTime.timeStart}`, 'Asia/Ho_Chi_Minh'), momentTimezone.tz(new Date(), 'Asia/Ho_Chi_Minh'));
    const test = momentTimezone
        .tz(`${dateShowTime} ${order[0].showTime.timeStart}`, 'Asia/Ho_Chi_Minh')
        .isAfter(momentTimezone.tz(new Date(), 'Asia/Ho_Chi_Minh'))

    if (test) {
        return res.status(400).json({
            message: "Vé của bạn hiện vẫn chưa đến giờ suất chiếu của phim này.",
        })
    }
    try {
        
        const data = await CommentModel.create(req.body)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allCombo = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await ComboModel.find({}).sort({createdAt: -1})

        const searchAll = await Promise.all(
            all.map(async (item) => {
                const foods = await Promise.all(item.variants.map(variant => FoodModel.findById(variant.food)));
                const searchStrings = [item.name, ...foods.map(food => food.name)];

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
                            .toLowerCase()
                    )
                );
                
                return matchesSearch ? item : null;
            })
        );
        const filteredResults = searchAll.filter(item => item !== null);
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

const detailComment = async (req, res) => {
    const id = req.params.id
    try {
        const data = await CommentModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listCommentByFilm = async (req, res) => {
    const id = req.params.id

    try {
        const data = await CommentModel.find({film: id}).populate({path: 'user', model: 'User'}).sort({createdAt: -1});
        
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const avgComment = async (req, res) => {
    const id = req.params.id

    try {
        const data = await CommentModel.find({film: id});
        let sum = 0
        let index = 0
        for (const item of data) {
            sum += item.star
            index += 1
        }
        
        res.status(200).json(parseFloat((sum/index).toFixed(1)))
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addComment,
    detailComment,
    listCommentByFilm,
    avgComment
}
