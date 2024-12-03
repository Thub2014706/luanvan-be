const jwt = require('jsonwebtoken')
const UserModel = require('../models/UserModel')
const bcrypt = require('bcrypt')
const StaffModel = require('../models/StaffModel')

const accuracyAccessToken = (data) => {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '4h' })
}

const accuracyRefreshToken = (data) => {
    return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' })
}

let refreshTokens = []
let refreshTokensAdmin = []

const login = async (req, res, model, type, string) => {
    const { info, password } = req.body
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // console.log(type);
    
    const existingUser = await model.findOne({
        $or: [{username: info}, {phone: info}, {email: info} ], isDelete: false
    })

    if (!info || !password) {
        return res.status(400).json({
            message: "Yêu cầu nhập đầy đủ thông tin"
        })
    }

    if (!existingUser) {
        return res.status(400).json({
            message: "Tài khoản không tồn tại"
        })
    }

    if (existingUser && !(await bcrypt.compare(password, existingUser.password))) {
        return res.status(400).json({
            message: "Mật khẩu không đúng"
        })
    }

    if (!existingUser.status) {
        return res.status(400).json({
            message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ người quản trị!"
        })
    }

    // if (frontendType === 'admin' && ![0, 1].includes(existingUser.role)) {
    //     return res.status(403).json({
    //         message: "Truy cập bị từ chối"
    //     });
    // } 

    try {
        const data = {
            id: existingUser._id, 
            username: existingUser.username,
            role: existingUser.role,
            access: existingUser.access,
            theater: existingUser.theater
        }
        const accessToken = accuracyAccessToken(data)
        const refreshToken = accuracyRefreshToken(data)
        type.push(refreshToken)
        res.cookie(string, refreshToken, {
            httpOnly: true, //bảo vệ cookie khỏi các tấn công XSS.
            secure: false,
            path: '/',
            sameSite: 'strict'
        })
        res.status(200).json({
            data: data,
            accessToken: accessToken,
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const loginStaff = (req, res) => login(req, res, StaffModel, refreshTokensAdmin, 'refreshTokenAdmin')

const loginUser = (req, res) => login(req, res, UserModel, refreshTokens, 'refreshTokenUser')


const refreshToken = async (req, res, type, string) => {
    
    try {
        const refresh = req.cookies[string]
        // console.log(type, refresh);
        if (!refresh) {
            return res.status(401).json({
                message: 'Không nhận được refresh token'
            })
        }
        // const tokenEntry = type.find(entry => entry.token === refresh);
        if (!type.includes(refresh)) return res.status(403).json({ message: 'refresh token không hợp lệ' });

        jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log(err)
            }
            // type = type.filter(entry => entry.token !== refresh);
            // type = type.filter((token) => token !== refresh);
            const data = {
                id: user.id, 
                username: user.username,
                role: user.role,
                access: user.access,
                theater: user.theater
            }
            const newAccessToken = accuracyAccessToken(data)
            const newRefreshToken = accuracyRefreshToken(data)
            type.push(newRefreshToken);
            res.cookie(string, newRefreshToken, {
                httpOnly: true, //bảo vệ cookie khỏi các tấn công XSS.
                secure: false,
                path: '/',
                sameSite: 'strict'
            })
            res.status(200).json({
                accessToken: newAccessToken
            })
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const refreshTokenStaff = (req, res) => refreshToken(req, res, refreshTokensAdmin, 'refreshTokenAdmin')

const refreshTokenUser = (req, res) => refreshToken(req, res, refreshTokens, 'refreshTokenUser')

const logout = async (req, res, type, string) => {
    res.clearCookie(string)
    const refresh = req.cookies[string];
    
    // Lọc và cập nhật lại danh sách token toàn cục
    if (type === refreshTokens) {
        refreshTokens = refreshTokens.filter(entry => entry.token !== refresh);
    } else if (type === refreshTokensAdmin) {
        refreshTokensAdmin = refreshTokensAdmin.filter(entry => entry.token !== refresh);
    }
    res.status(200).json({
        message: 'Đã đăng xuất'
    })
}

const logoutStaff = (req, res) => logout(req, res, refreshTokensAdmin, 'refreshTokenAdmin')

const logoutUser = (req, res) => logout(req, res, refreshTokens, 'refreshTokenUser')

module.exports = {
    loginStaff,
    loginUser,
    refreshTokenStaff,
    refreshTokenUser,
    logoutStaff,
    logoutUser
}