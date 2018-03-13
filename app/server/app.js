const express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    util = require("./util"),
    logger = require('morgan');

//config
const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "build")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

//route definition
app.get("/source/:name", function(req, res, next) {
    util.formatFinal(req.params.name).then(result => {
        console.log(result);
        res.json(result);
    });
});

app.get("*", (req, res) => {
    res.sendFile("build/index.html", { root: global });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;