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
const excelJS = require('exceljs');
const fs = require('fs');
const moment = require('moment');

const updateUserPoints = async (user, price, type) => {
    const allOrderTicket = await OrderTicketModel.find({member: user._id, status: typePay[1]})
    const allOrderCombo = await OrderComboModel.find({member: user._id, status: typePay[1]})
    const allOrder = [...allOrderTicket, ...allOrderCombo]
    let pointMultiplier = type === 'combo' ? (user.level === 1 ? 0.03 : 0.04) : (user.level === 1 ? 0.05 : 0.07);
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
            updateUserPoints(user, price, 'ticket')
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

const constAllOrder = async (theater) => {
    try {
        
        const orderTicket = await OrderTicketModel.find({status: typePay[1]}).populate({
                path: 'showTime',
                populate: [{
                    path: 'schedule',
                    populate: {
                        path: 'film',
                        model: 'Film',
                        select: 'name'
                    }
                }, {
                    path: 'theater',
                    model: 'Theater',
                    select: 'name'
                }, {
                    path: 'room',
                    model: 'Room',
                    select: 'name'
                }]
            }).populate({
                path: 'seat',
                model: 'Seat',
                select: ['row', 'col']
            }).populate({
                path: 'member',
                model: 'User',
                // select: 'username'
            }).populate({
                path: 'staff',
                model: 'Staff',
                select: 'username'
            }).populate({
                path: 'combo.id',
                model: 'Combo', 
                select: 'name'
            }).populate({
                path: 'combo.id',
                model: 'Food',
                select: 'name'
            });
        const refund = await TicketRefundModel.find({})
        // console.log(orderTicket[0].seat);
        
        const data1 = orderTicket.filter(item => {
            return !refund.some(mini => mini.order.equals(item._id));
        });
        const data2 = await OrderComboModel.find({status: typePay[1]}).populate({
            path: 'member',
            model: 'User',
            // select: 'username'
        }).populate({
            path: 'staff',
            model: 'Staff',
            select: 'username'
        }).populate({
            path: 'combo.id',
            model: 'Combo',
            select: 'name'
        })
        .populate({
            path: 'combo.id',
            model: 'Food',
            select: 'name'
        }).populate({
            path: 'theater',
            model: 'Theater',
            select: 'name'
        });
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

        return finalData
        
    } catch (error) {
        console.log('ee0', error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allOrderTicket = async (req, res) => {
    const {theater, number, show} = req.query
    try {
        const finalData = await constAllOrder(theater)

        const start = (parseInt(number) - 1) * parseInt(show)
        const end = start + parseInt(show);
        const newAll = finalData.slice(start, end);
        const totalPages = Math.ceil(finalData.length / parseInt(show))
        
        res.status(200).json({
            data: newAll,
            sumPage: totalPages,
            length: finalData.length
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
        const allOrderTicket = await OrderTicketModel.find({member: id, status: typePay[1]})
        const allOrderCombo = await OrderComboModel.find({member: id, status: typePay[1]})
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
    const {number} = req.query
    try {
        const allOrderTicket = await OrderTicketModel.find({member: id, status: typePay[1]}).sort({createdAt: -1});
        const refund = await TicketRefundModel.find({user: id})
        
        const allFilter = allOrderTicket.filter(item => {
            return !refund.some(mini => mini.order.equals(item._id));
        });
        
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

        const start = (parseInt(number) - 1) * 5
        const end = start + 5;
        const newAll = data.slice(start, end);
        const totalPages = Math.ceil(data.length / 5)
        
        res.status(200).json({
            data: newAll,
            length: totalPages
        })
    } catch (error) {
        console.log('ee', error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const exportReport = async (req, res) => {
    const {theater} = req.query
    try {
        let wordBook = new excelJS.Workbook()

        const finalData = await constAllOrder(theater)
        const sheet = wordBook.addWorksheet("orders")
        sheet.rowCount
        sheet.columns = [
            {header: 'Mã vé', key: 'idOrder', width: 25},
            {header: 'Tên phim', key: 'film', width: 25},
            {header: 'Rạp chiếu', key: 'theater', width: 25},
            {header: 'Phòng chiếu', key: 'room', width: 25},
            {header: 'Ghế', key: 'seat', width: 25},
            {header: 'Suất chiếu', key: 'showTime', width: 25},
            {header: 'Combo', key: 'combo', width: 25},
            {header: 'Thành viên', key: 'member', width: 25},
            {header: 'Nhân viên', key: 'staff', width: 25},
            {header: 'Thời gian đặt vé', key: 'createdAt', width: 25},
            {header: 'Tổng', key: 'total', width: 25},
            {header: 'Mã khuyến mãi', key: 'discount', width: 25},
            {header: 'Điểm tích lũy', key: 'point', width: 25},
            {header: 'Tổng thanh toán', key: 'price', width: 25},
        ]
        sheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'FFD3D3D3' } 
            };
        });

        finalData.map((value, idx) => {
            let seatString = ''
            value.seat?.map((item, index) => 
                seatString += `${String.fromCharCode(64 + item.row)}${item.col}` + 
                `${index < value.seat?.length - 1 ? ', ' : ''}`
            )
            let comboString = ''
            value.combo.length > 0 ? value.combo.map((item, index) => 
                comboString += `${item.quantity} ${item.name}\n` +
                `${index < value.combo.length - 1 ? ', ' : ''}`
            ) : ''

            const point = value.usePoint && value.usePoint > 0 ? value.usePoint : 0
            const discount = value.discount && value.discount.useDiscount > 0 ? value.discount.useDiscount : 0
                
            sheet.addRow({
                idOrder: value.idOrder, 
                film: value.showTime?.schedule.film.name, 
                theater: value.showTime ? value.showTime.theater.name : value.theater.name, 
                room: value.showTime?.room.name,
                seat: seatString,
                showTime: value.showTime ? `${value.showTime.timeStart} - ${value.showTime.timeEnd} ${moment(value.showTime.date).format('DD-MM-YYYY')}` : '',
                combo: comboString,
                member: value.member?.username,
                staff: value.staff?.username,
                createdAt: moment(value.createdAt).format('HH:mm:ss DD-MM-YYYY'),
                total: value.price + point + discount,
                discount: discount > 0 ? discount : '',
                point: point > 0 ? point : '', 
                price: value.price
            })
        })

        res.setHeader(
            "Content-Type",
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "danh_sach_ve_da_hoan_tat.xlsx"
        );

        await wordBook.xlsx.write(res).then(() => res.end());
        // console.log(data);
        
        // res.status(200).json('ok')
    } catch (error) {
        console.log(error)
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
    allOrderByUser,
    exportReport
}