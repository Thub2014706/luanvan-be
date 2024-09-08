const { isEmpty } = require("validator")
const ComboModel = require("../models/ComboModel")
const FoodModel = require("../models/FoodModel")

const addCombo = async (req, res) => {
    const { name, price, variants } = req.body
    const image = req.file?.filename

    const existing = await ComboModel.findOne({ name: name })
    const variantsParse = JSON.parse(variants)
    if (!name || !price || !image || variantsParse.length === 0 || variantsParse.some(item => item.food === '') || variantsParse.some(item => item.quantity === '')) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    if (existing) {
        return res.status(400).json({
            message: "Tên combo đã tồn tại"
        })
    }
    try {
        const data = await ComboModel.create({ name, price, variants: variantsParse, image})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const allCombo = async (req, res) => {
    const {search, number, show} = req.query
    try {
        const all = await ComboModel.find({}).sort({createdAt: -1})

        const searchAll = await Promise.all(
            all.map(async (item) => {
                const foods = await Promise.all(item.variants.map(variant => FoodModel.findById(variant.food)));
                const searchStrings = [item.name, ...foods.map(food => food.name)];

                const matchesSearch = searchStrings.some(any => 
                    any
                    .toString()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .includes(
                        search
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .toLowerCase()
                    )
                );
                
                return matchesSearch ? item : null;
            })
        );
        const filteredResults = searchAll.filter(item => item !== null);
        const start = (parseInt(number) - 1) * parseInt(show)
        const end = start + parseInt(show);
        const newAll = filteredResults.slice(start, end);
        const totalPages = Math.ceil(filteredResults.length / parseInt(show))
        res.status(200).json({
            data: newAll,
            sumPage: totalPages,
            length: filteredResults.length
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const updateCombo = async (req, res) => {
    const id = req.params.id
    const { name, price, variants, imageId } = req.body
    const image = imageId ? imageId : req.file.filename

    const variantsParse = JSON.parse(variants)
    if (!name || !price || !image || variantsParse.length === 0 || variantsParse.some(item => item.food === '') || variantsParse.some(item => item.quantity === '')) {
        return res.status(400).json({
            message: "Nhập đầy đủ thông tin"
        })
    }
    try {
        const data = await ComboModel.findByIdAndUpdate(id, {name, price, variants: variantsParse, image}, {new: true})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const detailCombo = async (req, res) => {
    const id = req.params.id
    try {
        const data = await ComboModel.findById(id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const statusCombo = async (req, res) => {
    const id = req.params.id
    try {
        const existing = await ComboModel.findById(id);
        const data = await ComboModel.findByIdAndUpdate(id, {status: !existing.status}, { new: true })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const deleteCombo = async (req, res) => {
    const id = req.params.id
    try {
        const data = await ComboModel.findOneAndDelete({_id: id})
        res.status(200).json({
            message: 'Xóa thành công'
        })
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}

const listCombo = async (req, res) => {
    try {
        const data = await ComboModel.find({status: true}).sort({createdAt: -1})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            message: "Đã có lỗi xảy ra",
        })
    }
}


module.exports = {
    addCombo,
    allCombo,
    updateCombo,
    detailCombo,
    statusCombo,
    deleteCombo,
    listCombo
}
