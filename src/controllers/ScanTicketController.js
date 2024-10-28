const { statusTicket } = require("../constants")
const OrderTicketModel = require("../models/OrderTicketModel")
const ScanTicketModel = require("../models/ScanTicketModel")
const ShowTimeModel = require("../models/ShowTimeModel")
const OrderComboModel = require("../models/OrderComboModel")

const addScanTicket = async (req, res) => {
    try {
        const data = await ScanTicketModel.create(req.body)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const testScanTicket = async (req, res) => {
    const { id } = req.params

    try {        
        const existing = await ScanTicketModel.findOne({order: id})
        const ticket = await OrderTicketModel.findById(id)
        // console.log(ticket);
        
        if (ticket) {
            const showTime = await ShowTimeModel.findById(ticket.showTime)
            const now = new Date()
            // const date = now.setUTCHours(0,0,0,0)
            const hours = now.getHours()
            const minutes = now.getMinutes()
            const [hoursEnd, minutesEnd] = showTime.timeEnd.split(':').map(Number);
            if (
                existing || 
                (new Date(showTime.date).setUTCHours(0,0,0,0) < now.setUTCHours(0,0,0,0)) || 
                (new Date(showTime.date).setUTCHours(0,0,0,0) === now.setUTCHours(0,0,0,0) && 
                    (hours > hoursEnd || (hours === hoursEnd && minutes > minutesEnd))
                )
            ) {
                return res.status(200).json({message: statusTicket[0]})
            } else {
                return res.status(200).json({message: statusTicket[1]})
            }
        } else {
            if (existing) {
                return res.status(200).json({message: statusTicket[0]})
            } else {
                return res.status(200).json({message: statusTicket[1]})
            }
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addScanTicket,
    testScanTicket
}