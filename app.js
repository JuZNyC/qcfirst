const express = require('express');
const app = express();
const http = require('http').Server(app);
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const Class = require('./model/class')
const sideTools = require('./tools')
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

// Creates a new class and stores in the database
app.post('/api/createClass', async (req, res) =>{
  var course = new Class({
    semester: {season: req.body.season, year: req.body.year},
    department: req.sanitize(req.body.department),
    name: req.sanitize(req.body.name),
    number: req.sanitize(req.body.number),
    instructor: {
      instructorId: mongoose.Types.ObjectId(req.body.instructor),
      instructorName: req.body.instructorName 
    },
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
    // Secondary validation to make sure only faculty members can create classes
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
  try{
    const user = jwt.verify(req.body.token, process.env.JWT_SECRET);
    if(user.userType != accessLevels[path]){
      res.json({
        status: 'redirect',
        url: '/'
      })
    }
  }
  catch(error){
    console.log(error)
    res.json({
      status: 'error',
      details: "Please try not to hack us, redirecting..."
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

// Allows students to enroll in classes for a particular semester
// POST attributes: classId (objectID) of the class to enroll in, and the users JWT toekn
app.post('/api/enroll', async (req, res) =>{
  try{
    const classId = req.body.classId; 
    const user = jwt.verify(req.body.token, process.env.JWT_SECRET);
    var course = await Class.findById(classId);
    var student = await User.findById(user.id);
    var startTime = course.schedule.from;
    var endTime = course.schedule.to;
    if(course && student){
      // First confirm that final enrollment date hasn't passed
      if(new Date() > course.enrollmentDeadline){
        return res.json({
          status:'error',
          details:'Enrollment deadline already passed for this class'
        });
      }
      // Then confirm that the capacity hasn't been exceded
      else if(course.roster.length >= course.capacity){
        return res.json({
          status:'error',
          details:'Capacity already reached for this class'
        });
      }

      // Each user stores all their classes in an Object array, where each Object consists of a single
      // semester and an array of class _id'
      var concSem = course.semester.season.slice(0,2) + course.semester.year.slice(2,);
      var idx = student.allClasses.findIndex(element => element.semester == concSem);

      // If the student has already registered for classes for this particular semester:
      if(idx >= 0 && idx != undefined){
        //Iterate over all the classes and grab their data
        for(var i = 0; i < student.allClasses[idx].registeredClasses.length; i++){
          var scndClass = await Class.findById(student.allClasses[idx].registeredClasses[i]);
          // If the student already registered for this class
          try{
            var scndClassSem = scndClass.semester.season.slice(0,2) + scndClass.semester.year.slice(2,);
            if(String(scndClass._id) == String(classId)){  
              return res.json({
                status:'error',
                details:'You have already signed up for this class'
              });
          }
        
          // tools.js contains a function to help determine if course times overlap
          else if(concSem == scndClassSem && sideTools.timesOverlap(startTime, endTime, course.schedule.days, scndClass.schedule.from, scndClass.schedule.to, scndClass.schedule.days)){
            return res.json({
              status:'error',
              details:'This class\'s times overlap with another class'
            });
          }
        }
          catch(error){
            // Catch class id's of deleted classes, do nothing 
          }
        }
        // Once we determined that there are no issues with registering, add the student to class roster, and add the class ID to the students registered classes
        course.roster.push(student);
        student.allClasses[idx].registeredClasses.push(mongoose.Types.ObjectId(classId));
      }

      // If this is the students first time registering for a class for this particular semester or in general:
      else{
        student.allClasses.push({
          semester:concSem,
          registeredClasses:[mongoose.Types.ObjectId(classId)]
        })
        course.roster.push(student);
      }
      var savedStnt = await student.save();
      var savedCrs = await course.save();
    }
    return res.json({
      status:'ok/redirect',
      details: 'Succesfully registered for a class',
      url: '/studentHomepage.html'
    });
  }
  catch(error){
    console.log(error)
    return res.json({
      status: 'error',
      details: 'something went wrong',
      url: '/'
    })
  }
})

// Get all users of usertype == 'faculty'
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

// Get the distinct name of all departments
app.get('/api/departments', async (req, res) =>{
  var deps = await Class.distinct('department');
  res.json(deps);
})

// Search for a specific course in a specific department. Users can search by class number or name, 
// otherwise return all courses in specific department.
app.get('/api/:department/courses', async (req, res) =>{
  var courseNum = req.sanitize(req.query.courseNum);
  var dept = req.params.department;
  // If we have a search parameter:
  if(courseNum){
    // Check if it's a number, and if so send back that course
    if(parseInt(courseNum)){
      courseNum=parseInt(courseNum);
      var course = await Class.find({
        $and:[
          {department:dept},
          {number: courseNum}
        ]})
        res.json(course);
    }
    // If it's not a number, look for courses of a similar name
    else{
      var course = await Class.find({
        $and:[
          {department:dept},
          {name: new RegExp(courseNum, "i")}
        ]})
        res.json(course);    
      }
  }
  // If no query parameter is supplied, return all courses
  else{
    var course = await Class.find({
      department:dept
    });
    res.json(course);
  }
})

// Get all data about a particular course
app.get('/api/course', async (req, res) =>{
  const user = req.query.token;
  var courseId = req.sanitize(req.query.classId);
  if(user){
    var teach = jwt.verify(user, process.env.JWT_SECRET);
    var courses = await Class.find({'instructor.instructorId': mongoose.Types.ObjectId(teach.id)});
    res.json(courses);
  }
  else{
    var course = await Class.findById(courseId);
    res.json(course);
  }
})

//Delete a course
app.delete('/api/:courseId/deleteCourse/:sem', async(req, res) => {
  const id = req.params.courseId;
  const sem = req.params.sem;
  try{
    Class.findByIdAndRemove(id, (err)=>{
      if(err){
        console.log(err);
        res.json({
          status:'error',
          details:'Something went wrong while deleteing',
          url:'/facultyHomepage'
        })
      }
      else{
        res.json({
          status:'ok/redirect',
          details: 'Successfully deleted a class',
          url:'/facultyHomepage.html'
        })
      }
    });
  }
  catch(error){
    console.log(error);
    res.json({
      status:'error',
      details:'Something went wrong while deleteing',
      url:'/facultyHomepage.html'
    })
  }
})

mongoose.connect(process.env.MONGO_URI, (err) =>{
    console.log('mongo db connected', err);
});

var server = http.listen(3000, ()=> {
    console.log('server is listening on port', server.address().port);
});