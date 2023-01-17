//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const day = date.getDate();
const _=require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");
const itemsSchema = new mongoose.Schema({
  name :String
});
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Buy Food"
});
const item2 = new Item({
  name : "Cook Food"
});
const item3 = new Item({
  name : "Eat Food"
});
const defaultItems=[item1,item2,item3];


const listSchema =new mongoose.Schema({
  name :String,
  items:[itemsSchema]
});

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {



Item.find({},function(err,foundItems){

if (foundItems.length===0){
  Item.insertMany(defaultItems, function(err){
    if (err){
      console.log(err);
    } else {
      console.log("Success");
    }
  });
  res.redirect("/");
} else {
  res.render("list", {listTitle: day, newListItems: foundItems});
}
});
});

app.get("/:listUrl", function(req,res){
const listUrl=_.capitalize(req.params.listUrl);
List.findOne({name:listUrl}, function(err,foundList){
  if (!err){
    if (!foundList){

      const list =new List({
        name : listUrl,
        items : defaultItems
      });
      list.save();
      res.redirect("/"+listUrl);
    } else {
      res.render("list", {listTitle : foundList.name, newListItems:foundList.items});
    }
  }

});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item=new Item({
    name : itemName
  });

  if (listName===day){
    if (itemName!==""){
    item.save();
    res.redirect("/");
  }
  else{
    res.redirect("/");
  }
} else {
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});


app.post("/delete", function(req,res){
const deleteID = req.body.checkbox;
const listName = req.body.listName;

if (listName===day){
  Item.findByIdAndRemove(deleteID, function(err){
    if (!err){
      console.log("Successfully deleted");
    }
  });
  res.redirect("/");
} else {
  // List.findOne({name:listName}, function(err,foundList){
  //   foundList.items.forEach(function(element){
  //     console.log(element._id);
  //      console.log(deleteID);
  //
  //   console.log(element._id===deleteID);
      // {
      //   console.log(element);
      //   console.log(deleteID);
      // foundList.items = foundList.items.filter(x=> x._id!==deleteID);
      //
      // }

      // const index = (foundList.items).findIndex(prop => prop._id ===deleteID);
      // (foundList.items).splice(index,1);
    // });
  // });


  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteID}}}, function(err,foundList){
    if (!err){
      res.redirect("/"+listName);
    }
  });

}
});









app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
