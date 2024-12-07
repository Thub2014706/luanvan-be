const PointHistoryModel = require("../models/PointHistoryModel");

const allPointHistory = async (req, res) => {
    const id = req.params.id
    const {number} = req.query
    try {
        const data = await PointHistoryModel.find({user: id}).sort({createdAt: -1})
        const populatedData = await Promise.all(data.map(async item => {
            if (item.orderModel === 'OrderTicket') {
                return await item.populate({
                    path: 'order',
                    populate: {
                        path: 'showTime',
                        populate: {
                            path: 'schedule',
                            populate: {
                                path: 'film',
                                model: 'Film',
                                select: ['name', 'image']
                            }
                        }
                    }
                })
            } else {
                return await item.populate({
                    path: 'order',
                    populate:  [{
                        path: 'combo.id',
                        model: 'Combo', 
                        select: ['name', 'image']
                    }, {
                        path: 'combo.id',
                        model: 'Food',
                        select: ['name', 'image']
                    }]
                })
            }
        }))

        const start = (parseInt(number) - 1) * 5
        const end = start + 5;
        const newAll = populatedData.slice(start, end);
        const totalPages = Math.ceil(populatedData.length / 5)
        
        res.status(200).json({
            data: newAll,
            length: totalPages
        })
    } catch (error) {
        console.log('eee', error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

module.exports = {allPointHistory}