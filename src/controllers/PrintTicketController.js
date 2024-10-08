const { statusTicket } = require("../constants")
const OrderTicketModel = require("../models/OrderTicketModel")
const PrintTicketModel = require("../models/PrintTicketModel")
const ShowTimeModel = require("../models/ShowTimeModel")

const addPrintTicket = async (req, res) => {
    try {
        const data = await PrintTicketModel.create(req.body)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const testPrintTicket = async (req, res) => {
    const { id } = req.params

    try {        
        const existing = await PrintTicketModel.findOne({order: id})
        const ticket = await OrderTicketModel.findById(id)
        const showTime = await ShowTimeModel.findById(ticket.showTime)
        const now = new Date()
        // const date = now.setUTCHours(0,0,0,0)
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const [hoursStart, minutesStart] = showTime.timeStart.split(':').map(Number);
        console.log(hours, minutes, hoursStart, minutesStart);
        if (
            existing || 
            ticket.staff || 
            (new Date(showTime.date).setUTCHours(0,0,0,0) < now.setUTCHours(0,0,0,0)) || 
            (new Date(showTime.date).setUTCHours(0,0,0,0) === now.setUTCHours(0,0,0,0) && 
                (hours > hoursStart || (hours === hoursStart && minutes > minutesStart))
            )
        ) {
            return res.status(200).json({message: statusTicket[0]})
        } else {
            return res.status(200).json({message: statusTicket[1]})
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addPrintTicket,
    testPrintTicket
}