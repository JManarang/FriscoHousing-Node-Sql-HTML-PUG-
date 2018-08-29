/*
  Selects the first tab in agent dashboard on load
*/
$(function() {
  $('#myTab a:first').tab('show');
});

/*
  Adds searching, ordering, and paging goodness to the tables in agent dashboard
*/
$(document).ready(function(){
  $('#agentDashboardListings').DataTable();
  $('#agentDashboardMessages').DataTable();
});

/*
  Emulates browser back button
*/
function backButton() {
  history.back();
};

/*
  Seach input validation, based on the selected dropdown searchBy, we change the values of placeholder, maxlength, pattern, and title attribute using the ternary ? operator that works like if statements.
*/

$(function() {
    $('#searchBy').change(function() {
	var optionValue = $('option:selected', this).attr('value');

	var placeholder = (optionValue === 'City' ? 'Enter a City' : optionValue === 'ZipCode' ? 'Enter a ZIP code' : 'Enter a city or ZIP code');
	$('#textsearch').attr('placeholder', placeholder);

	var maxlength = (optionValue === 'City' ? '20' : optionValue === 'ZipCode' ? '5' : '20');
	$('#textsearch').attr('maxlength', maxlength);

	var pattern = (optionValue === 'City' ? '[A-z \s]{0,}' : optionValue === 'ZipCode' ? '[0-9 \d]{0,}' : '[A-z0-9 \s]{0,}');
	$('#textsearch').attr('pattern', pattern);

	var title = (optionValue === 'City' ? 'Use letters from A-z' : optionValue === 'ZipCode' ? 'Use digits from 0-9' : 'Use letters from A-z or digits from 0-9');
	$('#textsearch').attr('title', title);
    });
});

/*
  Register page that will check if password and confirm password matches
*/

$(function () {
  $('#inputPassword1, #inputPassword2').on('keyup', function() {
    if ($('#inputPassword1').val() == $('#inputPassword2').val())
      $('#matchingPasswordErrorMessage').html('').css('color', 'green');
    else
      $('#matchingPasswordErrorMessage').html('Not Matching').css('color', 'red');
  });
});

/*
    When a user clicks on a house this function will save details, such as address, price, photo
    in local storage.
*/
function buyFunction(housePhotoString, addressString, priceString) {
    $(location).attr('href', 'buy.html');


    var housePhoto = housePhotoString;
    localStorage.setItem("housePhoto", housePhoto);

    var address = addressString;
    localStorage.setItem("address", addressString);

    var price = priceString;
    localStorage.setItem("price", price);

};

/*
    Function will rewrite html elements in buy.html so that it displays the house' attributes
*/
function setPicturePriceAndAddress() {

    var housePhoto = localStorage.getItem("housePhoto");

    var houseAddress = localStorage.getItem("address");

    var housePrice = localStorage.getItem("price");

    let strHTML = "";

    strHTML +=
        "<img class=\"card-img-top\" src=" + housePhoto + " alt=\"Card image cap\"> " +
        "<div class=\"card-block\">" +
        "<h4 class=\"card-title\">" +
        "</i>" + houseAddress + "</h4>" +
        "<p class=\"card-text\">" + housePrice + "</p>" +
        "</div>";

    $("#housePhotoBuy").html(strHTML);

};




///////////////////////////////////////////////////////////////////////
/////////////////////////// ENTRY POINT OF PROGRAM/////////////////////
///////////////////////////////////////////////////////////////////////


// Function gets called everytime buy.html is loaded

$(document).ready(function() {

    setPicturePriceAndAddress();

});
