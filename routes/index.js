const express = require('express');
const app = express();
const router = express.Router();
// const passport = require('passport');
const PouchDB = require('pouchdb');

// User status
var loginStatus = 0;
var userEmail = "";
var trialReference = "";
var trialID = "";
var isAdmin = 0;
var globalNotes = {};

PouchDB.plugin(require('pouchdb-find'));

// local db
var localDB = new PouchDB('trial-monitor'); 

// ROUTES
// ROOT PAGE
router.get("/", function(req, res){
    if(loginStatus=== 0){
        res.render("login.ejs", {
            loginStatus:loginStatus,
            userEmail:userEmail,
            trialReference:trialReference,
            trialID:trialID,
            isAdmin:isAdmin
        });
    } else if(loginStatus === 1) {
        res.render("index.ejs", {
            loginStatus:loginStatus,
            userEmail:userEmail,
            trialReference:trialReference,
            trialID:trialID,
            isAdmin:isAdmin
        });
    }
});

// INDEX PAGE
router.get("/index", function(req, res){
    if(loginStatus=== 0){
        res.render("login.ejs", {
            loginStatus:loginStatus,
            userEmail:userEmail,
            trialReference:trialReference,
            trialID:trialID,
            isAdmin:isAdmin
        });
    } else if(loginStatus === 1) {
        res.render("index.ejs", {
            loginStatus:loginStatus,
            userEmail:userEmail,
            trialReference:trialReference,
            trialID:trialID,
            isAdmin:isAdmin
        });
    }
});

// LOGIN PAGE ROUTE
router.get("/login", function(req, res){
    if(loginStatus=== 0){
        res.render("login.ejs", {
            loginStatus:loginStatus,
            userEmail:userEmail,
            trialReference:trialReference,
            trialID:trialID,
            isAdmin:isAdmin
        });
    } else if(loginStatus === 1) {
        res.render("index.ejs", {
            loginStatus:loginStatus,
            userEmail:userEmail,
            trialReference:trialReference,
            trialID:trialID,
            isAdmin:isAdmin
        });
    }
});

// LOGIN POST ROUTE
router.post("/login", function(req, res){
    var email = req.body.email;
    var password = req.body.password;
    // check database for user match
    localDB.createIndex({
        index: {fields: ['type']} // find docs by 'type' field
    }).then(function(){
        return localDB.find({
            selector: {type: 'user'}, // docs where 'type' is 'user'
        });
    }).then(function(results){
            var users = results.docs; // docs is a list inside results object
            // console.log(users); 
            var match = 0;
            users.forEach(function(user){
                if(email === user.email && password === user.password){
                    match ++ ; 
                }
            });
            if(match < 1){
                res.send("Wrong credentials, try again");
            } else if(match === 1) {
                loginStatus = 1;
                userEmail = email
                if(email === "enequipe-admin@gmail.com" || email === "enequipe-admin1@gmail.com") {
                    isAdmin = 1;
                } else { isAdmin = 0;};
                console.log('session start: ');
                console.log('email: '+userEmail);
                console.log('loginStatus: '+loginStatus);
                // res.send("Transfer to notes page");
                res.render("index.ejs", {
                    loginStatus:loginStatus,
                    userEmail:userEmail,
                    trialReference:trialReference,
                    trialID:trialID,
                    isAdmin:isAdmin
                });
            }
    }).then(function(){
        console.log("Done");
    });
    // create custom session
});

// LOGOUT ROUTE
router.get("/logout", function(req, res){
    // req.logout();
    // clear custom session
    console.log('email: '+userEmail);
    console.log('login: '+loginStatus);

    loginStatus = 0;
    userEmail = "";
    trialReference = "";
    trialID = "";
    isAdmin = 0;
    // globalNotes = [];

    console.log("Session Cleared");
    console.log('email: '+userEmail);
    console.log('login: '+loginStatus);
    console.log('trial: '+trialReference);

    req.flash("success", "Successfully logged you out.");
    res.redirect("/");
});


// REGISTER ROUTE
router.get("/register/new", function(req, res){
    res.render("register.ejs", {
        loginStatus:loginStatus,
        userEmail:userEmail,
        trialReference:trialReference,
        trialID:trialID,
        isAdmin:isAdmin
    });
});

// REGISTER POST ROUTE
router.post("/register", function(req, res){
    var email = req.body.email;
    var password = req.body.password;
    var type = "user";
    var doc = {
        "_id": new Date().toJSON(),
        "email": email,
        "password": password,
        "type": type,
        "userType": "standard"
    };
    // if text empty, prevent 'confirm resubmission?' 
    if(email===null || password===""){
        res.redirect("back");
    } else {
        // get all user emails
        localDB.createIndex({
            index: {fields: ['type']}
        }).then(function(){
            return localDB.find({
                selector: {type: 'user'},
            }).then(function(results){
                var users = results.docs;

                // console.log(results);
                // console.log(typeof(results));
                // console.log("First Email: "+results.docs[0].email);

                // check if email is unique
                var unique = 0;
                users.forEach(function(user){
                    if(email === user.email){
                        unique ++;
                    }
                    console.log(user.email);
                });
                if(unique > 0){
                    req.flash("error", "Email already exists");
                    res.send("Email already exists");
                    // res.redirect("back");
                } else {
                    // save user if email unique
                    unique = 0;
                    localDB.put(doc).then(function(){
                        return res.render("login.ejs", {
                            loginStatus:loginStatus,
                            userEmail:userEmail,
                            trialReference:trialReference,
                            trialID:trialID,
                            isAdmin:isAdmin
                        });
                    });
                };
            }).then(function(){
                console.log("All done.")
                })
            // add more thens or a catch block
        }).catch(function(err){
            console.log(err);
        });
    };
});


// GET USER ON ALL ROUTES - MIDDLEWARE
// router.use(function(req, res, next){
//     res.locals.currentUser = req.user;
//     next();
// });

// TRIAL DETAILS
router.post("/trial", function(req, res){
    var tID = new Date().toJSON();
    var doc = {
        "_id": tID,
        "type": "trial",
        "ref": req.body.ref,
        "title": req.body.title,
        "time": req.body.start,
        "date": req.body.date,
        "location": req.body.location,
        "court": req.body.court,
        "judge": req.body.judge,
        "observer": req.body.observer,
        "observerEmail": userEmail,
        "defendant": req.body.defendant,
        "lawyer": req.body.lawyer,
        "charge": req.body.charge,
        // reasons
        "reason1": "",
        "reasonComment1": "",
        "reason2": "",
        "reasonValue2": "",
        "reason3": "",
        "reasonValue3": "",
        "reason4": "",
        "reason51": "",
        "reason52": "",
        "reason53": "",
        "reason54": "",
        "reason6": "",
        "reason7": "",
        "reason8": "",
        "reason9": "",
        "reason10": "",
        "reason11": "",
        // bail
        "bail1": "",
        "bail2": "",
        "bailComment": "",
        // certainty
        "certainty1": "",
        "certainty2": "",
        "certaintyComment": "",
        // disclosure
        "disclosure1": "",
        "disclosure2": "",
        "disclosureComment": "",
        // impartiality
        "impartiality1": "",
        "impartiality2": "",
        "impartialityComment": "",
        // innocence
        "innocence1": "",
        "innocence2": "",
        "innocenceComment": "",
        // interpreter
        "interpreter1": "",
        "interpreter2": "",
        "interpreterComment": "",
        // lawyer
        "lawyer1": "",
        "lawyer2": "",
        "lawyerComment": "",
        // preparation
        "preparation1": "",
        "preparation2": "",
        "preparationComment": "",
        // presence
        "presence1": "",
        "presence2": "",
        "presenceComment": "",
        // public
        "public1": "",
        "public2": "",
        "publicComment": "",
        // incrimination
        "incrimination1": "",
        "incrimination2": "",
        "incriminationComment": "",
        // time
        "time1": "",
        "time2": "",
        "timeComment": "",
        // witness
        "witness1": "",
        "witness2": "",
        "witnessComment": "",
    }
    localDB.put(doc);
    trialID = tID; // to save as global (above)
    trialReference = req.body.ref; // to save as global (above)
    console.log("Trial Saved: ", doc);
    console.log('email: '+userEmail);
    console.log('login: '+loginStatus);
    console.log('trial: '+trialReference);
    res.render("index.ejs", {
        loginStatus:loginStatus,
        userEmail:userEmail,
        trialReference:trialReference,
        trialID:trialID,
        isAdmin:isAdmin
    });
});

// BAIL ANSWERS TODO: ROUTE OTHER QUESTIONS SIMILARLY
router.post("/trialBail", function(req, res){
    // if no trialID then exit
    if(trialID === ""){
        res.send("You need to first enter/save trial details to be able to do this.")
    } else {
        // fetch the trial
        localDB.get(trialID).then(function(doc){
            // update required fields
            doc.bail1 = req.body.bail1;
            doc.bail2 = req.body.bail2;
            doc.bailComment = req.body.bailComment;
            // put the record back
            return localDB.put(doc);
        }).then(function(){
            // fetch trial again
            return localDB.get(trialID);
        }).then(function(doc){
            // check if it updated
            console.log("Updated: "+ doc.bail1+ ", "+doc.bail2+ ", "+doc.bailComment);
        });
        res.render("index.ejs", {
            loginStatus:loginStatus,
            userEmail:userEmail,
            trialReference:trialReference,
            trialID:trialID,
            isAdmin:isAdmin
        });
    }
});
// REASON ANSWERS
router.post("/trialReason", function(req, res){
    // if no trialID then exit
    if(trialID === ""){
        res.send("You need to first enter/save trial details to be able to do this.")
    } else {
        // fetch the trial
        localDB.get(trialID).then(function(doc){
            // update required fields
            doc.reason1 = req.body.reason1;
            doc.reasonComment1 = req.body.reasonComment1;
            doc.reason2 = req.body.reason2;
            doc.reasonValue2 = req.body.reasonValue2;
            doc.reason3 = req.body.reason3;
            doc.reasonValue3 = req.body.reasonValue3;
            doc.reason4 = req.body.reason4;
            doc.reason51 = req.body.reason51;
            doc.reason52 = req.body.reason52;
            doc.reason53 = req.body.reason53;
            doc.reason54 = req.body.reason54;
            doc.reason6 = req.body.reason6;
            doc.reason7 = req.body.reason7;
            doc.reason8 = req.body.reason8;
            doc.reason9 = req.body.reason9;
            doc.reason10 = req.body.reason10;
            doc.reason11 = req.body.reason11;
            // put the record back
            return localDB.put(doc);
        }).then(function(){
            // fetch trial again
            return localDB.get(trialID);
        }).then(function(doc){
            // check if it updated
            console.log("Updated: "+ doc.reason1+ ", "+doc.reason2+ ", "+doc.reasonComment1);
        });
        res.render("index.ejs", {
            loginStatus:loginStatus,
            userEmail:userEmail,
            trialReference:trialReference,
            trialID:trialID,
            isAdmin:isAdmin
        });
    }
});
// NOTES PAGE
router.get("/notes", function(req, res){
    res.render("index.ejs", {
        loginStatus:loginStatus,
        userEmail:userEmail,
        trialReference:trialReference,
        trialID:trialID,
        isAdmin:isAdmin
    });
});
// SUBMIT NOTES
router.post("/notes", function(req, res){
    var text = req.body.notes;
    var ref = trialReference;
    var type = "note";
    var currentUser = userEmail;
    var doc = {
        "_id": new Date().toJSON(),
        "ref": ref,
        "text": text,
        "type": type,
        "user": currentUser
    };
    // set trialReference to current/last ref
            // trialReference = ref;
            // console.log(trialReference);

    // if ref is null, send back 
    if(ref===null || ref==="" || ref===undefined){
        req.flash("error", "Cannot add notes without Trial as a Reference!");
        res.redirect("back");
    } else {
        console.log(doc);
        localDB.put(doc).then(function(){
            return localDB.allDocs({include_docs: true}).then(function(response){
                console.log("The type of AllDocs is : " + typeof(response));
                var notes = response.rows;
                console.log("The type of AllDocs is : " + typeof(notes));
                // list = notes.forEach(function(note){
                //     console.log(note.doc.text);
                // });
                // console.log("The notes are: " + notes);
                // pass notes and current trialReference(autofill)
                globalNotes = notes; // setting global notes to obtained notes
                console.log("Globalnotes: "+globalNotes);
                res.render("index.ejs", {
                    globalNotes:globalNotes, 
                    loginStatus:loginStatus,
                    userEmail:userEmail,
                    trialReference:trialReference,
                    trialID:trialID,
                    isAdmin:isAdmin
                });
            });
        }).catch(function(err){console.log(err);});
    };
});

// DATABASE - ADMIN
router.get("/database", function(req, res){
    if(loginStatus === 1 && isAdmin === 1){
        // allow access
        return localDB.allDocs({include_docs: true}).then(function(response){
            console.log("DATABASE RESPONSE: ", response);
            console.log("DATABASE RESPONSE 1 doc: ", response.rows[1].doc);
            console.log("DATABASE RESPONSE 1 value: ", response.rows[1].value);

            res.render("database.ejs", {
                loginStatus:loginStatus,
                userEmail:userEmail,
                trialReference:trialReference,
                trialID:trialID,
                isAdmin:isAdmin,
                globalNotes:globalNotes,
                database:response.rows
            });
        })
    } else {
        // redirect to login
        res.redirect("/login");
    }
});

// Middleware - isLoggedIn 
// app.use('/notes', function(req, res, next) {
//     if(loginStatus === 1){
//         return next();
//     } else if (loginStatus === 0){
//         req.flash("error", "You need to login for that.");
//         // res.send("You need to login for that.");
//         res.redirect("back");
//     }
// });


module.exports = router;
