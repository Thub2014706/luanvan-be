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

const port = process.env.PORT || 3001;
dotenv.config();

const io = new Server(server, {
  cors: {
      origin: "*"
  }
})

io.on("connection", (socket) => {
  // console.log("connected");

  const loadMessages = async () => {
      try {
          const messages = await ChatModel.find().sort({timeStamp : 1}).exec();
          socket.emit('chat', messages)
      } catch(err) {
          console.log(err)
      }
  }
  loadMessages();

  socket.on('newMessage', async (msg) => {
      try {
          const newMessage = new ChatModel(msg)
          await newMessage.save()
          io.emit('message', msg)
      }catch(err) {
          console.log(err)
      }
  })

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