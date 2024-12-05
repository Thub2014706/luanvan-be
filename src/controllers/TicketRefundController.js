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
const excelJS = require('exceljs');
const moment = require('moment');

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
        if (result.length === 3) {
            return res.status(400).json({
                message: 'Bạn đã hoàn vé đủ 3 lần trong tháng này!'
            })
        }
    }
    const showTime = await ShowTimeModel.findById(orderDetail.showTime)
    const initialTime = momentTimezone.tz(showTime.timeStart, 'HH:mm', 'Asia/Ho_Chi_Minh');
    const newTime = initialTime.subtract(60, 'minutes');
    // const hours = now.getHours()
    // console.log(momentTimezone
    //     .tz(now, 'HH:mm', 'Asia/Ho_Chi_Minh')
    //     ,(momentTimezone.tz(newTime, 'HH:mm', 'Asia/Ho_Chi_Minh')));
    
    if (orderDetail.discount && orderDetail.discount.useDiscount) {
        return res.status(400).json({
            message: 'Vé này có sử dụng khuyến mãi!'
        })
    }

    
    
    // console.log(momentTimezone
    //     .tz(now, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh'), momentTimezone.tz(newTime, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh'));
    if ((now.setUTCHours(0, 0, 0, 0) === new Date(showTime.date).setUTCHours(0, 0, 0, 0) &&
        momentTimezone
        .tz(now, 'HH:mm', 'Asia/Ho_Chi_Minh')
        .isAfter(momentTimezone.tz(newTime, 'HH:mm', 'Asia/Ho_Chi_Minh')) || (
            now.setUTCHours(0, 0, 0, 0) > new Date(showTime.date).setUTCHours(0, 0, 0, 0)
        ))
    ) {
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
    console.log(id);
    

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

const constAllOrder = async (theater) => {
    try {
        const data = await TicketRefundModel.find({})
        .populate({
            path: 'order',
            populate: [{
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
            }, {
                path: 'seat',
                model: 'Seat',
                select: ['row', 'col']
            }, {
                path: 'member',
                model: 'User',
                // select: 'username'
            }, {
                path: 'combo.id',
                model: 'Combo', 
                select: 'name'
            }, {
                path: 'combo.id',
                model: 'Food',
                select: 'name'
            }]
        });

        let finalData
        if (theater) {
            finalData = data.filter(item => item.order.showTime.theater._id.toString() === theater)
        } else {
            finalData = data
        }

        return finalData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
    } catch (error) {
        console.log('ee0', error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allOrderTicketRefund = async (req, res) => {
    const {theater, number, show} = req.query
    // console.log(theater);
    
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

const exportReport = async (req, res) => {
    const {theater} = req.query
    try {
        let wordBook = new excelJS.Workbook()

        const finalData = await constAllOrder(theater)
        const sheet = wordBook.addWorksheet("orders")
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
            value.order.seat?.map((item, index) => 
                seatString += `${String.fromCharCode(64 + item.row)}${item.col}` + 
                `${index < value.seat?.length - 1 ? ', ' : ''}`
            )
            let comboString = ''
            value.order.combo.length > 0 ? value.order.combo.map((item, index) => 
                comboString += `${item.quantity} ${item.name}\n` +
                `${index < value.combo.length - 1 ? ', ' : ''}`
            ) : ''

            const point = value.order.usePoint && value.order.usePoint > 0 ? value.order.usePoint : 0
            const discount = value.order.discount && value.order.discount.useDiscount > 0 ? value.order.discount.useDiscount : 0
                
            sheet.addRow({
                idOrder: value.order.idOrder, 
                film: value.order.showTime?.schedule.film.name, 
                theater: value.order.showTime ? value.order.showTime.theater.name : value.order.theater.name, 
                room: value.order.showTime?.room.name,
                seat: seatString,
                showTime: value.order.showTime ? `${value.order.showTime.timeStart} - ${value.order.showTime.timeEnd} ${moment(value.order.showTime.date).format('DD-MM-YYYY')}` : '',
                combo: comboString,
                member: value.order.member?.username,
                staff: value.order.staff?.username,
                createdAt: moment(value.order.createdAt).format('HH:mm:ss DD-MM-YYYY'),
                total: value.order.price + point + discount,
                discount: discount > 0 ? discount : '',
                point: point > 0 ? point : '', 
                price: value.order.price
            })
        })

        res.setHeader(
            "Content-Type",
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "danh_sach_ve_da_hoan_tra.xlsx"
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
    addTicketRefund,
    allTicketRefund,
    ticketRefundByOrder,
    allOrderTicketRefund,
    exportReport
}