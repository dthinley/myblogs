var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  Blog = require("./models/blog"),
  Comment = require("./models/comment"),
  methodOverride = require("method-override"),
  User = require("./models/user");

var blogRoutes = require("./routes/blogs");
commentRoutes = require("./routes/comments");
indexRoutes = require("./routes/index");

mongoose.connect(
  "mongodb://dorjee:Windhorse231@ds115762.mlab.com:15762/blog_app",
  { useNewUrlParser: true }
);
//mongodb://dorjee:Windhorse231@ds115762.mlab.com:15762/blog_app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
//======================
//Passport configuration
//======================
app.use(
  require("express-session")({
    secret: "this is secret ",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);
app.use("/blogs", blogRoutes);
app.use("/blogs/:id/comments", commentRoutes);

app.listen(process.env.PORT || 5000, function() {
  console.log("The Server Has Started!");
});
