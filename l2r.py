#!/usr/bin/env python3

import sys
from pathlib import Path
from datetime import datetime, timedelta
from collections import namedtuple

import matplotlib.pyplot as plt
import matplotlib.dates as mdates


FMT = "%Y/%m/%d"
LIM = 180
Trip = namedtuple("Trip", "tag start end")


def load_trips(saved):
    with open(saved) as f:
        lines = f.readlines()
    trips = [x.strip() for x in lines]
    return trips


def parse_dates(trips):
    parsed_trips = []
    for trip in trips:
        tag, date = trip.replace(" ", "").split(":")
        start, end = date.split("-")
        start = datetime.strptime(start, FMT)
        end = datetime.strptime(end, FMT)
        parsed_trips.append(Trip(tag, start, end))
    trips = sorted(parsed_trips, key=lambda x: x.start)
    return trips


def count_days(trips, from_date, to_date, extra=None):
    days_out = 0
    for trip in trips + [extra]:
        if not trip:
            continue
        if trip.end > from_date and trip.start < to_date:
            start = trip.start if trip.start > from_date else from_date
            end = trip.end if trip.end < to_date else to_date
            duration = end - start
            days_out += duration.days + 1
    return days_out


def chart(trips):
    start_day = trips[0].start
    end_day = trips[-1].end
    num_days = (end_day - start_day).days + 10
    dates = sorted([end_day - timedelta(days=d) for d in range(num_days)])
    y = []
    y = [count_days(trips, d - timedelta(days=365), d) for d in dates]
    line_limit = [LIM for x in dates]

    fig, ax = plt.subplots(figsize=(20, 10))
    plt.fill_between(dates, y, color="skyblue", alpha=0.4)
    plt.plot(dates, y)
    plt.plot(dates, line_limit, color="red")
    ax.set_xlim([dates[0], dates[-1]])
    ax.set_ylim([0, 200])
    ax.set_yticks([0, 30, 60, 90, 120, 150, 180])

    ax.xaxis.set_major_locator(mdates.YearLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
    ax.xaxis.set_minor_locator(mdates.MonthLocator())
    ax.xaxis.set_minor_formatter(mdates.DateFormatter("%b"))
    ax.format_xdata = mdates.DateFormatter("%Y-%m-%d")
    ax.xaxis.set_tick_params(which="major", pad=15)
    ax.tick_params(axis='both', which='major', labelsize=10)
    ax.tick_params(axis='both', which='minor', labelsize=8)

    plt.show()


def main():
    if len(sys.argv) > 1:
        saved = Path(sys.argv[1])
    else:
        saved = Path("trips.txt")
    if saved.is_file():
        trips = load_trips(saved)
    else:
        print(f"{saved} is not a file!")
        return
    trips = parse_dates(trips)
    chart(trips)


if __name__ == "__main__":
    main()
