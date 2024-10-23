const { statusTicket } = require("../constants")
const OrderTicketModel = require("../models/OrderTicketModel")
const PrintTicketModel = require("../models/PrintTicketModel")
const ShowTimeModel = require("../models/ShowTimeModel")
const momentTimezone = require("moment-timezone")
const TicketRefundModel = require("../models/TicketRefundModel")
const UserModel = require("../models/UserModel")
const ScheduleModel = require("../models/ScheduleModel")
const FilmModel = require("../models/FilmModel")
const TheaterModel = require("../models/TheaterModel")
const SeatModel = require("../models/SeatModel")
const RoomModel = require("../models/RoomModel")

const addTicketRefund = async (req, res) => {
    const { order, user } = req.body
    const orderDetail = await OrderTicketModel.findById(order)
    const userDetail = await UserModel.findById(user)
    const now = new Date()
    const month = now.getMonth()
    // console.log(user);
    const refundByUser = await TicketRefundModel.find({user})
    const result = refundByUser.filter(item => {
        return new Date(item.createdAt).getMonth() === month
    })
    if (userDetail.level === 1) {
        if (result.length === 2) {
            return res.status(400).json({
                message: 'Bạn đã hoàn vé đủ 2 lần trong tháng này!'
            })
        }
    } else {
        if (result.length === 5) {
            return res.status(400).json({
                message: 'Bạn đã hoàn vé đủ 5 lần trong tháng này!'
            })
        }
    }
    const showTime = await ShowTimeModel.findById(orderDetail.showTime)
    const initialTime = momentTimezone.tz(showTime.timeStart, 'HH:mm', 'Asia/Ho_Chi_Minh');
    const newTime = initialTime.subtract(60, 'minutes');
    const hours = now.getHours()

    if (orderDetail.discount && orderDetail.discount.useDiscount) {
        return res.status(400).json({
            message: 'Vé này có sử dụng khuyến mãi!'
        })
    }
    
    if (new Date(showTime.date).setUTCHours(0, 0, 0, 0) === now.setUTCHours(0, 0, 0, 0) && hours >= newTime.hours()) {
        return res.status(400).json({
            message: 'Đã quá thời gian hoàn vé!'
        })
    }


    const print = await PrintTicketModel.findOne({order})
    if (print || orderDetail.staff) {
        return res.status(400).json({
            message: 'Vé này đã được in dưới dạng vé giấy tại rạp!'
        })
    }
    try {
        const data = await TicketRefundModel.create(req.body)
        if (data) {
            
            await UserModel.findByIdAndUpdate(user, {point: userDetail.point + orderDetail.price + orderDetail.usePoint})
        }
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allTicketRefund = async (req, res) => {
    const { id } = req.params
    const {number} = req.query

    try {        
        const listRefund = await TicketRefundModel.find({user: id})
        const allOrderTicket = await Promise.all(listRefund.map(async item => {
            return await OrderTicketModel.findById(item.order)
        }));
        const data = await Promise.all(allOrderTicket.map(async item => {
            let showTime 
            let film
            let seats
            let room
            let theater
            showTime = await ShowTimeModel.findById(item.showTime)
            const schedule = await ScheduleModel.findById(showTime.schedule)
            film = await FilmModel.findById(schedule.film)
            const theaterInfo = await TheaterModel.findById(showTime.theater)
            theater = theaterInfo.name
            seats = await Promise.all(item.seat.map(async mini => {
                return await SeatModel.findById(mini)
            }))
            room = await RoomModel.findById(showTime.room)

            return {item, showTime, film, seats, room, theater}

        }))

        
        const start = (parseInt(number) - 1) * 5
        const end = start + 5;
        const newAll = data.slice(start, end);
        const totalPages = Math.ceil(data.length / 5)
        
        res.status(200).json({
            data: newAll,
            length: totalPages
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const ticketRefundByOrder = async (req, res) => {
    const { id } = req.params

    try {        
        const data = await TicketRefundModel.findOne({order: id})
        res.status(200).json(data)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addTicketRefund,
    allTicketRefund,
    ticketRefundByOrder
}