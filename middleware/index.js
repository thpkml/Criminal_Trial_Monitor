// CREATE MIDDLEWARE OBJECT
const middlewareObj = {};

var loginStatus = require('../routes/index');

// Middleware - isLoggedIn 
middlewareObj.isLoggedIn =  function(req, res, next){
    if(loginStatus === 1){
        return next();
    } else if (loginStatus === 0){
        // req.flash("error", "You need to login for that.");
        res.send("You need to login for that.");
        //res.redirect("back");
    }
}

// EXPORT MIDDLEWARE
module.exports = middlewareObj;