/* global Chart */

const MS_PER_DAY = (1000*60*60*24);
const LIM = 180;
const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

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
    chart.data.datasets.push(data);
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
    console.log(dates);
    dates.forEach(function(date) {
      bar.push({x: date, y: LIM});
    });
    tripBars.push({"tag": trip.tag, "bar": bar});
  });

  return {"line": data, "tripBars": tripBars};
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
  return daysOut / MS_PER_DAY;
}

window.onload = update;
