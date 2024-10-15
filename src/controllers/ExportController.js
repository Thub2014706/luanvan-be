const excelJS = require('exceljs');
const fs = require('fs');
const OrderTicketModel = require("../models/OrderTicketModel")

const exportReport = async (req, res) => {
    
    try {
        let wordBook = new excelJS.Workbook()
        const sheet = wordBook.addWorksheet("books")
        sheet.columns = [
            {header: 'Mã vé', key: 'idOrder', width: 25},
            {header: 'Tên phim', key: 'film', width: 25},
            {header: 'Rạp chiếu', key: 'theater', width: 25},
            {header: 'Phòng chiếu', key: 'room', width: 25},
            {header: 'Ghế', key: 'seat', width: 25},
        ]

        let object = JSON.parse(fs.readFileSync(data.json, 'utf8'))
        let orders = await OrderTicketModel.find({}).populate({
            path: 'showTime',
            populate: [{
                path: 'schedule',
                populate: {
                    path: 'film',
                    model: 'Film'
                }
            }, {
                path: 'theater',
                model: 'Theater'
            }, {
                path: 'room',
                model: 'Room'
            }]
        })

        orders.map((value, idx) => {
            sheet.addRow({
                idOrder: value.idOrder, 
                film: value.showTime.schedule.film.name, 
                theater: value.showTime.theater.name, 
                room: value.showTime.room.row
            })
        })

        res.setHeader(
            "Content-Type",
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename=" + "danh_sach_ve.xlsx"
        );

        wordBook.xlsx.write(res)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}