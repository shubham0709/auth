const express = require('express');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const { connection } = require("./connection");
const { userModel } = require("./models/user.model");

const app = express();
const PORT = 5000;
app.use(express.json());

app.get("/", (req, res) => {
    res.send("<a href=https://github.com/login/oauth/authorize?client_id=60dece5b4238233fba87>Login via Github</a>")
})

app.post("/signup", async (req, res) => {
    let { email, password, age } = req.body;

    //after users signs up, we hash the password and store in DB.
    await bcrypt.hash(password, 10, async (err, hash) => {
        // Store hash in your password DB.
        if (err) {
            return res.send("some occured occured");
        }
        const user = new userModel({ email, password: hash, age })
        await user.save();
        res.send("resgistering new user on the way !!");
    });
})

app.post("/login", async (req, res) => {
    //generate TOKEN when user logs-In
    let { email, password } = req.body;

    let fetched = await userModel.findOne({ email });

    let hash = fetched.password;

    console.log(fetched);

    await bcrypt.compare(password, hash, async (err, result) => {
        if (err) {
            return res.send("something went wrong !!");
        }
        if (result == false) {
            return res.send("invalid creds");
        } else {
            const token = await jwt.sign({
                email: fetched.email,
                age: fetched.age,
                id: fetched._id
            },
                "fir_koyi_hai");

            if (fetched) {
                return res.send({ message: "Login successful", token: token });
            } else {
                return res.send("invalid credentials");
            }
        }
    });
})

app.get("/profile/:id", async (req, res) => {
    const { id } = req.params;
    const [bearer, token] = req.headers.authorization.split(" ");
    console.log(bearer, token);
    await jwt.verify(token, "fir_koyi_hai", (err, decoded) => {
        if (err) {
            return res.send("login again");
        }
    })
    try {
        let fetched = await userModel.findOne({ _id: id });
        res.send(fetched);
    } catch (err) {
        res.send("some error occured");
    }
})

app.get("/dashboard", (req, res) => {
    console.log(req.query);
    res.send("only fot github O-Auth");
})


//60dece5b4238233fba87

app.listen(PORT, async () => {
    try {
        await connection;
        console.log("connection successfull !!");
    } catch (err) {
        console.log("some error occured !!");
    }
    console.log("server started on PORT : " + PORT);
})










