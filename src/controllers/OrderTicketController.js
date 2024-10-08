const { typePay, signAge, standardAge } = require("../constants")
const SeatModel = require("../models/SeatModel")
const UserModel = require("../models/UserModel")
const OrderTicketModel = require("../models/OrderTicketModel")
const TheaterModel = require("../models/TheaterModel")
const ShowTimeModel = require("../models/ShowTimeModel")
const OrderComboModel = require("../models/OrderComboModel")
const ScheduleModel = require("../models/ScheduleModel")
const StaffModel = require('../models/StaffModel')
const RoomModel = require("../models/RoomModel")
const FilmModel = require("../models/FilmModel")
const DiscountModel = require("../models/DiscountModel")
const TicketRefundModel = require("../models/TicketRefundModel")

const updateUserPoints = async (user, price) => {
    const allOrderTicket = await OrderTicketModel.find({member: user._id, status: typePay[1]})
    const allOrderCombo = await OrderComboModel.find({member: user._id, status: typePay[1]})
    const allOrder = [...allOrderTicket, ...allOrderCombo]
    let pointMultiplier = user.level === 1 ? 0.05 : 0.07;
    const sumPoint = user.point + (pointMultiplier * price)
    let getPoint
    if (sumPoint % 1000 >= 1 && sumPoint % 1000 <= 499) {
        getPoint = sumPoint - sumPoint % 1000
    } else {
        getPoint = sumPoint + (1000 - sumPoint % 1000)
    }
    await UserModel.findByIdAndUpdate({_id: user._id}, {point: getPoint}, {new: true})

    let sum = 0
    allOrder.forEach(item => {
        sum += item.price
    })
    const listRefund = await TicketRefundModel.find({user: user._id})
    await Promise.all(listRefund.map(async item => {
        const order = await OrderTicketModel.findById(item.order)
        sum -= order.price
    }))
    if (user.level === 1 && sum + price >= 4000000) {
        await UserModel.findByIdAndUpdate({_id: user._id}, {level: 2}, {new: true})
    }
}

const addOrderTicket = async (req, res) => {
    const {showTime, idOrder, seat, staff, price, paymentMethod, member, combo, usePoint, discount } = req.body
    try {
        let order
        if (!idOrder) {   
            order = 'CINE' + new Date().getTime()
        } else {
            order = idOrder
        }
        let status
        if (paymentMethod === 'momo') {
            status = typePay[0]
        } else {
            status = typePay[1]
        }
        if (member.toString() !== '' && status === typePay[1]) {
            const user = await UserModel.findById(member)
            updateUserPoints(user, price)
            if (discount) {
                await DiscountModel.findByIdAndUpdate(discount.id, { $inc: { used: 1 } }, {new: true})
            }
        }
        const data = await OrderTicketModel.create({
            showTime, 
            idOrder: order, 
            seat, 
            staff, 
            price, 
            status, 
            ...(discount && {discount}),
            ...(member !== '' && { member, usePoint } ),
            ...(combo.length > 0 && { combo } ),
        })
        // console.log(discount);
        

        res.status(200).json(data)
    } catch (error) {
        console.log('ee', req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailOrderTicket = async (req, res) => {
    const {idOrder} = req.query
    try {
        const data = await OrderTicketModel.findOne({idOrder: idOrder})
        res.status(200).json(data)
    } catch (error) {
        console.log('ee')
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allOrderTicketSelled = async (req, res) => {
    const {showTime} = req.query
    try {
        const data = await OrderTicketModel.find({showTime, status: typePay[1]})
        const array = []
        data.map(item => item.seat.map(mini => array.push(mini)))
        // console.log(array)
        res.status(200).json(array)
    } catch (error) {
        console.log('ee', error, showTime)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allOrderTicket = async (req, res) => {
    const {theater, number, show} = req.query
    try {
        const data1 = await OrderTicketModel.find({status: typePay[1]})
        const data2 = await OrderComboModel.find({status: typePay[1]})
        const data = [...data1, ...data2].sort((a, b) => b.createdAt - a.createdAt)
        let getData
        if (theater) {
            getData = await Promise.all(data.map(async item => {
                const showtime = await ShowTimeModel.findById(item.showTime)
                // console.log('ee0', item.theater)
                if ((showtime && showtime.theater.toString() === theater.toString()) || item.theater?.toString() === theater.toString()) {
                    return item
                } else {
                    return null
                }
            }))
        } else {
            getData = data
        }

        const finalData = getData.filter(item => item !== null)

        const start = (parseInt(number) - 1) * parseInt(show)
        const end = start + parseInt(show);
        const newAll = finalData.slice(start, end);
        const totalPages = Math.ceil(finalData.length / parseInt(show))
        res.status(200).json({
            data: newAll,
            sumPage: totalPages,
            length: getData.length
        })
        
    } catch (error) {
        console.log('ee0', error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const sumPayByUser = async (req, res) => {
    const id = req.params.id
    try {
        const allOrderTicket = await OrderTicketModel.find({member: id})
        const allOrderCombo = await OrderComboModel.find({member: id})
        const allOrder = [...allOrderTicket, ...allOrderCombo]
        let sum = 0
        allOrder.forEach(item => {
            sum += item.price
        })
        res.status(200).json(sum)
    } catch (error) {
        console.log('ee', error, showTime)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allOrderByUser = async (req, res) => {
    const id = req.params.id
    try {
        const allOrderTicket = await OrderTicketModel.find({member: id}).sort({createdAt: -1});
        const refund = await TicketRefundModel.find({user: id})
        const orderRefund = refund.map(item => item.order)
        const allFilter = allOrderTicket.filter(item => !refund.find(mini => mini === item._id))
        const data = await Promise.all(allFilter.map(async item => {
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
        
        res.status(200).json(data)
    } catch (error) {
        console.log('ee', error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addOrderTicket,
    detailOrderTicket,
    allOrderTicketSelled,
    allOrderTicket,
    updateUserPoints,
    sumPayByUser,
    allOrderByUser
}