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

const addOrderTicket = async (req, res) => {
    const {showTime, idOrder, seat, staff, price, paymentMethod, member, combo, usePoint } = req.body
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
        if (member !== '') {
            const user = await UserModel.findById(member)
            const allOrderTicket = await OrderTicketModel.find({member: member})
            const allOrderCombo = await OrderComboModel.find({member: member})
            const allOrder = [...allOrderTicket, ...allOrderCombo]
            if (user.level === 1) {
                const sumPoint = user.point + (0.05 * price)
                let getPoint
                if (sumPoint % 1000 >= 1 && sumPoint % 1000 <=499) {
                    getPoint = sumPoint - sumPoint % 1000
                } else {
                    getPoint = sumPoint + (1000 - sumPoint % 1000)
                }
                await UserModel.findByIdAndUpdate({_id: member}, {point: getPoint}, {new: true})
            } else {
                const sumPoint = user.point + (0.07 * price)
                let getPoint
                if (sumPoint % 1000 >= 1 && sumPoint % 1000 <=499) {
                    getPoint = sumPoint - sumPoint % 1000
                } else {
                    getPoint = sumPoint + (1000 - sumPoint % 1000)
                }
                await UserModel.findByIdAndUpdate({_id: member}, {point: getPoint}, {new: true})
            }

            let sum = 0
            allOrder.forEach(item => {
                sum += item.price
            })
            // console.log('ee', sum)
            if (user.level === 1 && sum + price >= 4000000) {
                await UserModel.findByIdAndUpdate({_id: member}, {level: 2}, {new: true})
            }
            await UserModel.findByIdAndUpdate({_id: member}, {point: user.point - usePoint}, {new: true})
        }
        const data = await OrderTicketModel.create({
            showTime, 
            idOrder: order, 
            seat, 
            staff, 
            price, 
            status, 
            ...(member !== '' && { member, usePoint } ),
            ...(combo.length > 0 && { combo } ),
        })

        
        // if (data && member !== '') {
        //     const detailUser = await UserModel.findById(member)
        //     const showTimeDetail = await ShowTimeModel.findById(showTime)
        //     const theater = await TheaterModel.findById(showTimeDetail.theater)
        //     const schedule = await ScheduleModel.findById(showTimeDetail.schedule)
        //     const film = await FilmModel.findById(schedule.film)
        //     const sign = signAge[standardAge.findIndex(item => item === film.age)]
        //     const roomDetail = await RoomModel.findById(showTimeDetail.room)
        //     // const staffDetail = await StaffModel.findById(staff)
        //     const seat0 = await SeatModel.findById(seat[0])
        //     let seatsHTML = '';
        //     if (seat && seat.length > 0) {
        //         seatsHTML = await Promise.all(seat.map(async item => {
        //             const seatDetail = await SeatModel.findById(item)
        //             return String.fromCharCode(64 + seatDetail.row) + seatDetail.col;
        //         }).join(', '));
        //     }

        //     await transporter.sendMail({
        //         from: `"CINETHU" <${process.env.EMAIL_ACCOUNT}>`, // sender address
        //         to: `${detailUser.email}`, // list of receivers
        //         subject: "Vé xem phim tại CINETHU", // Subject line
        //         text: `Xin chào ${detailUser.username},
        //         Đây là thông tin vé xem phim của bạn. Vui lòng kiểm tra và đưa vé này cho nhân viên soát vé để được vào rạp nhé!`, // plain text body
        //         html: `<p>Xin chào ${detailUser.username},</p>
        //         <br />
        //         Đây là thông tin vé xem phim của bạn. Vui lòng kiểm tra và đưa vé này cho nhân viên soát vé để được vào rạp nhé!
        //         <br />
        //         <div>
        //             <h4 style="text-align: center;">
        //                 THE VAO
        //                 <br /> PHONG CHIEU PHIM
        //             </h4>
        //             <div>
        //                 <p>${theater.name}</p>
        //                 <p>
        //                     ${theater.address}, ${theater.ward}, ${theater.district}, ${theater.province}
        //                 </p>
        //                 // <p>Nhan vien: ${staff.username}</p>
        //                 <p>==========================================</p>
        //                 <p>
        //                     <span>${film.name}</span>
        //                     <span>[${sign}]</span>
        //                 </p>
        //                 <p>
        //                     <span>${moment(showTimeDetail.date).format('DD/MM/YYYY')}</span>
        //                     <span style="margin-left: 10px;">
        //                         ${showTimeDetail.timeStart} - ${showTimeDetail.timeEnd}
        //                     </span>
        //                 </p>
        //                 <p>
        //                     <span style="margin-right: 3rem; font-weight: bold;">${roomDetail.name}</span>
        //                     <span style="font-weight: bold;">
        //                         ${seatsHTML}
        //                     </span>
        //                     <span style="margin-left: 3rem;">${seat0.type}</span>
        //                 </p>
        //                 <p>------------------------------------------</p>
        //                 // <p>
        //                 //     Combo:
        //                 //     {combo.map((item) => (
        //                 //         <p className="text-end fw-bold">
        //                 //             <span className="ms-5">{item.data.name}</span>
        //                 //             <span className="ms-5">x {item.quantity}</span>
        //                 //         </p>
        //                 //     ))}
        //                 // </p>
        //                 <p>==========================================</p>
        //                 <p style="text-align: right; font-weight: bold; font-size: 1.25rem;">
        //                     <span style="margin-right: 3rem;">Tong</span>
        //                     <span style="margin-right: 3rem;">VND</span>
        //                     <span>${order.price.toLocaleString('it-IT')}</span>
        //                 </p>
        //                 <div style="display: flex; justify-content: center;">
        //                     <!-- Barcode sẽ cần thư viện JavaScript để tạo, vì vậy bạn cần thêm mã JavaScript để render Barcode -->
        //                     <img src="path/to/barcode/generator?value=${order.idOrder}&height=50&width=1&fontSize=10&fontOptions=Courier%20New%2C%20monospace" alt="Barcode" />
        //                 </div>
        //             </div>
        //         </div>
        //         <br />
        //         Chân thành cảm ơn quý khách!
        //         <br />`, // html body
        //       });
        // }
        
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
        const data1 = await OrderTicketModel.find({}).sort({createdAt: -1})
        const data2 = await OrderComboModel.find({}).sort({createdAt: -1})
        const data = [...data1, ...data2]
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

module.exports = {
    addOrderTicket,
    detailOrderTicket,
    allOrderTicketSelled,
    allOrderTicket
}