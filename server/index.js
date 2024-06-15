const express = require('express');
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data);
    });
    socket.on("send_message", (data) => {
        const dataWithDate = {...data, date: new Date()}
        if (!dataWithDate.room) {
            socket.broadcast.emit("receive_message", {...dataWithDate, room: 'GENERAL BROADCAST'})
        } else {
            socket.to(dataWithDate.room).emit("receive_message", dataWithDate)
        }
    });
});

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
});