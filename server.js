if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express');

const PORT = process.env.PORT || 3000; // Defining the PORT we used for communication server
const INDEX =  '/index.html';
const app = express()
    //.listen(PORT, ()=> console.log(`Listening on ${PORT}`));

var io = require('socket.io')
// const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

users.push({
  id: Date.now().toString(),
  name: "vikas",
  email: "vikaspal2131@gmail.com",
  password: "qwerty"
})

app.use(express.static( __dirname + '/public'))
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.sendFile(INDEX, {root : __dirname})
  
  var io2 = io(server);
 
  io2.on('connection', function(check) {
      console.log("received successfully-2");
      console.log(check.id);
      check.on('lights',function(data){
          console.log( data ); 
          io2.emit('lights', data); 
      });

      check.on('latitude', function(msg){
        console.log('message: ' + msg);
        io2.emit('dec', msg);
      });

      check.on('longitude', function(msg){
        console.log('message: ' + msg);
        io2.emit('ra', msg);
      });

      check.on('speed', function(data){
        io2.emit('speed', data);
      });

      check.on('captures', function(data){
        io2.emit('captures', data);
      })

      check.on('abc', function(data){
        console.log("disconnected");
        io2.emit('abc', {'status': '10'})
        io2.close()
        server = app.listen(PORT, () => {
          console.log("Listening on port: " + PORT);
        });
      })
    
  })
      
});
   

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
}) 

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    // const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      // password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    return res.redirect('/')
  }
  next()
}

var server = app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
