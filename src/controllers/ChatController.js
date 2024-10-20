// const ChatModel = require("../models/ChatModel")

// const createChat = async (req, res) => {
//     const {firstId, secondId} = req.body

//     try {
//         const chat = await ChatModel.findOne({
//             members: {$all: [firstId, secondId]}
//         })

//         if (chat) return res.status(200).json(chat);
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             message: "Đã có lỗi xảy ra",
//         })
//     }
// }