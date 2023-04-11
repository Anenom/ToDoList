//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-anenom:Test123@cluster0.plytnep.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to aff a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

Item.find().
then(items => {
if(items.length === 0) {
  Item.insertMany(defaultItems)
  .then (function(){
    console.log("Successfully saved all the items to todolist");
res.redirect("/");

  }).catch(function (error) {
    console.log(error)
  })
}else {
      res.render("list", {listTitle: "Today", newListItems: items});
  }
})
.catch(err => {
  console.log(err);
});
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);


 List.findOne({name: customListName}).then(foundList =>{


   if(!foundList) {
     const list = new List ({
       name: customListName,
       items: defaultItems
     });


     list.save();
     console.log("Saved");
     res.redirect("/" + customListName);
   } else {
     res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
   }

}).catch(err => {});
});



app.post("/", function(req, res){

const itemName =  req.body.newItem;
const listName = req.body.list;

const item = new Item ({
  name: itemName
});

if(listName === "Today") {
  item.save();
  res.redirect("/");
} else {
  List.findOne({name: listName}).then(function(foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }).catch(err =>{});
}

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId).then(function(del){
  if(del){
    console.log("deleted");
  }
})
res.redirect("/");
} else {
  List.findOneAndUpdate({name: listName},
  {$pull: {items: {_id: checkedItemId}}},
{new: true})
.then(foundList => {
  res.redirect("/" + listName);
}).catch (err =>{
  console.log(err);
})
}

});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
