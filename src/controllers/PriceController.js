const { timePrice, typeRoom, typeSurcharge } = require("../constants")
const PriceModel = require("../models/PriceModel")
const SurchargeModel = require("../models/SurchargeModel")
const RoomModel = require("../models/RoomModel")
const SeatModel = require("../models/SeatModel")

const addPrice = async (req, res) => {
    try {
        let data = []
        for (let i = 0; i < req.body.length; i++) {
            data.push(await PriceModel.findOneAndUpdate({
                typeUser: req.body[i].typeUser, 
                time: req.body[i].time}, 
                req.body[i], 
                {new: true, upsert: true}
            ))
        }
        console.log(data)
        res.status(200).json(data)
    } catch (error) {
        console.log(error, req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailPrice = async (req, res) => {
    const {typeUser, time} = req.query
    try {
        const data = await PriceModel.findOne({typeUser, time})
        res.status(200).json(data)
    } catch (error) {
        console.log(error, req.body)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailPriceByUser = async (req, res) => {
    const {typeUser, date, time, room, seat} = req.query
    try {
        const [hoursStart, minutesStart] = time.split(':').map(Number);
        const dateBuy = new Date(date)
        const day = dateBuy.getUTCDay()
        // console.log(hoursStart, day)
        
        let timeSelect
        if ([1, 2, 3, 4].includes(day) && hoursStart < 17) {
            timeSelect = timePrice[0]
        } else if ([1, 2, 3, 4].includes(day) && hoursStart >= 17) {
            timeSelect = timePrice[1]
        } else if ([0, 5, 6].includes(day) && hoursStart < 17) {
            timeSelect = timePrice[2]
        } else if ([0, 5, 6].includes(day) && hoursStart >= 17) {
            timeSelect = timePrice[3]
        }
        const data = await PriceModel.findOne({typeUser, time: timeSelect})
        let sum = data.price
        const roomInfo = await RoomModel.findById(room)
        if (Object.values(typeSurcharge).includes(roomInfo.type)) {
            const data = await SurchargeModel.findOne({type: roomInfo.type})
            sum += data.price
        }

        const seatInfo = await SeatModel.findById(seat)
        if (Object.values(typeSurcharge).includes(seatInfo.type)) {
            const data = await SurchargeModel.findOne({type: seatInfo.type})
            sum += data.price
        }

        // let priceSur
        // const roomInfo = await RoomModel.findById(room)
        // if (roomInfo.type === typeRoom[1]) {
        //     const sur = await SurchargeModel.findOne({type: typeRoom[1]})
        // }
        res.status(200).json(sum)
    } catch (error) {
        console.log(error, typeUser, room, seat)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addPrice,
    detailPrice,
    detailPriceByUser,
}