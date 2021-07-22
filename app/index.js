import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";
import { goals, today } from "user-activity";
import { battery, charger } from "power";
import { display } from "display";
import * as messaging from "messaging";


const hrmData = document.getElementById("hrm-data");
const stpData = document.getElementById("stp-data");
const batData = document.getElementById("bat-data");
const batBar = document.getElementById("bat-bar");
const stpBar = document.getElementById("stp-bar");
const digClock = document.getElementById("digClock");
const dayDate = document.getElementById("dayDate");
const workWeek = document.getElementById("workWeek");

// Names of the day to display
const gsDayNames = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

// Heart Rate Monitor object
const hrm = null;
// Function to display WW (ISO 8601 vs US) https://www.timeanddate.com/date/week-numbers.html
const wwFunc = util.getUSWeekNumber

// Update the battery status on display
function updateBattery(){
  var batPercent = Math.floor(battery.chargeLevel) + "%";
  batData.text = (charger.connected ? "*" : "") + batPercent;
  batBar.sweepAngle = (battery.chargeLevel/100) * 180;
  if (battery.chargeLevel < 15)
    batBar.style.fill = "red";
  else
    batBar.style.fill = "gray";
}

// Update step counter on display
function updateSteps(){
  if (today && appbit.permissions.granted("access_activity")) {
    stpData.text = JSON.stringify(
      today.adjusted.steps ? today.adjusted.steps : 0
    );
    if(goals && goals.steps){
      var stepPercent = today.adjusted.steps / goals.steps;
      var stepBarVal = (stepPercent > 1 ? 1 : stepPercent) * -180
      stpBar.sweepAngle = stepBarVal;
      if (stepPercent > 1)
        stpBar.style.fill = "green";
      else
        stpBar.style.fill = "gray";
    }else
      stpBar.style.display = 'none';
  }
}

// Update HR on display
function updateHRS(event){
  hrmData.text = JSON.stringify(hrm.heartRate ? hrm.heartRate : 0);
}

// If there is a HRS and you have access to it, setup the listener.
if (HeartRateSensor) {
  hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", updateHRS);
} else {
  hrmData.style.display = "none";
}

// Only update HR, Battery whe screen is on. 
display.addEventListener("change", () => {
   if (display.on) {
     if (HeartRateSensor){
       hrm.start();
     }
     charger.addEventListener("change", updateBattery);
     updateBattery();
   } else {
     if (HeartRateSensor){
       hrm.stop();
     }
     charger.removeEventListener("change", updateBattery);
   }
});

// Update the clock/steps every second
clock.granularity = "seconds";

clock.ontick = (evt) => {
  let today = evt.date;

  let hours = today.getHours();
  let ampm = "";
  if (preferences.clockDisplay === "12h") {
    // 12h format
    ampm = hours >= 12 ? "p" : "a";
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  digClock.text = `${hours}:${mins}${ampm}`;
  dayDate.text = `${gsDayNames[today.getDay()]} ${today.getMonth()+1}/${today.getDate()}`;
  workWeek.text = `ww${wwFunc(today)}`;
  updateSteps();
}

// Message is received
messaging.peerSocket.onmessage = evt => {
  console.log(`App received: ${JSON.stringify(evt)}`);
  if (evt.data.key === "color" && evt.data.newValue) {
    let color = JSON.parse(evt.data.newValue); 
    hrmData.style.fill = color;
    stpData.style.fill = color;
    batData.style.fill = color;
  }
  if (evt.data.key === "euww" && evt.data.newValue){
    if(JSON.parse(evt.data.newValue))
      wwFunc = util.getWeekNumber
    else
      wwFunc = util.getUSWeekNumber
  }
};

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};


