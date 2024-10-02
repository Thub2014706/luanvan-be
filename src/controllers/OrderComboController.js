const { typePay } = require("../constants")
const OrderComboModel = require("../models/OrderComboModel")
const UserModel = require("../models/UserModel")

const addOrderCombo = async (req, res) => {
    const { idOrder, staff, price, paymentMethod, member, combo, usePoint, theater } = req.body
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
        if (member.toString() !== '' && status === typePay[1]) {
            const user = await UserModel.findById(member)
            updateUserPoints(user, price)
        }
        const data = await OrderComboModel.create({
            idOrder: order, 
            staff, 
            price, 
            status, 
            ...(member !== '' && { member, usePoint } ),
            ...(combo.length > 0 && { combo } ),
            theater
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

module.exports = {
    addOrderCombo,
    detailOrderCombo
}