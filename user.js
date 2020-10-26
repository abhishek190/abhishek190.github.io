const mongoose=require("mongoose");
var bcrypt=require('bcryptjs');
var url="mongodb://localhost:27017/mydb";
mongoose.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true});
var db=mongoose.connection;
var userSchema=new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    phone:String,
    password:String,
    image:{
        type:String,
        default:"image-1603183764252.png"
    }
});
var User=module.exports=mongoose.model('User',userSchema);
module.exports.getUserById=function(id,callback){
    User.findById(id,callback);
}
module.exports.getUserByEmail=function(email,callback){
    var query={email:email};
    User.findOne(query,callback);
};
module.exports.comparePassword=function(candidatePassword,hash,callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        callback(null,isMatch);
    });
}
module.exports.createUser=(newUser,callback)=>{
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password=hash;
            newUser.save(callback);
        });
    });
   
}