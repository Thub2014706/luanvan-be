const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require("http");

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const ChatModel = require('./models/ChatModel');
const UserModel = require('./models/UserModel');
const StaffModel = require('./models/StaffModel');

const port = process.env.PORT || 3001;
dotenv.config();

const io = new Server(server, {
  cors: {
      origin: ['http://localhost:3000', 'http://localhost:3002', 'exp://10.10.45.210:8081', 'http://10.10.45.210:8081'],
      credentials: true
  }
})

// const adminId = 'admin'; 
const userSocketMap = {};
const userInRoom = {};
const numberChat = {}
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId; 
    userSocketMap[userId] = socket.id;
    
    socket.on("adminNumber", async (user) => {
        let list = []
        if (await StaffModel.findById(user)) {
            list = await ChatModel.aggregate([
                {$group: { _id: "$user", lastMess: { $max: "$createdAt" }}},
                {$sort: {lastMess: -1}}
            ]);
        }        
        const array = await Promise.all(list.map(async item => {
            const chat = await ChatModel.find({user: item._id, seen: false, senderType: true})
            const chatTime = await ChatModel.find({ user: item._id })
                .sort({ createdAt: -1 })
                .limit(1)
                // .distinct('createdAt'); 
            const userInfo = await UserModel.findById(item._id); 
            // console.log(chatTime);
            
            return {
                user: userInfo,
                count: chat.length,
                chat: chatTime[0]
            };
        }))
        socket.emit('adminNumberFirst', array)
        // console.log('wdqwd',array);
        
    })

    socket.on("number", async (user) => {
        const chat = await ChatModel.find({user, seen: false, senderType: false})
        numberChat[user] = chat.length;
        socket.emit('numberFirst', numberChat[user])
        // console.log("t: ", numberChat[user]);
        
    })

    socket.on('join', (user) => {
        const loadMessages = async () => {
            try {             
                console.log('join')
                if (!userInRoom[user]) {
                    userInRoom[user] = new Set();
                }
                userInRoom[user].add(socket.id);
                numberChat[user] = 0;
                socket.emit('removeNumber', numberChat[user]);
                socket.join(user)
                // console.log('a',userInRoom[user]);
                // console.log('connect', userInRoom);
                
                const messages = await ChatModel.find({user}).sort({createdAt: 1});
                socket.emit('chat', messages)
                await ChatModel.updateMany({user, seen: false, senderType: false}, {seen: true})
            } catch (error) {
                console.log(error)
            }
        }
        loadMessages()
    })

    socket.on('adminJoin', (user) => {
        const loadMessages = async () => {
            try {             
                if (!userInRoom[user]) {
                    userInRoom[user] = new Set();
                }
                userInRoom[user].add(socket.id);
                
                io.emit('adminRemoveNumber', user);
                socket.join(user)
                // console.log('a',userInRoom[user]);

                // console.log('aa',socket.id);

                const messages = await ChatModel.find({user}).sort({createdAt: 1});
                socket.emit('chat', messages)
                await ChatModel.updateMany({user, seen: false, senderType: true}, {seen: true})
                
            } catch (error) {
                console.log(error)
            }
        }
        loadMessages()
    })

    socket.on('newMessage', async (msg) => {
        try {
            const newMessage = new ChatModel(msg)
            await newMessage.save()
            io.to(msg.user).emit('message', msg);
            if (!msg.senderType) {
                const socketId = userSocketMap[msg.user];
                if (Array.from(userInRoom[msg.user]).includes(socketId)) {
                    await ChatModel.updateMany({user: msg.user, seen: false, senderType: false}, {seen: true})
                    numberChat[msg.user] = 0;
                } else {
                    numberChat[msg.user] = (numberChat[msg.user] || 0) + 1;
                }
                io.to(socketId).emit('addNumber', numberChat[msg.user]);
                io.to(msg.user).emit('newMessAdmin', {
                    user: await UserModel.findById(msg.user),
                    chat: msg
                });
            } else {
                let num
                const socketId = userSocketMap['adminId'];
                if (Array.from(userInRoom[msg.user]).includes(socketId)) {
                    await ChatModel.updateMany({user: msg.user, seen: false, senderType: true}, {seen: true})
                    num = 0
                } else {
                    num = 1;
                }
                const data = {
                    user: await UserModel.findById(msg.user),
                    count: num,
                    chat: msg
                }
                io.to(socketId).emit('adminAddNumber', data);
            }
            
        }catch(err) {
            console.log(err)
        }
    })
    
    socket.on("leave", (user) => {
        socket.leave(user)
        if (userInRoom[user]) {
            userInRoom[user].delete(socket.id);
            // console.log("leave", userInRoom[user].size)
        }
    })

    socket.on("disconnect", () => {
        console.log("disconnect")
        delete userSocketMap[userId];
        for (const user in userInRoom) {
            if (userInRoom[user].has(socket.id)) {
                userInRoom[user].delete(socket.id);
                break;
            }
        }
    })
})

mongoose.connect(process.env.DB_CONNECTION_STRING)
.then(() => console.log('Connected!'))
.catch((error) => console.error('Connection error:', error));

app.use(cors({credentials: true, origin: ['http://localhost:3000', 'http://localhost:3002', 'exp://10.10.45.210:8081', 'http://10.10.45.210:8081'],}));

app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

routes(app);

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})