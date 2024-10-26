const FoodModel = require("../models/FoodModel")

const addFood = async (req, res) => {
    const { name, price } = req.body
    const image = req.file?.filename

    const existing = await FoodModel.findOne({ name: name })
    if (!name || !price || !image) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên thức ăn đã tồn tại"
        })
    }
    try {
        const data = await FoodModel.create({...req.body, image})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allFood = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await FoodModel.find({isDelete: false}).sort({createdAt: -1})
        const searchAll = all.filter(item => item.name.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(
            search
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase(),
        ));
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

const updateFood = async (req, res) => {
    const id = req.params.id
    const { name, price, imageId } = req.body
    const image = imageId ? imageId : req.file.filename

    // const existing = await FoodModel.findOne({ name: name })
    if (!name || !price || !image) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    // if (existing) {
    //     return res.status(400).json({
    //         message: "Tên thức ăn đã tồn tại"
    //     })
    // }
    try {
        const data = await FoodModel.findByIdAndUpdate(id, {name, price, image}, {new: true})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailFood = async (req, res) => {
    const id = req.params.id
    try {
        const data = await FoodModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

// const statusFood = async (req, res) => {
//     const id = req.params.id
//     try {
//         const existing = await FoodModel.findById(id);
//         const data = await FoodModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
//         res.status(200).json(data)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }

const deleteFood = async (req, res) => {
    const id = req.params.id
    try {
        const data = await FoodModel.findByIdAndUpdate(id, {isDelete: true})
        res.status(200).json({
            message: 'Xóa thành công'
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listFood = async (req, res) => {
    try {
        // const data = await FoodModel.find({status: true})
        const data = await FoodModel.find({isDelete: false})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}


module.exports = {
    addFood,
    allFood,
    updateFood,
    detailFood,
    // statusFood,
    deleteFood,
    listFood
}
