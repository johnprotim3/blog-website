const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();

var homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare.";
var aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque.";
var contactContent = "Scelerisque eleifend donec pretium vulputate sapien.";
var currentCategoryToDeletePost = '';

//const admin = "jhonprotim@blogpost.com";
//const adminPassword = "nothingtoworry";

app.enable('trust proxy');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false,
  }))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://johnprotim:nothingtoworry1122@blog.ufehqge.mongodb.net/blogDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(express.static("public"));
app.set('view engine', 'ejs');

const adminSchema = new mongoose.Schema({
  email:String,
  password: String
});

adminSchema.plugin(passportLocalMongoose);
const Admin = new mongoose.model('Admin', adminSchema);

// use static authenticate method of model in LocalStrategy
passport.use(Admin.createStrategy());
// use static serialize and deserialize of model for passport session support
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: String

});
const Post = mongoose.model('Post', postSchema);

const categorizedPostSchema = new mongoose.Schema({
  category: {
    type:String,
    required: true
  },
  postsInThisCategory:[postSchema]
});

const CategorizedPost = mongoose.model('Categorizedpost', categorizedPostSchema);

const defaultContentsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  content: String
});

const DefaultContent = mongoose.model('Defaultcontent', defaultContentsSchema);


app.get('/', function(req, res) {
  
  /*Admin.register({username: admin}, adminPassword, function(err, user){
    if(err)
    {
        console.log("Registration error " +err);
    }
    else{
        passport.authenticate("local")(req, res, function(){
            //res.redirect('/secrets');
        })
    }
  })*/


  Post.find({}, function(err, foundposts){
    if(!err){
      //Find the Default home content from the DefaultContent Collection
      DefaultContent.findOne({name: 'home'}, function(error, foundContent){
        // Pass the post coolection where all the posts are saved.
        //In the home page we want to show only the last five that means the last five posts admin has post ;
        if(foundContent){ //IF The Admin has put any home content
          res.render('home', {
            homeDefaultContent: foundContent.content,
            allPosts: foundposts
          });
        }
        else{ //IF The Admin has not put any home content
          res.render('home', {
            homeDefaultContent: homeStartingContent,
            allPosts: foundposts
          });
        }

      });
    }
  });

});

app.get('/about', function(req, res) {
  //Find the Default about us content from the DefaultContent Collection
  DefaultContent.findOne({name: 'about'}, function(error, foundContent){
    // Pass the post coolection where all the posts are saved.
    //In the home page we want to show only the last five that means the last five posts admin has post ;
    if(foundContent){ //IF The Admin has put any about us content
      res.render('about', {
        aboutDefaultContent: foundContent.content,
      });
    }
    else{ //IF The Admin has not put any about us content
      res.render('about', {
        aboutDefaultContent: aboutContent
      });
    }
  });
});


app.get('/compose', function(req, res) {
  if(req.isAuthenticated()){
    //Search in the   CategorizedPost Collections and pass the collection as an array
    //Then Compose.ejs page should show all the categories from the array
    CategorizedPost.find({}, function(err, foundPosts){
      if(foundPosts){
        res.render('compose',{
          foundCatagories: foundPosts
        });
      }
    });
  }else{
      res.redirect('/login');
  }
});


app.post('/compose', function(req, res) {
  const capitalizeTitle =  _.capitalize(req.body.postTitle);
  const capitalizedCategory = _.capitalize(req.body.categoryName);
    //console.log(req.body);
      const post = new Post({
        title: capitalizeTitle,
        body: req.body.postBody,
      });
      post.save();
        //First Find The Catagory
        CategorizedPost.findOne({category: capitalizedCategory}, function(err, foundCategory){
          //if category prevoiusly existed in the db then add new post in this category
          if(foundCategory){
            //console.log("Found Category");
            foundCategory.postsInThisCategory.push(post);
            foundCategory.save();
          }
            //if category prevoiusly did not existed in the db then create a category and add the new item
            else{
              //console.log("Did Not Found Category");
              const categorizedPost = new CategorizedPost({
                category: capitalizedCategory,
                postsInThisCategory:[post]
              });
              categorizedPost.save();
            }
        });
      res.redirect('/adminpanel');

});


app.get('/posts/:postName', function(req, res) {
  const capitalizeTitle = req.params.postName;
  Post.findOne({title: capitalizeTitle}, function(err, foundPost){
      if(!err){
        res.render('post', {
          postTitle: foundPost.title,
          postBody: foundPost.body
        });
      }
  });
});


//Select the category that user want to see the post
app.get('/categoryselect', function(req, res){
  //res.send("Category Select Page");
  //Find in the CategorizedPost collection and pass the whole collection as an array
  //Then categorylist.ejs page should show all the categories from the array
  CategorizedPost.find({}, function(err, foundPosts){
    if(foundPosts){
      res.render('categorylist',{
        foundCatagories: foundPosts
      });
    }
  });
});

app.post('/categoryselect', function(req, res){
  //res.send("Category Select Post request recieved");
  //Search in the CategorizedPost collection and find the selectedCategory
  CategorizedPost.findOne({category: req.body.selectedCategory}, function(err, foundPosts){
    if(foundPosts){
      res.render('postsinselectedcategory',{
          category: req.body.selectedCategory,
          allPosts: foundPosts.postsInThisCategory
      });
    }
  });
});

app.get('/deletecategoryselect', function(req, res){
  if(req.isAuthenticated()){
      // Search in the   CategorizedPost Collections and pass the collection as an array
      // Then deleteCategorySelect.ejs page should show all the categories from the array

    CategorizedPost.find({}, function(err, foundPosts){
      if(foundPosts){
        res.render('deletecategoryselect',{
          foundCatagories: foundPosts
        });
      }
    });

  }else{
      res.redirect('/login');
  }
});


app.post('/deletecategoryselect', function(req, res){
  //console.log(req.body.selectedCategory);
  let selectedCategory = req.body.selectedCategory;
  currentCategoryToDeletePost = selectedCategory;

  //Search in the CategorizedPost collection and find the category
  CategorizedPost.findOne({category: selectedCategory}, function(err, foundPosts){
    if(foundPosts){
      res.render('categorizedPostsListToDelete', {
        category: selectedCategory,
        allPosts: foundPosts.postsInThisCategory
      });
    }
  });
});

app.get('/deletepost/:postName', function(req, res) {
  const capitalizeTitle = req.params.postName;
  Post.findOne({title: capitalizeTitle}, function(err, foundPost){
      if(!err){
        res.render('deletepost', {
          postTitle: foundPost.title,
          postCategory: currentCategoryToDeletePost,
          postBody: foundPost.body
        });
      }
  });
});

//For Deleting the post from Post and CategorizedPost Collection
app.post('/deletepost', function(req, res){
  //console.log(req.body);
  //Finding and deleting the post from Post Collection
  Post.findOneAndDelete({title: req.body.postToDelete}, function(err, foundPost){
      if(foundPost){
        //console.log(foundPost);
        //Delete the post form CategorizedPost Collection
        conditions = {category: req.body.CategoryToDeletePost}
        update = {$pull: {postsInThisCategory: {_id: foundPost._id}}}
        CategorizedPost.findOneAndUpdate(conditions, update, function(err, found){
          if(!err){
            //If Successfully Deleted then first console and return to home page for now
            //After Everything is completed it should redirect to admin panel
            //console.log("Deleted Successfully");
            res.redirect("/adminpanel");
          }
        });
      }
    });
});

//Serve the change home content page to admin
app.get('/changehomecontent', function(req, res){
  if(req.isAuthenticated()){
    res.render('changehomecontent');
  }else{
      res.redirect('/login');
  }
});

//Recieve the text that has to be change in home content
app.post('/changehomecontent', function(req, res){
  //console.log("New Home Text " + req.body.newHomeText);
  homeStartingContent = req.body.newHomeText;
  //Search in Deafult Contect collection if previously some content named home exist then delete it
  DefaultContent.findOneAndDelete({name:'home'}, function(err, docs){
    if(!err){
      console.log("Previous home content deleted");
    }
  });
  //After deleting saving the new content
  const homeContent = new DefaultContent({
    name: 'home',
    content: homeStartingContent
  });
  homeContent.save();
  res.redirect("/adminpanel");
});

//Serve the change about us content page to admin
app.get('/changeaboutus', function(req, res){
  if(req.isAuthenticated()){
    res.render('changeaboutuscontent');
  }else{
      res.redirect('/login');
  }
    
});

//Recieve the text that has to be change in about us content
app.post('/changeaboutus', function(req, res){
  aboutContent = req.body.newAboutusText;
  //Search in Deafult Contect collection if previously some content named about exist then delete it
  DefaultContent.findOneAndDelete({name:'about'}, function(err, docs){
    if(!err){
      console.log("Previous about us content deleted");
    }
  });
  //After Deletin save the about us content
  const aboutChangedcontent = new DefaultContent({
    name: 'about',
    content: aboutContent
  });
  aboutChangedcontent.save();
  res.redirect("/adminpanel")
});


app.get('/adminpanel', function(req, res){
  if(req.isAuthenticated()){
      res.render('adminpanel');
  }else{
      res.redirect('/login');
  }
})

app.get('/login', function(req,res){
  res.render('login');
});

app.post('/login', function(req, res){

  const user = new Admin({
    username: req.body.username,
    password: req.body.password
})

req.login(user, function(err){
    if(err)
    {
        console.log(err);
        res.redirect('/login');
    }
    else{
        passport.authenticate("local")(req, res, function(){
            res.redirect('/adminpanel');
        })
    }
})

});


app.get('/hello', function(req, res){

  res.send("Hello world");

})
 app.get('/name',function(req,res){
  res.send("john protim")

 }
 )

 app.get('/joy', function(req,res){
  res.send("hello joy")
 })


const port  = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});


