const OrderTicketModel = require("../models/OrderTicketModel")

const addOrderTicket = async (req, res) => {
    const {showTime, } = req.body
    
    try {
        const idOrder = 'CINE' + new Date().getTime()
        const data = await OrderTicketModel.create({...req.body, idOrder})
        res.status(200).json(data)
    } catch (error) {
        console.log('ee', error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addOrderTicket
}