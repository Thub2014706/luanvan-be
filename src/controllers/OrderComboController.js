const { typePay, pointHis } = require("../constants")
const ComboModel = require("../models/ComboModel")
const DiscountModel = require("../models/DiscountModel")
const FoodModel = require("../models/FoodModel")
const OrderComboModel = require("../models/OrderComboModel")
const PointHistoryModel = require("../models/PointHistoryModel")
const TheaterModel = require("../models/TheaterModel")
const UserModel = require("../models/UserModel")
const { updateUserPoints } = require("./OrderTicketController")

const addOrderCombo = async (req, res) => {
    const { idOrder, staff, price, paymentMethod, member, combo, usePoint, theater, discount } = req.body
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

        const data = await OrderComboModel.create({
            idOrder: order, 
            staff, 
            price, 
            status, 
            ...(discount && {discount}),
            ...(member !== '' && { member, usePoint } ),
            ...(combo.length > 0 && { combo } ),
            theater
        })
        
        if (member.toString() !== '' && status === typePay[1]) {
            const user = await UserModel.findById(member)
            updateUserPoints(user, price, 'combo')
            usePoint > 0 && await PointHistoryModel.create({point: usePoint, user: member, order: data._id, orderModel: 'OrderCombo', name: pointHis[0]})
            if (discount) {
                await DiscountModel.findByIdAndUpdate(discount.id, { $inc: { used: 1 } }, {new: true})
            }
        }
        
        
        res.status(200).json(data)
    } catch (error) {
        console.log('eEe', error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailOrderCombo = async (req, res) => {
    const {idOrder} = req.query
    try {
        const data = await OrderComboModel.findOne({idOrder: idOrder})
        res.status(200).json(data)
    } catch (error) {
        console.log('ee')
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allOrderByUser = async (req, res) => {
    const id = req.params.id
    const {number} = req.query
    try {
        const allOrderCombo = await OrderComboModel.find({member: id, status: typePay[1]}).sort({createdAt: -1});
        const data = await Promise.all(allOrderCombo.map(async item => {
            let theater

            const theaterInfo = await TheaterModel.findById(item.theater)
            theater = theaterInfo.name
            const combo = await Promise.all(item.combo.map(async mini => {
                const com = await ComboModel.findById(mini.id) || await FoodModel.findById(mini.id)
                if (com && com.variants) {
                    const foods = await Promise.all(com.variants.map(async min => {
                        const nameFood = await FoodModel.findById(min.food)
                        return {min, nameFood}
                    }))
                    return {...mini, detail: com, foods}
                } else return {...mini, detail: com}
            }))
            return {item, theater, combo}

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

module.exports = {
    addOrderCombo,
    detailOrderCombo,
    allOrderByUser
}