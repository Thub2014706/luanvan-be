const { typePay } = require("../constants")
const SeatModel = require("../models/SeatModel")
const OrderTicketModel = require("../models/OrderTicketModel")

const addOrderTicket = async (req, res) => {
    const {showTime, idOrder, seat, staff, price, paymentMethod } = req.body
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
        const data = await OrderTicketModel.create({showTime, idOrder: order, seat, staff, price, status})
        res.status(200).json(data)
    } catch (error) {
        console.log('ee')
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

module.exports = {
    addOrderTicket,
    detailOrderTicket,
    allOrderTicketSelled,
}