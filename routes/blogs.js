var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var middleware = require("../middleware");
var User = require("../models/user");

// INDEX - show all campgrounds
router.get("/", function(req, res) {
  var perPage = 4;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  Blog.find({})
    .sort({ created: -1 })
    .skip(perPage * pageNumber - perPage)
    .limit(perPage)
    .exec(function(err, allBlogs) {
      Blog.count().exec(function(err, count) {
        if (err) {
          console.log(err);
        } else {
          res.render("blogs/index", {
            blogs: allBlogs,
            current: pageNumber,
            pages: Math.ceil(count / perPage)
          });
        }
      });
    });
});

// router.get("/", function(req, res) {
//   Blog.find({})
//     .sort({ created: -1 })
//     .limit(8)
//     .exec(function(err, allBlogs) {
//       if (err) {
//         console.log(err);
//       } else {
//         res.render("blogs/index", { blogs: allBlogs });
//       }
//     });
// });

//============
// POST Routes
//============
//CREATE - add new blog to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
  //get data from form and add to blogs array
  var title = req.body.title;
  var image = req.body.image;
  var body = req.body.body;
  var created = req.body.created;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newBlog = {
    title: title,
    image: image,
    body: body,
    created: created,
    author: author
  };

  Blog.create(newBlog, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      //redirect back to blogs page
      res.redirect("/blogs");
    }
  });
});
//==================
// Create new Routes
//==================

router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("blogs/new");
});

//============
//Show route
//==============
router.get("/:id", function(req, res) {
  Blog.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundBlog) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundBlog);
        res.render("blogs/show", { blog: foundBlog });
      }
    });
});

//edit route
router.get("/:id/edit", middleware.checkblogOwnership, function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    res.render("blogs/edit", { blog: foundBlog });
  });
});

// UPDATE  ROUTE
router.put("/:id", middleware.checkblogOwnership, function(req, res) {
  // find and update the correct blog
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(
    err,
    updatedBlog
  ) {
    if (err) {
      res.redirect("/blogs");
    } else {
      //redirect somewhere(show page)
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// Delete ROUTE
router.delete("/:id", middleware.checkblogOwnership, function(req, res) {
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

module.exports = router;
