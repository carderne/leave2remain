#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime, timedelta
from collections import namedtuple


FMT = "%Y/%m/%d"
Trip = namedtuple("Trip", "tag start end")


def load_trips(saved):
    with open(saved) as f:
        lines = f.readlines()
    trips = [x.strip() for x in lines]
    return trips


def save_trips(trips, saved):
    with open(saved, "w") as f:
        for trip in trips:
            tag = trip.tag
            start = datetime.strftime(trip.start, FMT)
            end = datetime.strftime(trip.end, FMT)
            print(f"{tag}: {start} - {end}", file=f)


def get_trips():
    print(
        f"\nEnter OUT (past and future) dates in the following format:"
        f"\n\ttag: from - to"
        f"\neg\tsailing: 2019/05/03 - 2019/05/20"
        f"\nLeave blank and press enter to go to next step"
    )
    trips = []
    while True:
        trip = str(input("-- "))
        if len(trip) == 0:
            break
        trips.append(trip)
    print()
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


def check_status(trips):
    now = datetime.now()
    year_ago = now - timedelta(days=365)
    days_out = count_days(trips, year_ago, now)
    print(f"Total duration out of UK in last 365 days: {days_out} days")


def check_future(trips):
    end_day = trips[-1].end
    year_before = end_day - timedelta(days=365)
    days_out = count_days(trips, year_before, end_day)
    print(f"Total duration out of UK in 365 days until last trip ends: {days_out} days")


def check_scenario(trips):
    print(
        f"\nEnter dates for a potential future trip"
        f"\neg\t2020/12/24 - 2021/02/02"
        f"\nLeave blank and hit Enter to quit"
    )
    while True:
        planned = input("-- ").replace(" ", "")
        if len(planned) == 0:
            break
        start, end = planned.split("-")
        start = datetime.strptime(start, FMT)
        end = datetime.strptime(end, FMT)
        planned = Trip("planned", start, end)

        year_before = end - timedelta(days=365)
        days_out = count_days(trips, year_before, end, extra=planned)
        print(
            f"Total duration out of UK in 365 days until potential trip ends: "
            f"{days_out} days"
            f"\nTry another?"
        )


def main():
    saved = Path("trips.txt")
    if saved.is_file():
        trips = load_trips(saved)
    else:
        trips = get_trips()
    trips = parse_dates(trips)
    save_trips(trips, saved)
    check_status(trips)
    check_future(trips)
    check_scenario(trips)


if __name__ == "__main__":
    main()
