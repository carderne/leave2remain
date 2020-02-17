/* global Chart */

const MIL_IN_DAY = (1000*60*60*24);

let textarea = document.getElementById("trips");
textarea.onchange = update;
textarea.onkeyup = update;
let trips;

function update() {
  let text = textarea.value.replace(/ /g, "").split("\n");
  try {
    let newTrips = parse(text);
    if (newTrips != trips) {
      trips = newTrips;
      let data = createArr(trips);
      chart(data);
    }
  } catch (err) {
    // do nothing
  }
}

function chart(data) {
  let ctx = document.getElementById("canvas");
  data = {
    label: "data",
    borderColor: "red",
    data: data
  };
  new Chart(ctx, {
    type: "line",
    data: { datasets: [data] },
    options: {
      scales: {
        xAxes: [{
          type: "time"
        }]
      },
      legend: {
        display: false
      }
    }
  });
}

function createArr(trips) {
  let startDay = trips[0].start;
  let endDay = trips[trips.length - 1].end;
  let numDays = (endDay - startDay) / MIL_IN_DAY;

  let data = [];
  for (let d = 0; d < numDays; d++) {
    let date = new Date(startDay.getTime() + d * MIL_IN_DAY);
    let from = new Date(date.getTime() - MIL_IN_DAY*365);
    let out = countDays(trips, from, date);
    data.push({x: date, y: out});
  }
  return data;
}

function parse(text) {
  let newTrips = [];
  text.forEach(function (line) {
    let tagDates = line.split(":");
    let tag = tagDates[0];
    let dates = tagDates[1].split("-");
    let start = new Date(dates[0].replace(/\//g, "-"));
    let end = new Date(dates[1].replace(/\//g, "-"));
    newTrips.push({"tag": tag, "start": start, "end": end});
  });
  newTrips.sort(function(a, b) {
    return a.start - b.start;
  });
  return newTrips;
}

function countDays(trips, from_date, to_date) {
  let daysOut = 0;
  trips.forEach(function (trip) {
    if (trip.end > from_date && trip.start < to_date) {
      let start = trip.start > from_date ? trip.start : from_date;
      let end = trip.end < to_date ? trip.end : to_date;
      let duration = end - start;
      daysOut += duration;
    }
  });
  return daysOut / MIL_IN_DAY;
}

window.onload = update;
