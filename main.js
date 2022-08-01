if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const cookieParser = require("cookie-parser");
const server = require("http").Server(app);
const socket = require("socket.io");
const natural = require("natural");
var stemmer = natural.PorterStemmer;
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

function synonyms(word){
	switch (word) {
		case "sad":
			return(["sad", "unhappy", "sorrowful", "dejected", "regretful", "depress", "miserable", "downhearted", "down"])
			break;
		
		case "angry":
			return(["angry","anger", "irate", "annoyed", "cross", "vexed", "furious", "irritated", "engraged", "rage"])

		case "happy":
			return(["happy", "jolly", "joking", "delighted", "cheerful", "elated", "joyful", "joyous", "glad", "blissful"])

		default:
			break;
	}
};

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

app.get("/verifyans", (req, res) => {
    var sc = 0
    synonyms(req.query.ans1).some(function(element, index) {
        if (stemmer.stem(element)===stemmer.stem(req.query.vid)) {
            sc += 1
            return true;
        }
    });

    synonyms(req.query.ans2).some(function(element, index) {
        if (stemmer.stem(element)===stemmer.stem(req.query.aud)) {
            sc += 1
            return true;
        }
    });
    
    if (sc === 2) {
        console.log("SUIIIII")
        res.json("ITISDONE");
    } else {
        console.log("dedge")
        res.json("skillissue");
    }


})

app.get("/v", (req, res) => {res.send("42")})
// ROUTES
app.get("/:room", (req, res) => {
    res.json({ roomId: req.params.room });
});

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));
``