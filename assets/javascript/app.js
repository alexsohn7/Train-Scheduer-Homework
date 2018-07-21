// Initialize Firebase
var config = {
    apiKey: "AIzaSyBa4vdbTZ8f0wf_QHA8v07rAzlXc73LmBs",
    authDomain: "train-scheduler-ecede.firebaseapp.com",
    databaseURL: "https://train-scheduler-ecede.firebaseio.com",
    projectId: "train-scheduler-ecede",
    storageBucket: "train-scheduler-ecede.appspot.com",
    messagingSenderId: "981095591748"
  };

firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

var trainName = "";
var destination = "";
var firstTrainTime = "";
var frequency = 0;

$(document).ready(function() {
    
    // when submit button is clicked
    $("#submitBtn").on("click", function () {
        event.preventDefault();
    
        // gather inputs
        trainName = $("#addTrainName").val().trim();
        destination = $("#addDestination").val().trim();
        firstTrainTime = $("#addTrainTime").val();
        frequency = $("#addTrainFrequency").val().trim();

        // make variables for each inputed value and push to firebase
        database.ref().push({
            trainName : trainName,
            destination: destination,
            firstTrainTime : firstTrainTime,
            frequency: frequency
        });

        database.ref().on("child_added", function (childSnapshot) {
             //convert firstTrainTimeInput into minutes (Use this var in the equation)
            var firstTrainTimeInputInMinutes = moment.duration(childSnapshot.val().firstTrainTime).asMinutes();
            console.log("first train time input in minutes");
            console.log(firstTrainTimeInputInMinutes);

            // retrieve the current time in HH:mm format 
            var currentTime = moment().format("HH:mm");
            console.log("current time");
            console.log(currentTime);

            // convert currentTime to minutes (Use this var in the equation)
            var currentTimeInMinutes = moment.duration(currentTime).asMinutes();
            console.log("current time in minutes");
            console.log(currentTimeInMinutes);

            //retrieve the user input for frequency.  Frequency is already in minutes
            var frequencyInput = childSnapshot.val().frequency;
            console.log("frequency input");
            console.log(frequencyInput);

            // find the amount of minutes passed from the first train and current time 
            var minutesPassed = currentTimeInMinutes - firstTrainTimeInputInMinutes;
            console.log("minutes passed since the first train to now");
            console.log(minutesPassed);

            // minutes passed from last train
            var minutesPastFromLastTrain = minutesPassed % frequencyInput;
            console.log("minutes passed from last train");
            console.log(minutesPastFromLastTrain);

            //minutes away from next train
            var minutesAwayFromNextTrain = frequency - minutesPastFromLastTrain;
            console.log("minutes away from next train");
            console.log(minutesAwayFromNextTrain);

            // find the next train arrival time in minutes 
            var nextTrainArrivalTimeInMinutes = currentTimeInMinutes + minutesAwayFromNextTrain;
            console.log(nextTrainArrivalTimeInMinutes);

            function getTimeFromMin(mins) {
                if (mins >= 24 * 60 || mins < 0) {
                }
                var h = mins / 60 | 0;
                var m = mins % 60 | 0;
          
                return moment.utc().hours(h).minutes(m).format("hh:mm A");
              }

        // Appending the firebase values to the page 
            
        $("#trainTable").find("tbody:last").after("<tr><td>" + 
        childSnapshot.val().trainName + "</td><td>" +
        childSnapshot.val().destination + "</td><td>" + 
        childSnapshot.val().frequency + "</td><td>" +
        getTimeFromMin(nextTrainArrivalTimeInMinutes) + "</td><td>" +
        minutesAwayFromNextTrain + "</td></tr>");

        },) 

        
        

    })
});  