const express = require('express');
const path = require('path');
const bodyParser =require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const passport = require('passport');
const cokkieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');


const app = express();

const secret = require('./config/secret');

//Passport Config
/*
require('./config/passport')(passport);
*/

mongoose.Promise = global.Promise;
//Mongoose Connect
mongoose.connect(secret.database,{useNewUrlParser: true}).then(()=>{
    console.log('MongoDB Connected');
}).catch(err => console.log(err));

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));


app.use(cokkieParser());
app.use(session({
    secret: secret.secretKey,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore( {url:secret.database, autoReconnect: true})
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
//flash
app.use(flash());

app.use(function (req,res,next) {
    res.locals.user = req.user;
    next();
});



//Handle Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));




require('./routes/main')(app);
require('./routes/user')(app);

const port = process.env.PORT || secret.port;


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});