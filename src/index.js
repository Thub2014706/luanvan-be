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
const userConnections = {};
io.on("connection", (socket) => {
    // let userInRoom = {}
    // let number = {}

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

    socket.on('join', (user) => {
        const loadMessages = async () => {
            try {             
                if (!userConnections[user]) {
                    userConnections[user] = new Set();
                }
                userConnections[user].add(socket.id);
                socket.join(user)
                // console.log('join', userConnections[user], socket.id);    
                const messages = await ChatModel.find({user}).sort({createdAt: 1});
                socket.emit('chat', messages)
                // if (userConnections[user].size > 0) {
                //     await ChatModel.updateMany({user, seen: false}, {seen: true})
                // }
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
                if (!userConnections[user]) {
                    userConnections[user] = new Set();
                }
                userConnections[user].add(socket.id);
                socket.join(user)
                // console.log('join', userConnections[user], socket.id);    
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
            // console.log("socket", socket.id)

            if (userConnections[msg.user] && userConnections[msg.user].size > 1) {
                await ChatModel.updateMany({user: msg.user, seen: false}, {seen: true})
            }
            
        }catch(err) {
            console.log(err)
        }
    })

    socket.on("number", async (user) => {
        const chat = await ChatModel.find({user, seen: false, senderType: false})
        socket.emit('number', chat.length)
        // console.log(chat.length);
        
    })
    
    socket.on("leave", (user) => {
        socket.leave(user)
        if (userConnections[user]) {
            userConnections[user].delete(socket.id);
            // console.log("leave", userConnections[user].size)
        }
    })

    socket.on("disconnect", () => {
        console.log("disconnect")
        for (const user in userConnections) {
            if (userConnections[user].has(socket.id)) {
                userConnections[user].delete(socket.id);
                console.log(`${user} disconnected, remaining connections: ${userConnections[user].size}`);
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