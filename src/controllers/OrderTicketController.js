const OrderTicketModel = require("../models/OrderTicketModel")

const addOrderTicket = async (req, res) => {
    const {showTime, idOrder, seat, staff, price } = req.body
    
    try {
        let order
        if (!idOrder) {   
            order = 'CINE' + new Date().getTime()
        } else {
            order = idOrder
        }
        const data = await OrderTicketModel.create({showTime, idOrder: order, seat, staff, price})
        res.status(200).json(data)
    } catch (error) {
        console.log('ee', req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addOrderTicket
}