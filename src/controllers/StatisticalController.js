const { typePay, typeStatistical } = require("../constants")
const FilmModel = require("../models/FilmModel")
const OrderComboModel = require("../models/OrderComboModel")
const OrderTicketModel = require("../models/OrderTicketModel")
const ScheduleModel = require("../models/ScheduleModel")
const ShowTimeModel = require("../models/ShowTimeModel")
const TicketRefundModel = require("../models/TicketRefundModel")
const UserModel = require("../models/UserModel")
const TheaterModel = require("../models/TheaterModel")
const FoodModel = require("../models/FoodModel")
const ComboModel = require("../models/ComboModel")

const array = async () => {
    const [data1, refund, allOrderTicket] = await Promise.all([
        OrderComboModel.find({status: typePay[1]}),
        TicketRefundModel.find({}),
        OrderTicketModel.find({status: typePay[1]})
    ])
    const data2 = allOrderTicket.filter(item => {
        return !refund.some(mini => mini.order.equals(item._id));
    });

    return { data1, data2 }
}

const dailyRevenue = async (req, res) => {
    try {
        const now = new Date()
        const arrayData = await array();
        const toDay = [...arrayData.data1, ...arrayData.data2].filter(item => {
            if (new Date(item.createdAt).setUTCHours(0, 0, 0, 0) === now.setUTCHours(0, 0, 0, 0)) {
                return item
            }
        })
        const total = toDay.reduce((sum, item) => sum +item.price, 0)

        res.status(200).json(total)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const totalTicket = async (req, res) => {
    try {
        const arrayData = await array()
        const arraySort = arrayData.data2.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        res.status(200).json({
            startDate: arraySort[0].createdAt,
            endDate: arraySort[arrayData.data2.length - 1].createdAt,
            total: arrayData.data2.length
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const totalRevenue = async (req, res) => {
    try {
        const arrayData = await array();
        const total = [...arrayData.data1, ...arrayData.data2].reduce((sum, item) => sum + item.price, 0)
        const arraySort = [...arrayData.data1, ...arrayData.data2].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.status(200).json({
            startDate: arraySort[0].createdAt,
            endDate: arraySort[[...arrayData.data1, ...arrayData.data2].length - 1].createdAt,
            total
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}


const newUser = async (req, res) => {
    try {
        const users = await UserModel.find({})
        const newToDay = users.filter(item => {
            if (new Date(item.createdAt).setUTCHours(0, 0, 0, 0) === new Date().setUTCHours(0, 0, 0, 0)) {
                return item
            }
        })
        res.status(200).json(newToDay.length)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const sDayRevenueTicket = async (req, res) => {
    const { type, start, end } = req.query
    
    try {
        let revenueByDay = {}
        if (type === '') {
            const milli = 1000 * 60 * 60 * 24;

            const diffInDays = (new Date(end) - new Date(start)) / milli;

            if (diffInDays > 30) {
                return res.status(400).json({
                    message: "Ngày bắt đầu và ngày kết thúc không được lớn hơn 31 ngày",
                });
            }
            if (new Date(start) > new Date(end)) {
                return res.status(400).json({
                    message: "Ngày kết thúc không được lớn hơn ngày bắt đầu",
                })
            }
            const orders = await array()
            for (let date = new Date(start); date <= new Date(end); date.setDate(date.getDate() + 1)) {
                const data = orders.data2.filter(item => {
                    if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                        return item
                    }
                })
                    
                const total = data.reduce((sum, item) => {
                    const discount = item.discount && item.discount.useDiscount > 0 ? item.discount.useDiscount : 0
                    const point = item.usePoint ? item.usePoint : 0
                    const original = item.price + point + discount
                    const comboPrice = item.combo.length > 0
                        ? item.combo.reduce((comboSum, com) => comboSum + com.price * com.quantity, 0)
                        : 0;
                    const film = original - comboPrice
                    
                    return sum + (film - (film / original) * (discount + point))
                }, 0)
                revenueByDay[date] = total
            }
        } else {
            const startDate = new Date()
            const endDate = new Date()
            if (type === typeStatistical[3]) {
                startDate.setMonth(0)
                const orders = await array()
    
                for (let date = startDate.getMonth(); date <= endDate.getMonth(); date++) {
                    const data = orders.data2.filter(item => {
                        if (new Date(item.createdAt).getMonth() === date) {
                            return item
                        }
                    })
                     
                    const total = data.reduce((sum, item) => {
                        const discount = item.discount && item.discount.useDiscount > 0 ? item.discount.useDiscount : 0
                        const point = item.usePoint ? item.usePoint : 0
                        const original = item.price + point + discount
                        const comboPrice = item.combo.length > 0
                            ? item.combo.reduce((comboSum, com) => comboSum + com.price * com.quantity, 0)
                            : 0;
                        const film = original - comboPrice
                        
                        return sum + (film - (film / original) * (discount + point))
                    }, 0)
                    revenueByDay[date] = total
                }
            } else {
                if (type === typeStatistical[0]) {
                    startDate.setDate((startDate.getDate() - 6))
                } else if (type === typeStatistical[1]) {
                    startDate.setDate(1)
                    startDate.setDate(1)
                } else if (type === typeStatistical[2]) {
                    startDate.setDate(1)
                    endDate.setDate(startDate.getDate() - 1)
                    startDate.setMonth(startDate.getMonth() - 1)
                }
                const orders = await array()
                for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
                    const data = orders.data2.filter(item => {
                        if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                            return item
                        }
                    })
                        
                    const total = data.reduce((sum, item) => {
                        const discount = item.discount && item.discount.useDiscount > 0 ? item.discount.useDiscount : 0
                        const point = item.usePoint ? item.usePoint : 0
                        const original = item.price + point + discount
                        const comboPrice = item.combo.length > 0
                            ? item.combo.reduce((comboSum, com) => comboSum + com.price * com.quantity, 0)
                            : 0;
                        const film = original - comboPrice
                        
                        return sum + (film - (film / original) * (discount + point))
                    }, 0)
                    revenueByDay[date] = total
                }
            }
        }
        
  
        res.status(200).json(revenueByDay)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const sDayRevenueCombo = async (req, res) => {
    const {type, start, end}= req.query
    try {
        let revenueByDay = {}
        if (type === '') {
            const milli = 1000 * 60 * 60 * 24;

            const diffInDays = (new Date(end) - new Date(start)) / milli;

            if (diffInDays > 30) {
                return res.status(400).json({
                    message: "Ngày bắt đầu và ngày kết thúc không được lớn hơn 31 ngày",
                });
            }
            if (new Date(start) > new Date(end)) {
                return res.status(400).json({
                    message: "Ngày kết thúc không được lớn hơn ngày bắt đầu",
                })
            }
            const orders = await array()
            for (let date = new Date(start); date <= new Date(end); date.setDate(date.getDate() + 1)) {
                const data1 = orders.data1.filter(item => {
                    if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                        return item
                    }
                })
                const total1 = data1.reduce((sum, item) => sum + item.price, 0)

                const data2 = orders.data2.filter(item => {
                    if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                        return item
                    }
                })

                const total2 = data2.reduce((sum, item) => {
                    const discount = item.discount && item.discount.useDiscount > 0 ? item.discount.useDiscount : 0
                    const point = item.usePoint ? item.usePoint : 0
                    const original = item.price + point + discount
                    const comboPrice = item.combo.length > 0
                        ? item.combo.reduce((comboSum, com) => comboSum + com.price * com.quantity, 0)
                        : 0;
                    
                    return sum + (comboPrice - (comboPrice / original) * (discount + point))
                }, 0)

                revenueByDay[date] = total1 + total2
            }
        } else {
            const startDate = new Date()
            const endDate = new Date()
            if (type === typeStatistical[3]) {
                startDate.setMonth(0)
                const orders = await array()
                for (let date = startDate.getMonth(); date <= endDate.getMonth(); date++) {
                    // console.log(date, endDate);
                    
                    const data1 = orders.data1.filter(item => {
                        if (new Date(item.createdAt).getMonth() === date) {
                            return item
                        }
                    })
                    const total1 = data1.reduce((sum, item) => sum + item.price, 0)
    
                    const data2 = orders.data2.filter(item => {
                        if (new Date(item.createdAt).getMonth() === date) {
                            return item
                        }
                    })
    
                    const total2 = data2.reduce((sum, item) => {
                        const discount = item.discount && item.discount.useDiscount > 0 ? item.discount.useDiscount : 0
                        const point = item.usePoint ? item.usePoint : 0
                        const original = item.price + point + discount
                        const comboPrice = item.combo.length > 0
                            ? item.combo.reduce((comboSum, com) => comboSum + com.price * com.quantity, 0)
                            : 0;
                        
                        return sum + (comboPrice - (comboPrice / original) * (discount + point))
                    }, 0)
    
                    revenueByDay[date] = total1 + total2
                }
            } else {
                if (type === typeStatistical[0]) {
                    startDate.setDate((startDate.getDate() - 6))
                } else if (type === typeStatistical[1]) {
                    startDate.setDate(1)
                    startDate.setDate(1)
                } else if (type === typeStatistical[2]) {
                    startDate.setDate(1)
                    endDate.setDate(startDate.getDate() - 1)
                    startDate.setMonth(startDate.getMonth() - 1)
                }
                const orders = await array()
                for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
                    const data1 = orders.data1.filter(item => {
                        if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                            return item
                        }
                    })
                    const total1 = data1.reduce((sum, item) => sum + item.price, 0)
    
                    const data2 = orders.data2.filter(item => {
                        if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                            return item
                        }
                    })
    
                    const total2 = data2.reduce((sum, item) => {
                        const discount = item.discount && item.discount.useDiscount > 0 ? item.discount.useDiscount : 0
                        const point = item.usePoint ? item.usePoint : 0
                        const original = item.price + point + discount
                        const comboPrice = item.combo.length > 0
                            ? item.combo.reduce((comboSum, com) => comboSum + com.price * com.quantity, 0)
                            : 0;
                        
                        return sum + (comboPrice - (comboPrice / original) * (discount + point))
                    }, 0)
    
                    revenueByDay[date] = total1 + total2
                }
            }
        }
        
        // console.log(startDate, revenueByDay)
        res.status(200).json(revenueByDay)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const sDayCombo = async (req, res) => {
    const { type, start, end } = req.query
    try {
        let revenueByDay = {}
        if (type === '') {
            const milli = 1000 * 60 * 60 * 24;

            const diffInDays = (new Date(end) - new Date(start)) / milli;

            if (diffInDays > 30) {
                return res.status(400).json({
                    message: "Ngày bắt đầu và ngày kết thúc không được lớn hơn 31 ngày",
                });
            }
            if (new Date(start) > new Date(end)) {
                return res.status(400).json({
                    message: "Ngày kết thúc không được lớn hơn ngày bắt đầu",
                })
            }
            const orders = await array()
            for (let date = new Date(start); date <= new Date(end); date.setDate(date.getDate() + 1)) {
                const data = orders.data1.filter(item => {
                    if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                        return item
                    }
                })
                
                revenueByDay[date] = data.length
            }
        } else {
            const startDate = new Date()
            const endDate = new Date()
            if (type === typeStatistical[3]) {
                startDate.setMonth(0)
                const orders = await array()
                for (let date = startDate.getMonth(); date <= endDate.getMonth(); date++) {
                    const data = orders.data1.filter(item => {
                        if (new Date(item.createdAt).getMonth() === date) {
                            return item
                        }
                    })
                    
                    revenueByDay[date] = data.length
                }
            } else {
                if (type === typeStatistical[0]) {
                    startDate.setDate((startDate.getDate() - 6))
                } else if (type === typeStatistical[1]) {
                    startDate.setDate(1)
                    startDate.setDate(1)
                } else if (type === typeStatistical[2]) {
                    startDate.setDate(1)
                    endDate.setDate(startDate.getDate() - 1)
                    startDate.setMonth(startDate.getMonth() - 1)
                }
                const orders = await array()
                for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
                    const data = orders.data1.filter(item => {
                        if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                            return item
                        }
                    })
                    
                    revenueByDay[date] = data.length
                }
            }
        }
        
        res.status(200).json(revenueByDay)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const sDayTicket = async (req, res) => {
    const { type, start, end } = req.query
    try {
        let revenueByDay = {}
        if (type === '') {
            const milli = 1000 * 60 * 60 * 24;

            const diffInDays = (new Date(end) - new Date(start)) / milli;

            if (diffInDays > 30) {
                return res.status(400).json({
                    message: "Ngày bắt đầu và ngày kết thúc không được lớn hơn 31 ngày",
                });
            }
            if (new Date(start) > new Date(end)) {
                return res.status(400).json({
                    message: "Ngày kết thúc không được lớn hơn ngày bắt đầu",
                })
            }
            const orders = await array()
            for (let date = new Date(start); date <= new Date(end); date.setDate(date.getDate() + 1)) {
                const data = orders.data2.filter(item => {
                    if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                        return item
                    }
                })
                
                revenueByDay[date] = data.length
            }
        } else {
            const startDate = new Date()
            const endDate = new Date()
            if (type === typeStatistical[3]) {
                startDate.setMonth(0)
                const orders = await array()
                for (let date = startDate.getMonth(); date <= endDate.getMonth(); date++) {
                    const data = orders.data2.filter(item => {
                        if (new Date(item.createdAt).getMonth() === date) {
                            return item
                        }
                    })
                    
                    revenueByDay[date] = data.length
                }
            } else {
                if (type === typeStatistical[0]) {
                    startDate.setDate((startDate.getDate() - 6))
                } else if (type === typeStatistical[1]) {
                    startDate.setDate(1)
                    startDate.setDate(1)
                } else if (type === typeStatistical[2]) {
                    startDate.setDate(1)
                    endDate.setDate(startDate.getDate() - 1)
                    startDate.setMonth(startDate.getMonth() - 1)
                }
                const orders = await array()
                for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
                    const data = orders.data2.filter(item => {
                        if (new Date(item.createdAt).toDateString() === new Date(date).toDateString()) {
                            return item
                        }
                    })
                    
                    revenueByDay[date] = data.length
                }
            }
        }
        res.status(200).json(revenueByDay)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const filmRevenue = async (req, res) => {
    const {film} = req.query
    try {
        const filmsFirst = await FilmModel.find({})
        const films = filmsFirst.filter(item => {
            return item.name
            .toString()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .includes(
                        film
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .toLowerCase(),
                    )
        })
        const refund =  await TicketRefundModel.find({})
        const data = await Promise.all(films.map(async item => {
            const schedules = await ScheduleModel.find({film: item._id})

            const showTimes = await ShowTimeModel.find({schedule: { $in: schedules.map(s => s._id) }})

            const orders = await OrderTicketModel.find({showTime: { $in: showTimes.map(s => s._id)}, status: typePay[1]})


            const filter = orders.filter(order => {
                return !refund.some(ref => ref.order.equals(order._id));
            });

            const total = filter.reduce((sum, item) => {
                const discount = item.discount && item.discount.useDiscount > 0 ? item.discount.useDiscount : 0
                const point = item.usePoint ? item.usePoint : 0
                const original = item.price + point + discount
                const comboPrice = item.combo.length > 0
                    ? item.combo.reduce((comboSum, com) => comboSum + com.price * com.quantity, 0)
                    : 0;
                const filmTotal = original - comboPrice
                
                return sum + (filmTotal - (filmTotal / original) * (discount + point))
            }, 0)
            const numberTicket = filter.length

            return {item, total, numberTicket}
        }))
        
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const theaterRevenue = async (req, res) => {
    const {theater} = req.query
    try {
        const theatersFirst = await TheaterModel.find({isDelete: false})
        const theaters = theatersFirst.filter(item => {
            return item.name
            .toString()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .includes(
                        theater
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .toLowerCase(),
                    )
        })
        const refund =  await TicketRefundModel.find({})
        const data = await Promise.all(theaters.map(async item => {
            const showTimes = await ShowTimeModel.find({theater: item._id})

            const orders1 = await OrderTicketModel.find({showTime: { $in: showTimes.map(s => s._id)}, status: typePay[1]})

            const filter = orders1.filter(ord => {
                return !refund.some(ref => ref.order.equals(ord._id));
            });

            const total = filter.reduce((sum, item) => {
                const discount = item.discount && item.discount.useDiscount > 0 ? item.discount.useDiscount : 0
                const point = item.usePoint ? item.usePoint : 0
                const original = item.price + point + discount
                const comboPrice = item.combo.length > 0
                    ? item.combo.reduce((comboSum, com) => comboSum + com.price * com.quantity, 0)
                    : 0;
                const filmTotal = original - comboPrice
                
                return sum + (filmTotal - (filmTotal / original) * (discount + point))
            }, 0)
            const numberTicket = filter.length

            return {item, total, numberTicket}
        }))
        
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const theaterComboRevenue = async (req, res) => {
    const {theater} = req.query
    try {
        const theatersFirst = await TheaterModel.find({isDelete: false})
        const theaters = theatersFirst.filter(item => {
            return item.name
            .toString()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .includes(
                        theater
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .toLowerCase(),
                    )
        })
        const refund =  await TicketRefundModel.find({})
        const data = await Promise.all(theaters.map(async item => {
            const showTimes = await ShowTimeModel.find({theater: item._id})

            const orders1 = await OrderTicketModel.find({showTime: { $in: showTimes.map(s => s._id)}, status: typePay[1]})

            const filter = orders1.filter(ord => {
                return !refund.some(ref => ref.order.equals(ord._id));
            });

            const total1 = filter.reduce((sum, item) => {
                const discount = item.discount && item.discount.useDiscount > 0 ? item.discount.useDiscount : 0
                const point = item.usePoint ? item.usePoint : 0
                const original = item.price + point + discount
                const comboPrice = item.combo.length > 0
                    ? item.combo.reduce((comboSum, com) => comboSum + com.price * com.quantity, 0)
                    : 0;
                
                return sum + (comboPrice - (comboPrice / original) * (discount + point))
            }, 0)

            const orders2 = await OrderComboModel.find({theater: item._id, status: typePay[1]})

            const total2 = orders2.reduce((sum, order) => sum + order.price, 0)

            return {item, total: total1 + total2}
        }))
        
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

// const comboRevenue = async (req, res) => {
//     const {search} = req.query
//     try {
//         const foods = await FoodModel.find({})
//         const combos = await ComboModel.find({})
//         const all = [...foods, ...combos]
//         const list = all.filter(item => {
//             return item.name
//             .toString()
//                     .normalize('NFD')
//                     .replace(/[\u0300-\u036f]/g, '')
//                     .toLowerCase()
//                     .includes(
//                         search
//                             .normalize('NFD')
//                             .replace(/[\u0300-\u036f]/g, '')
//                             .toLowerCase(),
//                     )
//         })
//         const data = await Promise.all(list.map(async item => {
//             const orders = await OrderComboModel.find({combo: { $elemMatch: { id: item._id.toString() } }, status: typePay[1]})

//             const total = orders.reduce((sum, order) => sum + order.price, 0)
//             const numberTicket = orders.length

//             return {item, total, numberTicket}
//         }))
        
//         res.status(200).json(data)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }

// const dailyRevenue = async (req, res) => {
//     try {
//         const data1 = await OrderComboModel.find({status: typePay[1]})
//         const refund = await TicketRefundModel.find()
//         const allOrderTicket = await OrderTicketModel.find({status: typePay[1]})
//         const data2 = allOrderTicket.filter(item => {
//             return !refund.some(mini => mini.order.equals(item._id));
//         });
//         const data = [...data1, ...data2]
//         let sum = 0
//         data.map(item => {
//             sum += item.price
//         })
//         res.status(200).json(sum)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }

module.exports = {
    dailyRevenue,
    totalTicket,
    totalRevenue,
    newUser,
    sDayRevenueTicket,
    sDayRevenueCombo,
    sDayTicket,
    sDayCombo,
    filmRevenue,
    theaterRevenue,
    theaterComboRevenue
}