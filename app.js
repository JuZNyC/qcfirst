const express = require('express');
const app = express();
const http = require('http').Server(app);
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const Class = require('./model/class')
const jwt = require('jsonwebtoken');
const expressSanitizer = require('express-sanitizer');
require('dotenv').config()

app.use(express.static(__dirname+'/public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());



// Based on https://www.youtube.com/watch?v=b91XgdyX-SM
app.post('/api/createUser', async (req, res) =>{
    try {
      // Accept and encrypt user password input
      req.body.password = bcrypt.hashSync(req.body.password, 10);
      var user = new User({
        firstName: req.sanitize(req.body.firstName),
        lastName: req.sanitize(req.body.lastName),
        email:req.sanitize(req.body.qMail),
        password:req.body.password,
        userType: req.body.TeacherStudent
      });

      // This saves a new user to the DB
      var savedMessage = await user.save();
      console.log('user created');
      // Return okay, along with the URL to the new page to redirect to
      res.json({status: 'ok/redirect', url: '/'});
    } catch (error) {
      if(error.code === 11000){
        return res.json({
          status: "error",
          error: "That email is already being used"
        })
      }
      throw error; 
    } finally{
      console.log('create user post was called');
    }
    
});

app.post('/api/createClass', async (req, res) =>{
  var course = new Class({
    semester: {season: req.body.season, year: req.body.year},
    department: req.sanitize(req.body.department),
    name: req.sanitize(req.body.name),
    number: req.sanitize(req.body.number),
    instructor: new mongoose.Types.ObjectId(req.body.instructor),
    description: req.sanitize(req.body.courseDesc),
    capacity: req.sanitize(req.body.capacity),
    enrollmentDeadline: req.body.enrollmentDate,
    schedule: {
      days: req.body.days,
      from: req.body.fromTime,
      to: req.body.toTime
    }
  });
  try{
    const user = jwt.verify(req.body.token, process.env.JWT_SECRET)
    if(user.userType == 'faculty'){
      var savedClass = await course.save();
      console.log("course created");
      res.json({status: 'ok/redirect', url: '/facultyHomepage.html'});
    }
  }
  catch (error) {
    if(error.code === 11000){
      return res.json({
        status: "error",
        error: "That course has already been created"
      })
    }
    throw error; 
  } 
  finally{
    console.log('create course POST was called');
  }
})

//Users cannot access pages unless loged in 
app.post('/api/validateAccess', async (req, res) => {
  const accessLevels = {
    '/studentHomepage.html': 'student',
    '/enroll.html': 'student',
    '/facultyHomepage.html': 'faculty',
    '/createAClass.html': 'faculty',
    '/classInfo.html': 'faculty'
  };
  var path = new URL(req.headers.referer).pathname
  const user = jwt.verify(req.body.token, process.env.JWT_SECRET);
  // var pos = path.slice(1, path.indexOf('.')); 
  if(user.userType != accessLevels[path]){
    res.json({
      status: 'redirect',
      url: '/'
    })
  }
})

app.post("/", async (req, res) =>{
  // This is called if there is something in the Users local storage ie. a user is sucessfully logged in. We verify that the JWT is untammpered
  const user = jwt.verify(req.body.token, process.env.JWT_SECRET);

  // The verified and decoded JWT is used to determine where to direct the loged in user
  if(user.userType == 'faculty'){
    return res.status(200).send({result: 'redirect', url:'/facultyHomepage.html'});
  }
  else if (user.userType == 'student'){
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

  // Search the DB for someone with the same email. Emails are unique so there should be only one
  const user = await User.findOne({email}).lean();


  if(!user){
    return res.json({status: 'not ok',error: "Invalid username/password"});
  }
  try{
    //Compare plain text password with hashed password stored in the DB
    if(await bcrypt.compare(plnTxtPwd, user.password)){

      //If the supplied password matches the hash (using the bcrypt.compare method), we create a signed JWT token with the user_id, email, and type
      const token = jwt.sign({
        id: user._id, 
        email: user.email,
        userType: user.userType
        }, process.env.JWT_SECRET);
      // Send token back in JSON file
      res.json({status: 'ok', data:token});
    }
    else{
      res.json({status: 'not ok', error: "Invalid username/password"})
    }
  } 
  catch(error){
    console.log(error)
  }
});

app.get('/api/faculty', async (req, res) =>{
  User.find({userType: 'faculty'})
  .then((result) =>{
    res.send(result)
  })
  .catch((error) =>{
    console.log(error);
    res.send("No faculty")
  })
})

app.get('/api/departments', async (req, res) =>{
  var deps = await Class.distinct('department');
  res.json(deps);
})

app.get('/api/:department/courses', async (req, res) =>{
  var courseNum = req.query.courseNum;
  var dept = req.params.department;
  if(courseNum){
    if(parseInt(courseNum)){
      courseNum=parseInt(courseNum);
      var course = await Class.find({
        $and:[
          {department:dept},
          {number: courseNum}
        ]})
        res.json(course);
    }
    else{
      var course = await Class.find({
        $and:[
          {department:dept},
          {name: new RegExp(courseNum, "i")}
        ]})
        res.json(course);    
      }
  }
  else{
    var course = await Class.find({
      department:dept
    });
    res.json(course);
  }
})

mongoose.connect(process.env.MONGO_URI, (err) =>{
    console.log('mongo db connected', err);
});

var server = http.listen(3000, ()=> {
    console.log('server is listening on port', server.address().port);
});