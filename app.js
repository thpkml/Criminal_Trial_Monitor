const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const PouchDB = require('pouchdb');
// const passport = require('passport');
const session = require('express-session');
// const resourceful = require('resourceful');
// const LocalStrategy = require('passport-local').Strategy;
const port = 5000;

// var User = require('./models/user');

PouchDB.plugin(require('pouchdb-find'));

// local db
var localDB = new PouchDB('trial-monitor'); 

// couch db - machine
var couchDB = new PouchDB('http://localhost:5984/trial-monitor');

// cloudant db - ibm cloud
var remoteDB = new PouchDB("https://9932427f-f88d-40d7-8843-35483cf195b7-bluemix:8e63cd2ff34819436975b16cd69fad43c17ff845b06e4cf00a87b6f4eaac0e13@9932427f-f88d-40d7-8843-35483cf195b7-bluemix.cloudantnosqldb.appdomain.cloud/trial-monitor");

// APP CONFIGURATION
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); //to serve static files 
app.use(flash());

// SETUP MOMENT
app.locals.moment = require('moment');

app.use(session({
    secret: "favourite animal dog",
    resave: false,
    saveUninitialized: false
}));

// MIDDLEWARE - GET USER ON ALL ROUTES
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});


// sync local and remote dbs
localDB.sync(couchDB, {
    live: true,
    retry: true
}).on('change', function(change) {
    console.log("something changed - local to couch: ", change);
}).on('paused', function(info) {
    console.log("replication paused - local to couch: ", info);
}).on('active', function(info) {
    console.log("replication resumed - local to couch: ", info);
}).on('error', function(err) {
    console.log(err);
});
// sync local and remote dbs
localDB.sync(remoteDB, {
    live: true,
    retry: true
}).on('change', function(change) {
    console.log("something changed - local to cloudant: ", change);
}).on('paused', function(info) {
    console.log("replication paused - local to cloudant: ", info);
}).on('denied', function(info) {
    console.log("replication denied - local to cloudant: ", info);
}).on('active', function(info) {
    console.log("replication resumed - local to cloudant: ", info);
}).on('error', function(err) {
    console.log(err);
});


// get basic info about the local pouch database
localDB.info().then(function(info){
    console.log("POUCH DB - ");
    console.log(info);
}).catch(function(err){console.log(err);});

// get basic info about the local pouch database
couchDB.info().then(function(info){
    console.log("COUCH DB - ");
    console.log(info);
}).catch(function(err){console.log(err);});

// get basic info about the remote couch database
remoteDB.info().then(function(info){
    console.log("CLOUDANT DB - ");
    console.log(info);
}).catch(function(err){console.log(err);});


// IMPORT ROUTES
const indexRoutes = require("./routes/index.js");

// USE IMPORTED ROUTES
app.use(indexRoutes);

// LISTEN TO SERVER
app.listen(port, function(err){
    if(err){
        console.log("Could not connect to server", err);
    } else {
        console.log("Connected to server!");
    }
});