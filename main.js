/* global Chart */

const MIL_IN_DAY = (1000*60*60*24);

let textarea = document.getElementById("trips");
let ctx = document.getElementById("canvas");
textarea.onchange = update;
textarea.onkeyup = update;
let trips;
let chart;

function update() {
  let text = textarea.value.replace(/ /g, "").split("\n");
  try {
    let newTrips = parse(text);
    if (newTrips != trips) {
      trips = newTrips;
      let data = createArr(trips);
      makeChart(data);
    }
  } catch (err) {
    // do nothing
  }
}

function makeChart(data) {
  data = {
    label: "data",
    data: data,
    borderColor: "rgba(57, 162, 174, 1)",
    backgroundColor: "rgba(57, 162, 174, 0.2)",
    borderCapStyle: "round",
    borderWidth: 4,
    pointBorderWidth: 0,
    pointBackgroundColor: "rgba(0, 0, 0, 0)",
    pointBorderColor: "rgba(0, 0, 0, 0)"
  };
  if (chart == undefined) {
    chart = new Chart(ctx, {
      type: "line",
      data: { datasets: [data] },
      options: {
        scales: {
          xAxes: [{
            type: "time",
          }],
          yAxes: [{
            time: {
              unit: "month"
            },
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 8,
              stepSize: 30,
              suggestedMax: 180
            }
          }]
        },
        legend: {
          display: false
        },
        showTooltips: false,
        tooltips: {
          enabled: false
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  } else {
    console.log("UPDATING");
    chart.data.datasets.pop();
    chart.data.datasets.push(data);
    chart.update({duration: 0});
  }
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
    if (dates[0].length < 10 || dates[1].length < 10) {
      throw "Incomplete date";
    }
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
