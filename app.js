var express     = require("express"),
    bodyParser = require("body-parser"),
    mongoose    = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    app         = express();

//APP Config
mongoose.connect("mongodb://localhost/blog_app",{useMongoClient: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


//mongoose/model config
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

//Restful routes

app.get("/",function(req,res){
  res.redirect("/blogs");
});

//main page routes
app.get("/blogs",function(req,res){
  Blog.find({}, function(err,blogs){
    if(err){
      console.log("error");
    }else{
      res.render("index.ejs", {blogs:blogs});
    }
  });

});

//new blog routes
app.get("/blogs/new", function(req,res){
  res.render("new");
});

//blogs post routes
app.post("/blogs", function(req,res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog , function(err,newPost){
    if(err){
      res.render("new");
    }else{
      res.redirect("/blogs");
    }
  });
});

//show route
app.get("/blogs/:id",function(req,res){
  Blog.findById(req.params.id, function(err, showPost){
    if(err){
      console.log(err);
    }else {
      res.render("show", {blog: showPost});
    }
  });
});

//edit route
app.get("/blogs/:id/edit", function(req,res){
  Blog.findById(req.params.id,function(err,editBlog){
    if(err){
      res.redirect("/blogs");
    }else {
      res.render("edit", {blog:editBlog});
    }
  });
});

//update route
app.put("/blogs/:id", function(req,res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updateBlog){
    if(err){
      res.redirect("/blogs");
    }else{
      res.redirect("/blogs/"+ req.params.id);
    }
  });
});

//delete route
app.delete("/blogs/:id",function(req,res){
  Blog.findByIdAndRemove(req.params.id,function(err){
    if(err){
      res.redirect("/blogs");
    }else {
      res.redirect("/blogs");
    }
  });
});

app.listen(80,function(){
  console.log("blog_app server is running");
})
