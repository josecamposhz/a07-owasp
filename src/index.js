const express = require("express");
const exphbs = require("express-handlebars");
const requiresAuth = require('./middlewares/requiresAuth');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.engine(
  "hbs",
  exphbs.engine({
    extname: '.hbs',
    defaultLayout: "main",
    layoutsDir: "./src/views/layouts",
    partialsDir: "./src/views/components",
  })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/profile", requiresAuth, (req, res) => {
  res.render("profile", { user: req.user });
});

// API REST
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));