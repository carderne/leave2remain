/* global Chart */

const MS_PER_DAY = (1000*60*60*24);
const LIM = 180;
const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

const divTrips = document.getElementById("trips");
const more = document.getElementById("more");
const less = document.getElementById("less");
const ctx = document.getElementById("canvas");
more.onclick = addTrip;
less.onclick = removeTrip;

let trips;
let chart;
let ii = 0;

let defaultTrips = [
  {"tag": "Family",  "start": "2018-12-01", "end": "2018-12-28"},
  {"tag": "Home",    "start": "2019-02-01", "end": "2019-03-25"},
  {"tag": "France",  "start": "2019-06-01", "end": "2019-06-20"},
  {"tag": "Spain",   "start": "2019-10-01", "end": "2019-10-15"},
  {"tag": "Ireland", "start": "2019-11-01", "end": "2019-12-01"},
  {"tag": "Planned", "start": "2020-07-01", "end": "2020-08-15"},
];

let prevTrips = document.cookie;
if (prevTrips.length > 4) {
  prevTrips = prevTrips
    .split("=")[1]
    .split(",");
  prevTrips.forEach(function(trip, index) {
    trip = trip.split(":");
    prevTrips[index] = {"tag": trip[0], "start": trip[1], "end": trip[2]};
  });
  defaultTrips = prevTrips;
}


function update() {
  try {
    let newTrips = parseForms();
    if (newTrips != trips) {
      trips = newTrips;
      let data = createArr(trips);
      makeChart(data);
      document.cookie = "text=" + tripsToString(trips) + ";max-age=31536000";
    }
  } catch (err) {
    // do nothing
  }
}


function makeChart(data) {
  let line = data.line;
  let tripBars = data.tripBars;

  let datasets = [];
  let lineDataset = {
    label: "data",
    data: line,
    borderColor: "rgba(57, 162, 174, 1)",
    backgroundColor: "rgba(57, 162, 174, 0.2)",
    borderCapStyle: "round",
    borderWidth: 4,
    pointBorderWidth: 0,
    pointBackgroundColor: "rgba(0, 0, 0, 0)",
    pointBorderColor: "rgba(0, 0, 0, 0)",
    datalabels: {
      display: false
    }
  };
  datasets.push(lineDataset);

  
  tripBars.forEach(function(tripBar) {
    datasets.push({
      label: tripBar.tag,
      data: tripBar.bar,
      pointBorderWidth: 0,
      pointBackgroundColor: "rgba(0, 0, 0, 0)",
      pointBorderColor: "rgba(0, 0, 0, 0)",
      datalabels: {
        font: {
          size: vw > 600 ? 16 : 12
        },
        color: "black",
        display: "true",
        rotation: vw > 600 ? 0 : -90,
        align: "bottom",
        offset: 10,
        formatter: function(value) {
          if (value.x == tripBar.bar[1].x) {
            return tripBar.tag;
          } else {
            return "";
          }
        }
      }
    });
  });

  let todayDataset = {
    label: "today",
    data: [
      {x: new Date(), y: 0},
      {x: new Date(), y: LIM}
    ],
    borderColor: "black",
    backgroundColor: "black",
    borderCapStyle: "square",
    borderWidth: 2,
    pointBorderWidth: 0,
    pointBackgroundColor: "rgba(0, 0, 0, 0)",
    pointBorderColor: "rgba(0, 0, 0, 0)",
    datalabels: {
      display: false
    }
  };
  datasets.push(todayDataset);

  if (chart == undefined) {
    chart = new Chart(ctx, {
      type: "line",
      data: { datasets: datasets },
      options: {
        scales: {
          xAxes: [{
            gridLines: {
              drawBorder: false,
              lineWidth: 3,
              zeroLineWidth: 3,
              display: true,
              drawOnChartArea: false,
            },
            type: "time",
            time: {
              unit: "month",
              minUnit: "month",
              stepSize: 1
            },
            ticks: {
              fontSize: 14
            }
          }],
          yAxes: [{
            gridLines: {
              drawBorder: false,
              lineWidth: 2,
              zeroLineWidth: 2
            },
            ticks: {
              fontSize: 16,
              beginAtZero: true,
              maxTicksLimit: 8,
              stepSize: 30,
              suggestedMax: LIM
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
    chart.data.datasets.pop();
    chart.data.datasets = datasets;
    chart.update({duration: 0});
  }
}

function createArr(trips) {
  let startDay = trips[0].start;
  let endDay = trips[trips.length - 1].end;
  let numDays = (endDay - startDay) / MS_PER_DAY;

  let data = [];
  for (let d = 0; d < numDays; d++) {
    let date = new Date(startDay.getTime() + d * MS_PER_DAY);
    let from = new Date(date.getTime() - MS_PER_DAY*365);
    let out = countDays(trips, from, date);
    data.push({x: date, y: out});
  }

  let tripBars = [];
  trips.forEach(function(trip) {
    let bar = [];
    let mid = new Date(trip.start.getTime() + (trip.end - trip.start)/2);
    let dates = [trip.start, mid, trip.end];
    dates.forEach(function(date) {
      bar.push({x: date, y: LIM});
    });
    tripBars.push({"tag": trip.tag, "bar": bar});
  });

  return {"line": data, "tripBars": tripBars};
}


function parseForms() {
  let forms = divTrips.childNodes;
  let newTrips = [];

  forms.forEach(function(form) {
    let tag = form.elements[0].value;
    let start = form.elements[1].value;
    let end = form.elements[2].value;
    if (start.length == 10 && end.length == 10) {
      newTrips.push({
        "tag": tag,
        "start": new Date(start),
        "end": new Date(end)
      });
    }
  });
  newTrips.sort(function(a, b) {
    return a.start - b.start;
  });
  return newTrips;
}


function tripsToString(trips) {
  let tripString = "";
  trips.forEach(function(trip) {
    tripString += trip["tag"] + ":" +
      trip["start"].toISOString().split("T")[0] + ":" +
      trip["end"].toISOString().split("T")[0] + ",";
  });
  return tripString.slice(0, -1); // remove trailing comma
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
  return daysOut / MS_PER_DAY;
}


function removeTrip() {
  let nodes = divTrips.childNodes;
  let last = nodes[nodes.length - 1];
  divTrips.removeChild(last);
  update();
}


function addTrip(tag="", start="", end="") {
  if (tag.constructor.name != "String") {
    tag = "";
  }
  let f = document.createElement("form");
  let itag = document.createElement("input");
  itag.setAttribute("class", "tag");
  itag.setAttribute("type", "text");
  itag.setAttribute("name", "tag" + ii);
  itag.setAttribute("value", tag);
  itag.onchange = update;
  itag.onkeyup = update;
  let istart = document.createElement("input");
  istart.setAttribute("type", "date");
  istart.setAttribute("name", "start" + ii);
  istart.setAttribute("value", start);
  istart.onchange = update;
  let iend = document.createElement("input");
  iend.setAttribute("type", "date");
  iend.setAttribute("name", "end" + ii);
  iend.setAttribute("value", end);
  iend.onchange = update;

  f.appendChild(itag);
  f.appendChild(istart);
  f.appendChild(iend);
  divTrips.appendChild(f);
  ii += 1;
  update();
}


window.onload = function() {
  defaultTrips.forEach(function(trip) {
    addTrip(trip["tag"], trip["start"], trip["end"]);
  });
  update();
};
