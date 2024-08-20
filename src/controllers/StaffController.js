const bcrypt = require('bcrypt')
const StaffModel = require('../models/StaffModel')

const createStaff = async (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body
    let avatar;
    if (req.file) { 
        avatar = req.file.filename;
    }
    const existingUser = await StaffModel.findOne({ $or: [{email: email}, {phone: phone}], isDelete: false })
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /(09|03|07|08|05)[0-9]{8}/;
    
    if (existingUser) {
        return res.status(400).json({
            message: "Email hoặc số điện thoại đã tồn tại"
        })
    }

    if (!username || !phone || !email || !password || !confirmPassword) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: "Email không hợp lệ"
        })
    }

    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            message: "Số điện thại không hợp lệ"
        })
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Mật khẩu phải bao gồm 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự"
        })
    }

    if (confirmPassword !== password) {
        return res.status(400).json({
            message: "Mật khẩu không khớp"
        })
    }

    try {
        const salt = await bcrypt.genSalt(5);
        hashedPassword = await bcrypt.hash(password, salt);
        const user = await StaffModel.create({ username, email, phone, password: hashedPassword, avatar })
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allStaff = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await StaffModel.find({isDelete: false}).sort({createdAt: -1})
        const searchAll = all.filter(item => item.username.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes(
                search
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase(),
            ));
        const start = (parseInt(number) - 1) * parseInt(show);
        const end = start + parseInt(show);
        const newAll = searchAll.slice(start, end);
        const totalPages = Math.ceil(searchAll.length / parseInt(show))
        res.status(200).json({
            data: newAll,
            sumPage: totalPages,
            length: searchAll.length
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const statusStaff = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await StaffModel.findById(id);
        const data = await StaffModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailStaff = async (req, res) => {
    const id = req.params.id
    try {
        const data = await StaffModel.findById(id);
        res.status(200).json(data)
    } catch (error) {
        console.log(id)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteStaff = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await StaffModel.findById(id)
        console.log('aa',existing)
        if (existing.role === 0) {
            res.status(400).json({
                message: 'Không thể xóa người dùng Admin'
            })
        } else {
            await StaffModel.findByIdAndUpdate({_id: id}, {isDelete: true}, {new: true})
            res.status(200).json({
                message: 'Xóa thành công'
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const accessStaff = async (req, res) => {
    const id = req.params.id
    const { access } = req.body 
    try {
        const data = await StaffModel.findByIdAndUpdate(id, {access: access}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    createStaff,
    allStaff,
    statusStaff,
    detailStaff,
    deleteStaff,
    accessStaff
}