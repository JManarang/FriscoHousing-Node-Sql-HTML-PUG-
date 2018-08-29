var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var app = express();
app.set('view engine', 'pug');
var session = require('express-session');

const db = mysql.createConnection({
	host : '127.0.0.1',
	user  : 'fa17g14',
	password : 'csc648fa17g14',
	database : 'fa17g14'
});

/* Get search results page */
router.post('/fa17g14/search', function(req, res, next) {
  var search = req.body.address;
  var searchby = req.body.searchBy;

  db.query('Select * from Listings Where ' + searchby + ' Like ?', '%' + search + '%', function (err, recordset){
    if(err) console.log(err)
    else { 
      db.query('Select * from Listings order by rand() limit 6', function (err, recordsetSearchFails){
        if(err) console.log(err)
        else {
          res.render('results', {altlistinglist: recordsetSearchFails, userSession: req.session.user, listinglist: recordset, searchinput: search, searchfilter: searchby, title: 'FriscoHousing - Helping You Find Home'});
        }
      });
    }
  });
});

/* GET home page. */
router.get('/fa17g14', function(req, res, next) {
  db.query('Select * from Listings order by rand() limit 3', function (err, recordset){
    if(err) console.log(err)
    else {
      var errorMessage = req.query.error;
      res.render('index', {errorMessage: errorMessage, userSession: req.session.user, listinglist: recordset, title: 'FriscoHousing - Helping You Find Home'});
    }
  });
});

/*GET about page. */
router.get('/fa17g14/about', function(req, res, next){
   res.render('about', {userSession: req.session.user, title:'About Us - Group 14'});
});

/* GET listing/property info. */
router.get('/fa17g14/property/:idlisting', function(req, res) {
  var listingID = req.params.idlisting;
  req.session.idListing = listingID; // not sure if this will work
  console.log("req.session.idListing: " + req.session.idListing);
  
  db.query('Select * from Listings Inner Join Realtors On Listings.idRealtors = Realtors.idRealtors and idListings = ?', listingID, function (err, recordset) {
    if(err) console.log(err)
    else {
      var confirmMessage = req.query.message;
      var errorMessage = req.query.error;
      res.render('property', {messageError: errorMessage, messageConfirm: confirmMessage,userSession: req.session.user, listinginfo: recordset, title: 'FriscoHousing - Helping You Find Home'});
    }
  });
});

router.post('/fa17g14/property/:idlisting', isUserLoggedIn, isUserBuyer, function(req, res) {
  var message = req.body.messageToRealtor;
  var user = req.session.user;
  var idListing = req.params.idlisting;

  console.log("message: " + message);

  db.query('Select idBuyers, idRealtors from Buyers Inner Join Listings On Listings.idListings = ? and Buyers.Email = ?', [idListing, user.email], function(err, recordset0){
    console.log("buyer id: " + recordset0[0].idBuyers);
    console.log("idListing: " + idListing);
    db.query('Insert Into Messages (message, RealtorId, BuyerId, ListingId) Values (?,?,?,?)', [message, recordset0[0].idRealtors, recordset0[0].idBuyers, idListing], function(err, recordset) {
      if(err) console.log(err)
      else {
        var messageSent = 'Message has been sent';
        res.redirect('/fa17g14/property/' + idListing + '?message=' + messageSent);
      }
    });
  });

});


/* GET realtor/agent info. I merged property page and contact realtor page
router.get('/fa17g14/realtor/:idrealtor', isUserLoggedIn, isUserBuyer, function(req, res) {
  var realtorID = req.params.idrealtor;

  db.query('Select * from Realtors Where idRealtors = ?', realtorID, function (err, recordset) {
    if(err) console.log(err)
    else
      res.render('realtor', {userSession: req.session.user, realtorinfo: recordset, title: 'FriscoHousing - Helping You Find Home'})
  });
});

router.post('/fa17g14/realtor/:idrealtor', isUserLoggedIn, isUserBuyer, function(req, res){
  var realtorID = req.params.idrealtor;
  var message = req.body.messageToRealtor;
  var user = req.session.user;
  var idListing = req.session.idListing;

  console.log("realtor id: " + realtorID);
  console.log("message: " + message);

  db.query('Select idBuyers from Buyers Where Email = ?', user.email, function(err, recordset0){
    console.log("buyer id: " + recordset0[0].idBuyers);
    console.log("idListing: " + idListing.listingID);
    db.query('Insert Into Messages (message, RealtorId, BuyerId, ListingId) Values (?,?,?,?)', [message, realtorID, recordset0[0].idBuyers, idListing.listingID], function(err, recordset) {
      if(err) console.log(err)
      else
        res.redirect('/fa17g14');
    });
  });
});
*/

/* GET login page */
router.get('/fa17g14/login', function(req, res, next) {
  res.render('login', {userSession: req.session.user, title: 'FriscoHousing - Helping You Find Home'})
});

router.post('/fa17g14/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  db.query('Select AES_DECRYPT(Password, "group14key") from Admin Where UserName = ?', email, function (err, recordset) {
    if(err) console.log(err)
    else 
    {
      if(recordset.length > 0) // means UserName/email exists in our database
      {
         /* getting the decrypted password */
        console.log(recordset); // from array
        console.log(recordset.length);
  
        var row;
        for (x in recordset) {
          row = recordset[x];
        }
        console.log(row); // to object
        console.log(row.length);

        var blobValue;
        for (y in row) {
          blobValue = row[y];
        }
        console.log(blobValue); // to object value (blob)
 
        var originalValue = Buffer.from(blobValue).toString(); // convert blob to decrpyed string/password
        console.log(originalValue)

        var readyToUse = originalValue.replace(/[']+/g, ''); // get rid of the single quotes surrounding the string
        console.log(readyToUse);
        /*  done getting the decrypted password */
      
        if(password === readyToUse){ // successful login
          console.log('req.path: '+req.path);
	  req.session.user = {email};
          var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/fa17g14';
          delete req.session.redirectTo;
          res.redirect(redirectTo); // redirects to previous page if login was successful
        } else {
          res.render('login', {userSession: req.session.user, title: 'FriscoHousing - Helping You Find Home', emailInput: email, loginErrorMessage: 'The password is incorrect.'});
        }

      } else { // means the array is empty, therefore UserName is invalid
        res.render('login', {userSession: req.session.user, title: 'FriscoHousing - Helping You Find Home', emailInput: email, loginErrorMessage: 'The email is incorrect.'}); 
      }
    }
  });
});

/* GET register page*/
router.get('/fa17g14/register', function(req, res, next) {
  res.render('register', {userSession: req.session.user, title: 'FriscoHousing - Helping You Find Home'})
});

router.post('/fa17g14/register', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var confirmpassword = req.body.confirmpassword;
  var usertype = req.body.usertype;

  console.log(email);
  console.log(password);
  console.log(confirmpassword);
  console.log(usertype);

  var tableName;
  var tableNameId;
  if(usertype === 'Buyer') {
    tableName = 'Buyers';
    tableNameId = 'idBuyers';
  } else {
    tableName = 'Realtors';
    tableNameId = 'idRealtors'
  }
  
  db.query('Select * from Admin where UserName = ?', email,  function(err, result0) {
    if(err) console.log(err)
    else {
      if(result0.length > 0) { // Email/Username is already in use
        res.render('register', {userSession: req.session.user, title: 'FriscoHousing - Helping You Find Home', emailInput: email, registerErrorMessage: 'The email is already in use.'}); 
      } else { // Email/Username is okay to use
        if(password === confirmpassword) {
          db.query('Insert Into ' + tableName + ' (Email) Values (?)', email, function(err, result1) {
            if(err) console.log(err)
            else {
              console.log('result1 = ' + result1.insertId);
              db.query('Insert Into Admin (UserName, Password, ' + tableNameId + ') Values (?, ' + 'AES_ENCRYPT("' + mysql.escape(password) + '", "group14key"), ' + result1.insertId + ')', email, function (err, result2) {
                if(err) console.log(err)
                else {
                  console.log('successful registration');
                  res.redirect('login');
                }
              });
            } 
          });
        } else {
          console.log('unsuccessful registration');
          res.redirect('register');
        }
      }
    }
  });
});

/* Logout page? */
router.get('/fa17g14/logout', function(req, res) {
  req.session.destroy(function(err) {
    if(err) console.log(err)
    else
      res.redirect('/fa17g14/login');
  });
});

/* GET agent dashboard page*/
router.get('/fa17g14/agent', isUserLoggedIn, isUserSeller, function(req, res) {
  var user = req.session.user;
  
  // get recordset for Listings tab
  db.query('Select l.idRealtors, l.idListings, l.AddressLine, l.City, l.State, l.ZipCode, l.DateAdded from Listings l, Admin a Where a.UserName = ? and l.idRealtors = a.idRealtors', user.email, function(err, recordsetListings) {
    if(err) console.log(err)
    else {
      // get recordset for Messages tab
      db.query('SELECT DateReceived, message, Buyers.Email, ListingId FROM Messages INNER JOIN Buyers On Messages.BuyerId=Buyers.idBuyers INNER JOIN Realtors ON Messages.RealtorId=Realtors.idRealtors and Realtors.Email=?', user.email, function(error, recordsetMessages){
        if(error) console.log(error)
        else
          res.render('agent', {messagelist: recordsetMessages, listinglist: recordsetListings, userSession: req.session.user, title: 'FriscoHousing - Helping You Find Home'})
      });
    }
  });
});

/* Sell/Create a Listing */
router.get('/fa17g14/sell', isUserLoggedIn, isUserSeller, function(req, res) {
  res.render('sell', {userSession: req.session.user, title: 'FriscoHousing - Helping You Find Home'})
});

router.post('/fa17g14/sell', function(req, res){
var address = req.body.address;
var city = req.body.city;
var state = req.body.state;
var zipcode = req.body.zipcode;
var bedrooms = req.body.bedrooms;
var bathrooms = req.body.bathrooms;
var cost = req.body.cost;
var image = req.body.image;
//console.log('image?: '+req.body.image);
//console.log('req.files: ' + req.files);
//var date = require('node-datetime');
//var dt = date.create();
//var formatted = dt.format('Y-m-d H:M:S'); // this is unneccesary, DateAdded colum gets auto updated similar to ids auto_increment
var user = req.session.user;

db.query('Select idRealtors From Admin Where UserName = ?', user.email, function(err, recordset){
  console.log(recordset[0].idRealtors);
  db.query( 'Insert Into Listings (Thumbnail, Image, AddressLine, City, State, ZipCode, Bedroom, Bathroom, Price, idRealtors) Values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [image, image, address, city, state, zipcode, bedrooms, bathrooms, cost, recordset[0].idRealtors], function(err,results){
    if(err) console.log(err)
    else{
      console.log('sucessful listing');
      res.redirect('/fa17g14/agent');
      }
    });
  });
});

function isUserLoggedIn(req, res, next){
  if(req.session.user){ // user is loggedin
    var user = req.session.user;
    console.log(user.email);
    return next();
  } else { // user is not logged in
    req.session.redirectTo = req.path;
    res.redirect('/fa17g14/login');
  }
}

function isUserSeller(req, res, next){
  var user = req.session.user;
  console.log(user.email);
  db.query('Select idRealtors From Admin Where UserName = ?', user.email, function(err, recordset){
    if(recordset[0].idRealtors != null){
      console.log(recordset[0]);
      return next();
      }
    else {
    var errorMessage = 'Only Realtors can access the Agent page!';
    res.redirect('/fa17g14?error=' + errorMessage);
    }
  });
}


function isUserBuyer(req, res, next){
  var user = req.session.user;
  console.log(user.email);
  db.query(' Select idBuyers From Admin Where UserName = ?', user.email, function(err, recordset){
    if(recordset[0].idBuyers != null){
      console.log(recordset[0]);
      return next();
    }
    var messageNotSent = 'Unable to send message, only Buyers can send messages to Realtors!';
    res.redirect('/fa17g14/property/' + req.session.idListing + '?error=' + messageNotSent);
  });
}

module.exports = router;
