// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

// EU Version of WWs; Change line 88 in index.js to call this function if desired. 
export function getWeekNumber(d = new Date()) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}

// US Version of WWs
export function getUSWeekNumber(date = new Date()) {
  let newYears = new Date(date.getFullYear(), 0, 1);
  let oneDay = 1000*60*60*24;
  let yday = (date - newYears) / oneDay;
  let week = Math.floor(1 + (yday + 6 - date.getDay())/ 7);
  return week;
}