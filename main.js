if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const cookieParser = require("cookie-parser");
const server = require("http").Server(app);
const socket = require("socket.io");
const FRONT_END =
    process.env.NODE_ENV === "dev"
        ? "http://localhost:3000"
        : "https://singular-queijadas-ca4faf.netlify.app";
const io = socket(server, {
    cors: {
        origin: FRONT_END,
        methods: ["GET", "POST"],
    },
});
const cors = require("cors");

// SETTINGS
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
app.use(cors());

// IO
io.on("connection", (socket) => {
    socket.on("connected", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("new-user", userId);
    });

    socket.on("disconnect-user", (roomId, userId) => {
        socket.to(roomId).emit("disconnect-user", userId);
    });
});

// ROUTES
app.get("/:room", (req, res) => {
    res.json({ roomId: req.params.room });
});

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));
