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
      origin: ['http://localhost:3000', 'http://localhost:3002'],
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
    // console.log('connect', io.sockets.sockets);

    socket.on('listUser', async (user) => {
        let list = []
        if (await StaffModel.findById(user)) {
            list = await ChatModel.aggregate([
                {$group: { _id: "$user", lastMess: { $max: "$createdAt" }}},
                {$sort: {lastMess: -1}}
            ]);
        }
        // console.log(list);
        const users = list.map(item => item._id)
        
        const data = await Promise.all(users.map(async item => {
            return await UserModel.findById(item)
        }))
        socket.emit('userList', data);
    })
    
    // socket.on("adminNumber", async (user) => {
    //     const chat = await ChatModel.find({user, seen: false, senderType: true})
    //     numberChat[user] = chat.length;
    //     io.emit('adminNumber', numberChat[user])
    //     // console.log(chat.length);
        
    // })

    socket.on("number", async (user) => {
        const chat = await ChatModel.find({user, seen: false, senderType: false})
        numberChat[user] = chat.length;
        socket.emit('numberFirst', numberChat[user])
        // console.log("t: ", numberChat[user]);
        
    })

    socket.on('join', (user) => {
        const loadMessages = async () => {
            try {             
                if (!userInRoom[user]) {
                    userInRoom[user] = new Set();
                }
                userInRoom[user].add(socket.id);
                numberChat[user] = 0;
                socket.emit('removeNumber', numberChat[user]);
                socket.join(user)
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
                // numberChat[user] = 0;
                // io.emit('adminNumber', numberChat[user]);
                socket.join(user)
                const messages = await ChatModel.find({user}).sort({createdAt: 1});
                socket.emit('chat', messages)
                await ChatModel.updateMany({user, seen: false, senderType: true}, {seen: true})
                console.log(123);
                
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
            if (userInRoom[msg.user] && userInRoom[msg.user].size > 1) {
                await ChatModel.updateMany({user: msg.user, seen: false}, {seen: true})
                numberChat[msg.user] = 0;
            } else {
                numberChat[msg.user] = (numberChat[msg.user] || 0) + 1;
            }
            const socketId = userSocketMap[msg.user];
            console.log(numberChat[msg.user]);
            io.to(socketId).emit('addNumber', numberChat[msg.user]);
            
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
                console.log(`${user} disconnected, remaining connections: ${userInRoom[user].size}`);
                break;
            }
        }
    })
})

mongoose.connect(process.env.DB_CONNECTION_STRING)
.then(() => console.log('Connected!'))
.catch((error) => console.error('Connection error:', error));

app.use(cors({credentials: true, origin: ['http://localhost:3000', 'http://localhost:3002'],}));
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

routes(app);

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})