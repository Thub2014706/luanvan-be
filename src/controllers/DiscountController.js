const DiscountModel = require("../models/DiscountModel")
const OrderComboModel = require("../models/OrderComboModel")
const OrderTicketModel = require("../models/OrderTicketModel")

const addDiscount = async (req, res) => {
    const { name, code, percent, quantity, minium, level, startDate, endDate } = req.body

    const existing = await DiscountModel.findOne({ $or: [{ name: name }, {code: code}]})
    // console.log(req.body);
    
    if (!name || !code || !percent || !minium || level === undefined || !quantity || !startDate || !endDate) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên hoặc mã khuyến mãi đã tồn tại"
        })
    }

    if (endDate < startDate) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn ngày bắt đầu"
        })
    }

    if (new Date(startDate) < new Date().setUTCHours(0, 0, 0, 0)) {
        return res.status(400).json({
            message: "Ngày bắt đầu không thể sớm hơn hôm nay"
        });
    }
    
    if (new Date(endDate).getTime() < new Date().setUTCHours(0, 0, 0, 0)) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn hôm nay"
        });
    }
    
    try {
        const data = await DiscountModel.create(req.body)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allDiscount = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await DiscountModel.find({isDelete: false}).sort({createdAt: -1})
        const searchAll = all.filter(item => 
            [item.name, item.code, item.percent].some(any => 
                any
                .toString()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .includes(
                    search
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase(),
                ))
            )
        const start = (parseInt(number) - 1) * parseInt(show)
        const end = start + parseInt(show);
        const newAll = searchAll.slice(start, end);
        const totalPages = Math.ceil(searchAll.length / parseInt(show))
        res.status(200).json({
            data: newAll,
            sumPage: totalPages,
            length: searchAll.length
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateDiscount = async (req, res) => {
    const id = req.params.id
    const { name, code, percent, quantity, minium, level, startDate, endDate } = req.body

    const existing = await DiscountModel.findOne({$and: [{_id: { $ne: id }}, { $or: [{ name: name }, {code: code}]}]})
    if (!name || !code || !percent || !minium || !level || !quantity || !startDate || !endDate) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên hoặc mã khuyến mãi đã tồn tại"
        })
    }

    if (endDate < startDate) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn ngày bắt đầu"
        })
    }

    if (new Date(startDate) < new Date().setUTCHours(0, 0, 0, 0)) {
        return res.status(400).json({
            message: "Ngày bắt đầu không thể sớm hơn hôm nay"
        });
    }
    
    if (new Date(endDate).getTime() < new Date().setUTCHours(0, 0, 0, 0)) {
        return res.status(400).json({
            message: "Ngày kết thúc không thể sớm hơn hôm nay"
        });
    }

    try {
        const data = await DiscountModel.findByIdAndUpdate(id, req.body, {new: true})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailDiscount = async (req, res) => {
    const id = req.params.id
    try {
        const data = await DiscountModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const statusDiscount = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await DiscountModel.findById(id);
        const data = await DiscountModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteDiscount = async (req, res) => {
    const id = req.params.id
    try {
        // const data = await DiscountModel.findByIdAndUpdate(id, {isDelete: true})
        // res.status(200).json({
        //     message: 'Xóa thành công'
        // })
        const existingOrderCombo = await OrderComboModel.findOne({"discount.id": id})
        const existingOrderTicket = await OrderTicketModel.findOne({"discount.id": id })
        if (existingOrderCombo || existingOrderTicket) {
            res.status(400).json({
                message: 'Không thể xóa khuyến mãi vì ràng buộc khóa ngoại với các dữ liệu liên quan.'
            })
        } else {
            await DiscountModel.findByIdAndUpdate(id, {isDelete: true})
            res.status(200).json({
                message: 'Xóa thành công'
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listDiscount = async (req, res) => {
    try {
        const now = new Date().setUTCHours(0, 0, 0, 0)
        const data = await DiscountModel.find({isDelete: false, status: true, startDate: {$lte: now}, endDate: {$gte: now}})
        // const data = await DiscountModel.find({status: true, startDate: {$lte: now}, endDate: {$gte: now}})
        const bigData = data.map(item => {
            return item.quantity - item.used > 0 ? item : null
        })
        const filter = bigData.filter(item => item !== null)
        // console.log(filter);
        res.status(200).json(filter)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listDiscountFuture = async (req, res) => {
    try {
        const now = new Date().setUTCHours(0, 0, 0, 0)
        const data = await DiscountModel.find({isDelete: false, status: true, endDate: {$gte: now}})
        // const data = await DiscountModel.find({status: true, startDate: {$lte: now}, endDate: {$gte: now}})
        const bigData = data.map(item => {
            return item.quantity - item.used > 0 ? item : null
        })
        const filter = bigData.filter(item => item !== null)
        // console.log(filter);
        res.status(200).json(filter)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}


module.exports = {
    addDiscount,
    allDiscount,
    updateDiscount,
    detailDiscount,
    statusDiscount,
    deleteDiscount,
    listDiscount,
    listDiscountFuture
}
