const UserModel = require("../models/UserModel")
const bcrypt = require('bcrypt')
const QRCode = require('qrcode')

const register = async (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body
    const existingUser = await UserModel.findOne({ email: email })
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /(09|03|07|08|05)[0-9]{8}/;
    
    if (existingUser) {
        return res.status(400).json({
            message: "Email đã tồn tại"
        })
    }

    if (!username || !email || !password || !confirmPassword) {
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
        const data = { phone }
        const dataString = JSON.stringify(data)
        const qr = await QRCode.toDataURL(dataString)
        const user = await UserModel.create({ username, email, phone, password: hashedPassword, qrCode: qr })
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allUser = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await UserModel.find({}).sort({createdAt: -1})
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

const statusUser = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await UserModel.findById(id);
        const data = await UserModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailUserByPhone = async (req, res) => {
    const {phone} = req.query
    try {
        const data = await UserModel.findOne({phone})
        res.status(200).json(data)
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    register,
    allUser,
    statusUser,
    detailUserByPhone
}