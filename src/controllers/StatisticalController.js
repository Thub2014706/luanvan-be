const { typePay } = require("../constants")
const OrderComboModel = require("../models/OrderComboModel")
const OrderTicketModel = require("../models/OrderTicketModel")
const TicketRefundModel = require("../models/TicketRefundModel")

const dailyRevenue = async (req, res) => {
    try {
        const data1 = await OrderComboModel.find({status: typePay[1]})
        const refund = await TicketRefundModel.find()
        const allOrderTicket = await OrderTicketModel.find({status: typePay[1]})
        const data2 = allOrderTicket.filter(item => {
            return !refund.some(mini => mini.order.equals(item._id));
        });
        const data = [...data1, ...data2]
        let sum = 0
        data.map(item => {
            sum += item.price
        })
        res.status(200).json(sum)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

// const dailyRevenue = async (req, res) => {
//     try {
//         const data1 = await OrderComboModel.find({status: typePay[1]})
//         const refund = await TicketRefundModel.find()
//         const allOrderTicket = await OrderTicketModel.find({status: typePay[1]})
//         const data2 = allOrderTicket.filter(item => {
//             return !refund.some(mini => mini.order.equals(item._id));
//         });
//         const data = [...data1, ...data2]
//         let sum = 0
//         data.map(item => {
//             sum += item.price
//         })
//         res.status(200).json(sum)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }

module.exports = {
    dailyRevenue
}