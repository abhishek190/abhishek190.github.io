// var ourRequest= new XMLHttpRequest();
// ourRequest.open('GET','https://learnwebcode.github.io/json-example/animals-1.json');
// ourRequest.onload=function(){
//    console.log(ourRequest.responseText);
//    var ourData=ourRequest.responseText;
// };
// ourRequest.send();

const express=require("express");
const cookieParser=require("cookie-parser");
const bodyParser=require("body-parser");

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/output',(req,res)=>{
   var data = req.body.link;
})