const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const app = express();

app.enable('trust proxy');
app.set('view engine', 'ejs');
mongoose.connect('mongodb+srv://ranashill:adminrana@ranashillblogwebsiteclu.y5aqm.mongodb.net/blogDB');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

var homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare.";
var aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque.";
var contactContent = "Scelerisque eleifend donec pretium vulputate sapien.";
var currentCategoryToDeletePost = '';
const admins = ["ranakanti", "rockyshill"];
const adminpasswords = ["Ch+T_jbDcN=x_e5t", "W2#W$QtB2fB#REvZ"];

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


app.get('/IwAR32a0SgMkjYQRu9EAfgulJbuptxKJxEAWvw95TQ8gKEgnfsPsTWGrrjop8composeIwAR32a0SgMkjYQRu9EAfgulJbuptxKJxEAWvw95TQ8gKEgnfsPsTWGrrjop8', function(req, res) {
  //Search in the   CategorizedPost Collections and pass the collection as an array
  //Then Compose.ejs page should show all the categories from the array
  CategorizedPost.find({}, function(err, foundPosts){
    if(foundPosts){
      res.render('compose',{
        foundCatagories: foundPosts
      });
    }
  });
});


app.post('/IwAR32a0SgMkjYQRu9EAfgulJbuptxKJxEAWvw95TQ8gKEgnfsPsTWGrrjop8composeIwAR32a0SgMkjYQRu9EAfgulJbuptxKJxEAWvw95TQ8gKEgnfsPsTWGrrjop8', function(req, res) {
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
      res.redirect('/jop895TQwuofhro-ynbadminpanel-nye-zainwuofhro-ynbadminpanelvdd-zain-nye');

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

app.get('/B79F7HZbd0j24vqcUiS68xVLOJlCixT33M2YchS0ellvHDoJZirxFJ89qdeletecategoryselectB79F7HZbd0j24vqcUiS', function(req, res){
  // Search in the   CategorizedPost Collections and pass the collection as an array
  // Then deleteCategorySelect.ejs page should show all the categories from the array
  CategorizedPost.find({}, function(err, foundPosts){
    if(foundPosts){
      res.render('deletecategoryselect',{
        foundCatagories: foundPosts
      });
    }
  });
});


app.post('/B79F7HZbd0j24vqcUiS68xVLOJlCixT33M2YchS0ellvHDoJZirxFJ89qdeletecategoryselectB79F7HZbd0j24vqcUiS', function(req, res){
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

app.get('/v7F51kyRQIJ6O3yRRwmKvo-JUiSdF2Bvc2l9fDsHaOiWkbul-deletepost-OYCdO5XfasiT8pgmIwIudl2d66r58A2DtfKw/:postName', function(req, res) {
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
app.post('/v7F51kyRQIJ6O3yRRwmKvo-JUiSdF2Bvc2l9fDsHaOiWkbuldeletepostOYCdO5XfasiT8pgmIwIudl2d66r58A2DtfKw', function(req, res){
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
            res.redirect("/jop895TQwuofhro-ynbadminpanel-nye-zainwuofhro-ynbadminpanelvdd-zain-nye");
          }
        });
      }
    });
});

//Serve the change home content page to admin
app.get('/6usggun3ZNN1Gd3TyQvJcC8O25OKEEff9zVzNmjchangehomecontentJbuptxKJJbuptxKJ', function(req, res){
  //res.send("Change Home Content Page")
  res.render('changehomecontent');
});

//Recieve the text that has to be change in home content
app.post('/6usggun3ZNN1Gd3TyQvJcC8O25OKEEff9zVzNmjchangehomecontentJbuptxKJJbuptxKJ', function(req, res){
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
  res.redirect("/jop895TQwuofhro-ynbadminpanel-nye-zainwuofhro-ynbadminpanelvdd-zain-nye");
});

//Serve the change about us content page to admin
app.get('/rRgbcAeBO8SNBwyz53G6CsHoyjuTp6wuyfouCNchangeaboutusVcXc9O7X3JRUkI9RtfLD1gU', function(req, res){
    res.render('changeaboutuscontent');
});

//Recieve the text that has to be change in about us content
app.post('/rRgbcAeBO8SNBwyz53G6CsHoyjuTp6wuyfouCNchangeaboutusVcXc9O7X3JRUkI9RtfLD1gU', function(req, res){
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
  res.redirect("/jop895TQwuofhro-ynbadminpanel-nye-zainwuofhro-ynbadminpanelvdd-zain-nye")
});




app.get('/jop895TQwuofhro-ynbadminpanel-nye-zainwuofhro-ynbadminpanelvdd-zain-nye', function(req, res){
    res.render('adminpanel');
})


app.post('/ranaviloginkorbe', function(req, res){
  let username = req.body.username;
  let password = req.body.password;
  username = _.lowerCase(username); //Converting the username to all lowerCase

  //console.log("Username = " + username);
  //console.log("Password = " + password);
  //Checking if the username and password is matching for any of the two admins
  if(username === admins[0] && password === adminpasswords[0]){
    res.redirect('/jop895TQwuofhro-ynbadminpanel-nye-zainwuofhro-ynbadminpanelvdd-zain-nye');
  }

  else if(username === admins[1] && password === adminpasswords[1]){
    res.redirect('/jop895TQwuofhro-ynbadminpanel-nye-zainwuofhro-ynbadminpanelvdd-zain-nye');
  }

  else{
    res.redirect('/ranaviloginkorbe');
  }

});

app.get('/:ranaviloginkorbe', function(req,res){
  // This line converts the string that is put by admin to all lowercase
  if(_.lowerCase(req.params.ranaviloginkorbe) === 'ranaviloginkorbe'){
    res.render('login');
  }

});

const port  = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});
