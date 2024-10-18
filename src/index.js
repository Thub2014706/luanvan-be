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

io.on("connection", (socket) => {
    // let users = {}

    socket.on('listUser', async (user) => {
        let list = []
        if (await StaffModel.findById(user)) {
            list = await ChatModel.distinct('user');
        }
        const data = await Promise.all(list.map(async item => {
            return await UserModel.findById(item)
        }))
        socket.emit('userList', data);
    })

    socket.on('join', (user) => {
        const loadMessages = async () => {
            try {             
                // users[user] = socket.id
                socket.join(user)
                const messages = await ChatModel.find({user}).sort({createdAt: 1}).exec();
                socket.emit('chat', messages)
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
            io.to(msg.user).emit('message', msg)
        }catch(err) {
            console.log(err)
        }
    })

    // socket.on("numberMess", () => {
    // })

    socket.on("disconnect", () => {
        console.log("disconnect")
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