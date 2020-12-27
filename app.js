//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose =require("mongoose");
const _ =require("lodash");

const app = express();

mongoose.connect("mongodb+srv://kylieyoo55:yooy2242@cluster0.s7syc.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

//instructiong schema
const itemSchema = new mongoose.Schema({
  name: String
})

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

//make models
const Item = mongoose.model("Item",itemSchema)
const List = mongoose.model("List",listSchema)

//inputs of items
const item1 =new Item({
name:"Welcome to My Todos List"
})

const item2 =new Item({
  name:"Hit '+' to save , and tick to delete"
  })




const requestItems=[item1,item2]


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//loading homepage
app.get("/", function(req, res) {

  
Item.find({},(err,founditems)=>{

  if(founditems.length ===0){
    Item.insertMany(requestItems,(err)=>{
      if(err){console.log(err);}
      else{console.log("Success");}
    })
    res.redirect("/");
  }else{
    const day = date.getDate();
res.render("list",{listTitle: "Today", newListItems:founditems})
  }
})

});

//if get to custom Route
app.get("/:customListName",(req,res)=>{
const customListName = req.params.customListName;
const nameCapitalised= _.capitalize(customListName)
// const nameCapitalised = customListName.charAt(0).toUpperCase() + customListName.slice(1)

List.findOne({name:customListName},(err,foundList)=>{
if(!err){
  if(!foundList){

    const list =new List({
      name:customListName,
      items:requestItems
    })
    list.save();
    res.redirect("/"+customListName);
  }else{
res.render("list",{listTitle: nameCapitalised, newListItems:foundList.items})

  }
}
})

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
 const listName =req.body.list.toLowerCase();
const day = date.getDate()

  let newItem = new Item({
    name:itemName
  })

  if(listName === "today"){
    newItem.save();
    res.redirect("/");
  }else{

    List.findOne({name:listName},(err,foundList)=>{
      
      if(err){console.log(err);}else{
   foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+listName)
      }
      
    })
    
  }


});

//Delete function with CheckBox
app.post("/delete",(req,res)=>{
const listName =req.body.listName.toLowerCase();
const matchId=req.body.checkbox;

if(listName === "Today"){
  Item.deleteMany({_id:matchId},(err)=>{
    if(err){console.log(err);}
    else{
      res.redirect("/")
    }
  }) }
else{
 List.findOneAndUpdate(
   {name: listName},
   {$pull:{items:{_id:matchId}}},
   (err,result)=>{
     if(!err){
       res.redirect("/"+listName)
     }
   });
  }
})  




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
