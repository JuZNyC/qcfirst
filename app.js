const express = require('express');
const app = express();
const http = require('http').Server(app);
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const jwt = require('jsonwebtoken');
require('dotenv').config()

app.use(express.static(__dirname+'/public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// Based on https://www.youtube.com/watch?v=b91XgdyX-SM
app.post('/api/createUser', async (req, res) =>{
    try {
      console.log(req.body.password);
      console.log(req.body.TeacherStudent);
      req.body.password = bcrypt.hashSync(req.body.password, 10);
      var user = new User({
        firstName: req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.qMail,
        password:req.body.password,
        userType: req.body.TeacherStudent
      });

      var savedMessage = await user.save()
      console.log('user created');
      res.json({status: 'ok'});
    } catch (error) {
      if(error.code === 11000){
        return res.json({
          status: "error",
          error: "email already being used"
        })
      }
      throw error; 
    } finally{
      console.log('create user post was called');
    }
    
});

app.post("/", async (req, res) =>{
  // console.log(req.body.token)
  const user = jwt.verify(req.body.token, process.env.JWT_SECRET);
  // console.log(user, user.userType);
  if(user.userType == 'faculty'){
    return res.status(200).send({result: 'redirect', url:'/facultyHomepage.html'});
  }
  else if (payload.userType == 'student'){
    return res.status(200).send({result: 'redirect', url:'/studentHomepage.html'});
  }
  else{
    return res.status(401).send({error: "Something is wrong"});
  }
});

// Based on https://www.youtube.com/watch?v=b91XgdyX-SM
app.post("/api/login", async (req, res) =>{
  const email = req.body.email; 
  const plnTxtPwd = req.body.password; 
  const user = await User.findOne({email}).lean();
  // console.log(user);
  if(!user){
    return res.json({status: 'not ok',error: "Invalid username/password"});
  }
  try{
    if(await bcrypt.compare(plnTxtPwd, user.password)){
      const token = jwt.sign({
        id: user._id, 
        email: user.email,
        userType: user.userType
        }, process.env.JWT_SECRET);
      res.json({status: 'ok', data:token});
    }
  } 
  catch(error){
    console.log(error)
  }
});

mongoose.connect(process.env.MONGO_URI, (err) =>{
    console.log('mongo db connected', err);
});

var server = http.listen(3000, ()=> {
    console.log('server is listening on port', server.address().port);
});