//Function used to check if the user is signed in or not
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {


    document.getElementById('login_div').style.visibility = 'hidden';
    document.getElementById('list_div').style.visibility = 'hidden';
    document.getElementById('user_div').style.visibility = 'visible';


    var user = firebase.auth().currentUser;

    if(user != null){

      var email_id = user.email;
      //document.getElementById("user_para").innerHTML = "Welcome User : " + email_id;

    }

  } else {
    // No user is signed in.
    document.getElementById('user_div').style.visibility = 'hidden';
    document.getElementById('login_div').style.visibility = 'visible';
    document.getElementById('list_div').style.visibility = 'hidden';

  }
});
//Checls the login informartion submitted to login the user
function logins(){

    var userEmail = document.getElementById("email_field").value;
    var userPassword = document.getElementById("password_field").value;
        

        firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
          window.alert("Error : " + errorMessage);
        });
    }

//Logs out the user
function logout(){
  firebase.auth().signOut();
}
//Checks the info submitted and creates an account on the database
function newUser(){

  var userEmail = document.getElementById("email_field").value;
  var userPassword = document.getElementById("password_field").value;

  firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
  });

}
//Function that sends an email to the email of the user who forgot their password
function forgotPass(){
  var auth = firebase.auth();
  var emailAddress = document.getElementById("email_field").value;

  auth.sendPasswordResetEmail(emailAddress).then(function() {
    // Email sent.
  }).catch(function(error) {
    // An error happened.
  });
}


//Containers to store the quiz for the food place
const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const submitButton = document.getElementById('submit');

//variables used to define map and food properties
var map;
var service;
var infowindow;

var price;
var foodType;
var distance;

var database = firebase.database();
var ref = database.ref('location');
ref.on('value', retrieveList);

//Submits food info to map
submitButton.addEventListener('click', showResults);
//Variable that stores all the questions and responses to answers
const myQuestions = [
  {
    question: "What is your budget?",
    answers: {
      a: "0-10",
      b: "10-20",
      c: "20-30",
      d: "30+"
    },
    cheapAnswer: "a",
    moderateAnswer: "b",
    pricyAnswer: "c",
    expensiveAnswer: "d"

  },
  {
    question: "What kind of food place would you like?",
    answers: {
      a: "Cafe",
      b: "Restaurant",
      c: "Takeaway"
    },
    cafeAnswer: "a",
    restAnswer: "b",
    takeAnswer: "c"
  },
  {
    question: "How far are you willing to travel?",
    answers: {
      a: "0-1km",
      b: "1-3km",
      c: "3-5km",
      d: "5km+"
    },
    superCloseAnswer: "a",
    closeAnswer: "b",
    farAnswer: "c",
    veryFarAnswer: "d"

  }
];
//Reviews the quiz info and builds a quiz using it
function buildQuiz(){
  const output = [];

  myQuestions.forEach(
   (currentQuestion, questionNumber) =>{
    const answers = [];

    for(letter in currentQuestion.answers){
      answers.push(
        `<label>
                    <input type="radio" name="question${questionNumber}" value="${letter}">
                    ${letter} :
                    ${currentQuestion.answers[letter]}
                  </label>`


                  );
    }

    output.push(
      `<div class="question"> ${currentQuestion.question} </div>
             <div class="answers"> ${answers.join('')} </div>`
      );


   } );
  quizContainer.innerHTML = output.join('');
}

//Geo Stuff
document.addEventListener("deviceready", map, false);
var watchID = null;
//Function that starts the geolocation
function map() {
        // Throw an error if no update is received every 30 seconds
        var options = { maximumAge: 300000, timeout: 5000, enableHighAccuracy: true };
        // watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
        navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }
//Retyrs if the geolocation fails to keep position updated
function retry(){
  navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}
//Sets the coordinates of the user upon success
function onSuccess(position) {
    var element = document.getElementById('geolocation');
    // element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
    //                     'Longitude: ' + position.coords.longitude     + '<br />' +
    //                     '<hr />'      + element.innerHTML;
    //Sets location
    var pyrmont = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
    //Sets radis
    var rad = radius;
    var pri = price;
    var fType = foodType;

    infowindow = new google.maps.InfoWindow();
    // The map, centered at Uluru
    map = new google.maps.Map(document.getElementById('map'), {
          center: pyrmont,
          zoom: 15
        });

    //Sends the search request
    var request = {
        location: pyrmont,
        radius: rad,
        maxPriceLevel: pri,
        query: fType
      };

      service = new google.maps.places.PlacesService(map);
      service.textSearch(request, callback);
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code of the gods: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}
//Implements the question results into search data
function showResults(){
  const answerContainers = quizContainer.querySelectorAll('.answers');
  

  myQuestions.forEach((currentQuestion, questionNumber)=>{
    const answerContainer = answerContainers[questionNumber];
    const selector = 'input[name=question'+ questionNumber+']:checked';
    const userAnswer = (answerContainer.querySelector(selector) || {}).value;

    if(userAnswer===currentQuestion.cheapAnswer){
      price = 1;
    }
    else if (userAnswer===currentQuestion.moderateAnswer) {
      price = 2;
    }
    else if (userAnswer===currentQuestion.pricyAnswer) {
      price = 3;
    }
    else if (userAnswer===currentQuestion.expensiveAnswer) {
      price = 4;
    }
    else if (userAnswer===currentQuestion.cafeAnswer) {
      foodType = 'cafe';
    }
    else if (userAnswer===currentQuestion.restAnswer) {
      foodType = 'restaurant';
    }
    else if (userAnswer===currentQuestion.takeAnswer) {
      foodType = 'meal_takeaway';
    }
    else if (userAnswer===currentQuestion.superCloseAnswer) {
      radius = 1000;
    }
    else if (userAnswer===currentQuestion.closeAnswer) {
      radius = 3000;
    }
    else if (userAnswer===currentQuestion.farAnswer) {
      radius = 5000;
    }
    else if (userAnswer===currentQuestion.veryFarAnswer) {
      radius = 10000;
    }
    else if(userAnswer===currentQuestion.correctAnswer){
    }
  });
  map();
}


function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                'Address: ' + place.formatted_address + '<br>' +
                'Rating: ' + place.rating + '</div>');

          infowindow.open(map, this);
          document.getElementById("locName").innerHTML = place.name;
          document.getElementById("locAddress").innerHTML = place.formatted_address;
          document.getElementById("locRating").innerHTML = place.rating;
        });
}

function savePin(place){
    var locName = document.getElementById("locName").innerHTML;
    var locAddress = document.getElementById("locAddress").innerHTML;
    var locRating = document.getElementById("locRating").innerHTML;

    var data = {
      name: locName,
      address: locAddress,
      rating: locRating
    }

    ref.push(data);

}

function retrieveList(data){

    //console.log(data.val());
    var locations = data.val();
    var keys = Object.keys(locations);
    var list = document.createElement("Li");
    var gap = document.createElement("Br")
    //console.log(keys);
    for (var i = 0; i< keys.length; i++){
      var k = keys[i];
      var name = locations[k].name;
      var address = locations[k].address;
      var rating = locations[k].rating;
      console.log(name, address, rating);

      var textNode = document.createTextNode((i + 1) + " : " + name + " : " + address + " : " + rating);
      
      list.appendChild(textNode);
      
      
      document.getElementById("list").appendChild(list);
      
    }


}

function openList(){
  document.getElementById('user_div').style.visibility = 'hidden';
  document.getElementById('list_div').style.visibility = 'visible';

}

function closeList(){
  document.getElementById('user_div').style.visibility = 'visible';
  document.getElementById('list_div').style.visibility = 'hidden';
}

buildQuiz();