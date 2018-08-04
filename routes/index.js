var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Blog = require("../models/blog");

//============
//Routes
//===========

//index routes
router.get("/", function(req, res) {
  res.redirect("landing");
});

router.get("/landing", function(req, res) {
  Blog.find({})
    .sort({ created: -1 })
    .limit(3)
    .exec(function(err, allBlogs) {
      if (err) {
        console.log(err);
      } else {
        res.render("landing", { blogs: allBlogs });
      }
    });
});

//================
//AUTH routes
//===============

// show register form
router.get("/register", function(req, res) {
  res.render("register");
});
//handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username,
    firstName: req.body.username,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar
  });
  if (req.body.adminCode === "secret") {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("register");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome to myblog" + " : " + user.username);
      res.redirect("/blogs");
    });
  });
});

// show login form
router.get("/login", function(req, res) {
  res.render("login");
});

//handel login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"
  }),
  function(req, res) {
    req.flash("success", "Welcome to myblog" + " : " + user.username);
  }
);

//show logout form
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out, see you again!");
  res.redirect("/blogs");
});

// USER PROFILE
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Blog.find()
      .where("author.id")
      .equals(foundUser._id)
      .exec(function(err, blogs) {
        if (err) {
          req.flash("error", "Something went wrong.");
          return res.redirect("/");
        }
        res.render("users/show", { user: foundUser, blogs: blogs });
      });
  });
});
module.exports = router;
