import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import env from "dotenv"

env.config()

const app = express();
const port = 3000;
const db = new pg.Client({
  user : process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT
});

db.connect()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try{
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  if (checkResult.rows.length >0){
    res.send("Email already exist")
  } else {
    const result = await db.query( "INSERT INTO users (email, password) VALUES ($1, $2)  ",
    [email, password]);
    if (result.rowCount==1){
      res.render("secrets.ejs")
    }}
  } catch(error){
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try{
     const result = await db.query("SELECT * FROM users WHERE email = $1", [email])
  if (result.rows.length > 0){
    const user = result.rows[0]
    const storedPassword = user.password;
    if (password == storedPassword){
       res.render("secrets.ejs")
    } else{
      res.send("Incorrect password")
    }
  } else {
    res.send("User does not exist")
  }
  } catch (err){
    console.log(err);
  }
 
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
