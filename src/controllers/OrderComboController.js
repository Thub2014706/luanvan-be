const { typePay } = require("../constants")
const OrderComboModel = require("../models/OrderComboModel")
const UserModel = require("../models/UserModel")

const addOrderCombo = async (req, res) => {
    const { idOrder, staff, price, paymentMethod, member, combo, usePoint } = req.body
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
            if (user.level === 1) {
                const sumPoint = user.point + (0.03 * price)
                let getPoint
                if (sumPoint % 1000 >= 1 && sumPoint % 1000 <=499) {
                    getPoint = sumPoint - sumPoint % 1000
                } else {
                    getPoint = sumPoint + (1000 - sumPoint % 1000)
                }
                await UserModel.findByIdAndUpdate({_id: member}, {point: getPoint}, {new: true})
            } else {
                const sumPoint = user.point + (0.04 * price)
                let getPoint
                if (sumPoint % 1000 >= 1 && sumPoint % 1000 <=499) {
                    getPoint = sumPoint - sumPoint % 1000
                } else {
                    getPoint = sumPoint + (1000 - sumPoint % 1000)
                }
                await UserModel.findByIdAndUpdate({_id: member}, {point: getPoint}, {new: true})
            }
            // if (user.level === 1 && user.point + (0.05 * price) >= 4000000) {
            //     await UserModel.findByIdAndUpdate({_id: member}, {level: 2}, {new: true})
            // }
            await UserModel.findByIdAndUpdate({_id: member}, {point: user.point - usePoint}, {new: true})
        }
        const data = await OrderComboModel.create({
            idOrder: order, 
            staff, 
            price, 
            status, 
            ...(member !== '' && { member, usePoint } ),
            ...(combo.length > 0 && { combo } ),
        })
        
        res.status(200).json(data)
    } catch (error) {
        console.log('ee', error)
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

const allOrderCombo = async (req, res) => {
    try {
        const data = await OrderComboModel.find({})
        res.status(200).json(data)
    } catch (error) {
        console.log('ee')
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {
    addOrderCombo,
    detailOrderCombo
}