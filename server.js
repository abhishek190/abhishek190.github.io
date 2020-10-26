const express=require("express");
const cookieParser=require("cookie-parser");
const bodyParser=require("body-parser");
const cors=require("cors");
const path=require("path");
var app=express();
var passport=require("passport");
var LocalStrategy=require('passport-local').Strategy;
const { DH_NOT_SUITABLE_GENERATOR } = require("constants");
var User=require("../ejs-intro/user");
var bcrypt=require('bcryptjs');
const flash=require("connect-flash");
var session=require('express-session');
const multer=require('multer');
const fs=require("fs");
const {PythonShell} =require('python-shell');
var UserData=require("../ejs-intro/userData");
const { db } = require("../ejs-intro/user");

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(cors());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge:1000*60*30 }
}))
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
});

var storage=multer.diskStorage({
    destination:"public/uploads/",
    filename:function(req,file,callback){
        callback(null,file.fieldname + '-' + Date.now() +path.extname(file.originalname));
    }
})

var uploads=multer({
    storage:storage
}).single('image');
app.use(flash());
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.get("/",(req,res)=>{
    res.render('index');
})
app.get("/register",(req,res)=>{
    res.render("register");
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.post('/login',(req,res)=>{
    var email=req.body.email;
    var password=req.body.password;
    User.getUserByEmail(email,(err,user)=>{
        if(err)throw err;
        if(user){
                User.comparePassword(password,user.password,(err,isMatch)=>{
                if(err)throw err;
                User.getUserByEmail(email,(err,result)=>{
                    if(err)throw err;
                })
                console.log(user._id);
                req.session.value=user._id;
                req.session.user=user;
                req.session.email=email;
                req.flash('message',`Welcome ${user.firstName} ${user.lastName}`);
                res.redirect('/user');
            })
        }
        
    })
})
app.get('/NavBar',(req,res)=>{
    res.render("NavBarTemplate");
})
app.post("/register",uploads,(req,res)=>{
    var password=req.body.password;
    var cnfPassword=req.body.cnfPassword;
    var firstname=req.body.firstname;
    var lastname=req.body.lastname;
    var email=req.body.email;
    var phone=req.body.phone;
    if(password==cnfPassword){
       var newuser=new User();
       newuser.firstName=firstname;
       newuser.lastName=lastname;
       newuser.email=email;
       newuser.phone=phone;
       newuser.password=password;
       newuser.image='image-1603183764252.png';
      User.createUser(newuser,(err,user)=>{
          if(err)throw err;
          console.log(user);
          res.location('/');
          res.redirect('/');
      })
    }else{
        console.log("Password not matched");
        res.redirect('/');
    }
})
app.get('/edit',(req,res)=>{
    if(req.session.user){
    res.render('edit');}
    else{
        res.redirect('/');
    }
})
app.post('/edit',uploads,(req,res,next)=>{ 
    var id=req.session.value;
    console.log(req.body.firstName);
    if(req.file){
        User.findByIdAndUpdate(id,{firstName:req.body.firstName,lastName:req.body.lastName
            ,phone:req.body.phone,email:req.body.email,image:req.file.filename},function(err,result){
            if(err){
                res.send(err);
            }
            else{
                console.log("Updated successfully",result)
                res.redirect('user');
            }
        });
    }
    else{
        User.findByIdAndUpdate(id,{firstName:req.body.firstName,lastName:req.body.lastName
            ,phone:req.body.phone,email:req.body.email},function(err,result){
            if(err){
                res.send(err);
            }
            else{
                console.log("Updated successfully",result)
                res.redirect('user');
            }
        });
    }
    next;
})

app.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('login');
})

app.get('/profile',(req,res)=>{
    id=req.session.value;
    if(req.session.user){
      var datavalue =User.findById(id,(err,result)=>{
            if(err)throw err
            res.render('profile',{message:req.flash('message'),imageData1:result.image
            ,firstName:result.firstName
            ,lastName:result.lastName
            ,phone:result.phone
            ,email:result.email
        });
        })
    }
    else{
        res.redirect('/');
    }
})
app.get('/user',(req,res)=>{
    if(req.session.user){
        res.render('user');
    }
    else{
        res.redirect('/');
    }
})
app.post('/output',(req,res)=>{
    console.log(req.body.LinkData);
let options={
    mode:'text',
    pythonPath:'C:/Users/rawab/Downloads/Python/python.exe',
    pythonOptions: ['-u'],
    scriptPath:'./views',
    args:[req.body.LinkData]
};

PythonShell.run('urlData.py', options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    
    // res.render("output",{name:[results[0],results[1],results[2],results[3],results[4],results[5],results[6],results[7],results[8],results[9]
    //     ,results[10],results[11],results[12],results[13],results[14],results[15],results[16],results[17],results[18]]});
    res.send(results).json;
    var rating=req.body.rating;
    if(rating=="undefined"){rataing=1;}
    var note=req.body.note;
    var email=req.session.email;
    var title=results[0];
    var timeLimit=results[1];
    var MemoryLimit=results[2];
    var description=results[5];
    var InputSpecification=results[6];
    var OutputSpecification=results[7];
    var newUser=new UserData();
    newUser.email=email;
    newUser.title=title;
    newUser.timeLimit=timeLimit;
    newUser.memoryLimit=MemoryLimit;
    newUser.description=description;
    newUser.InputSpecification=InputSpecification;
    newUser.OutputSpecification=OutputSpecification;
    newUser.rating=rating;
    newUser.note=note;
    if(req.body.page=="Submit"){
    UserData.StoreData(newUser,(err,userData)=>{
        if(err)throw err;
        console.log(userData);
    })
}
})
});
app.get('/problem',(req,res)=>{
    if(req.session.user){
    res.render("problems");}
    else{
        res.redirect("/");
    }
})
app.get('/filter',(req,res)=>{
    UserData.find({},(err,result)=>{
        if(err)throw err;
        res.send(result).json;
    })
/*
    UserData.find({}).sort({rating:'asc'}).exec((err,result)=>{
        if(err)throw err;
        console.log(result)
    })
    
    UserData.find({}).sort({rating:'asc'}).exec((err,result)=>{
        if(err)throw err;
        console.log(result)
    })
    */
});
app.post('/filter',(req,res)=>{
    if(req.body.page=="asc"){
        UserData.find({}).sort({rating:'asc'}).exec((err,result)=>{
            if(err)throw err;
            res.send(result).json;
        })
    }
    if(req.body.page=="desc"){
        UserData.find({}).sort({rating:'desc'}).exec((err,result)=>{
            if(err)throw err;
            res.send(result).json;
        })
    }
})
app.post('/delete',(req,res)=>{
    UserData.findByIdAndDelete(req.body.page).exec((err,result)=>{
        if(err)throw err;
        console.log("id deleted");
    });
})
app.get('/newPage',(req,res)=>{
    if(req.session.user){
    res.render('newPage');}
    else{
        res.redirect('/');
    }
})
app.post('/byId',(req,res)=>{
    id=req.body.id;
    UserData.findById(id).exec((err,result)=>{
        if(err)throw err;
        res.send(result).json;
    });
})
app.listen(8000,(req,res)=>{
    console.log("heard on 8000");   
})