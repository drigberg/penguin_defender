const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static("public"));
app.set("views", "./views");
app.set("view engine", "pug");

app.get("/", function (req, res){
    res.render("index");
});

app.get("/testbed", function (req, res){
    res.render("testbed");
});

app.listen(PORT, function(err){
    console.log(`Server is running on port ${PORT}`);
});