const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const { allAccess } = require('../constants');

dotenv.config()

// nguời dùng đã đăng nhập
const userAccuracy = (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader.split(' ')[1];
    // console.log("dfghjkl;",req.user)
    
    if (!authorizationHeader) {
        return res.status(401).json({ 
            message: 'Thiếu Headers' 
        });
    }
    if (!token) {
        return res.status(401).json({ 
            message: 'Thiếu token' 
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user ) => {
        if (err) {
            console.error(err);
            return res.status(403).json({ 
                message: 'Token không hợp lệ' 
            });
        }
        req.user = user;
        // console.log("ghjk", req.user)
        next();
    });
};

// người dùng đã đăng nhập và đúng tài khoản
const UserIdAccuracy = (req, res, next) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader.split(' ')[1]
    const id = req.params.id

    if (!authorizationHeader) {
        return res.status(401).json({
            message: 'Thiếu Headers'
        })
    }
    if (!token) {
        return res.status(401).json({
            message: 'Thiếu token'
        })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(403).json({ 
                message: 'Token không hợp lệ' 
            });
        }
        if (data.id === id) {
            next()
        } else {
            res.status(403).json({ 
                message: 'Không có quyền truy cập' 
            });
        }
    })
}

// người dùng admin
// const userAdminAccuracy = (req, res, next) => {
//     const authorizationHeader = req.headers['authorization']
//     const token = authorizationHeader.split(' ')[1]

//     if (!authorizationHeader) {
//         return res.status(401).json({
//             message: 'Thiếu Headers'
//         })
//     }
//     if (!token) {
//         return res.status(401).json({
//             message: 'Thiếu token'
//         })
//     }

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
//         if (err) {
//             console.error(err);
//             return res.status(403).json({ 
//                 message: 'Token không hợp lệ' 
//             });
//         }
//         if (data.role === 0) {
//             next()
//         } else {
//             res.status(403).json({ 
//                 message: 'Không có quyền truy cập' 
//             });
//         }
//     })
// }

// người dùng là admin hoạc đúng tài khoản
const userOrAdminAccuracy = (req, res, next) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader.split(' ')[1]
    const id = req.params.id

    if (!authorizationHeader) {
        return res.status(401).json({
            message: 'Thiếu Headers'
        })
    }
    if (!token) {
        return res.status(401).json({
            message: 'Thiếu token'
        })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(403).json({ 
                message: 'Token không hợp lệ' 
            });
        }
        if (data.isAdmin === true || data.id === id) {
            next()
        } else {
            res.status(403).json({ 
                message: 'Không có quyền truy cập' 
            });
        }
    })
}

//tong quat
const accuracy = (acc) => (req, res, next) => {
    const authorizationHeader = req.headers['authorization']
    const token = authorizationHeader.split(' ')[1]
    // const id = req.params.id

    if (!authorizationHeader) {
        return res.status(401).json({
            message: 'Thiếu Headers'
        })
    }
    if (!token) {
        return res.status(401).json({
            message: 'Thiếu token'
        })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(403).json({ 
                message: 'Token không hợp lệ' 
            });
        }
        if (data.role === 0 || data.access.includes(acc)) {
            next()
        } else {
            res.status(403).json({ 
                message: 'Không có quyền truy cập' 
            });
        }
    })
}

// người dùng là admin hoặc genre
const genreAccuracy = accuracy(allAccess[0])

// người dùng là admin hoặc film
const filmAccuracy = accuracy(allAccess[1])

// người dùng là admin hoặc director
const directorAccuracy = accuracy(allAccess[2])

// người dùng là admin hoặc performer
const performerAccuracy = accuracy(allAccess[3])

// người dùng là admin hoặc food
const foodAccuracy = accuracy(allAccess[4])

// người dùng là admin hoặc combo
const comboAccuracy = accuracy(allAccess[5])

// người dùng là admin hoặc discount
const discountAccuracy = accuracy(allAccess[6])

// người dùng là admin hoặc user
const userAdminAccuracy = accuracy(allAccess[7])

// người dùng là admin hoặc theater
const theaterAccuracy = accuracy(allAccess[8])

// người dùng là admin hoặc staff
const staffAccuracy = accuracy(allAccess[9])

// người dùng là admin hoặc price
const priceAccuracy = accuracy(allAccess[10])

// người dùng là admin hoặc schedule
const scheduleAccuracy = accuracy(allAccess[11])

// người dùng là admin hoặc showtime
const showTimeAccuracy = accuracy(allAccess[12])

// người dùng là admin hoặc orderticket
const orderTicketAccuracy = accuracy(allAccess[13])

// người dùng là admin hoặc ordercombo
const orderComboAccuracy = accuracy(allAccess[14])

// người dùng là admin hoặc print
const printAccuracy = accuracy(allAccess[16])

module.exports = { 
    userAccuracy, 
    userAdminAccuracy, 
    UserIdAccuracy, 
    userOrAdminAccuracy,
    genreAccuracy,
    filmAccuracy,
    directorAccuracy,
    performerAccuracy,
    foodAccuracy,
    comboAccuracy,
    discountAccuracy,
    theaterAccuracy,
    staffAccuracy,
    priceAccuracy,
    scheduleAccuracy,
    showTimeAccuracy,
    orderTicketAccuracy,
    orderComboAccuracy,
    printAccuracy
}