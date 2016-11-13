function getDateWithoutHours(date) {
	var newDate = new Date(date);
	newDate.setHours(0,0,0,0);
	return newDate;
}

function isSameDay(day1, day2) {
	return getDateWithoutHours(day1).getTime() === getDateWithoutHours(day2).getTime();
}

function areEventsConcurrent(event1, event2) {
	// two events are said concurrent when their timetable overlap
	var isFullyBefore = event1.end_date.getTime() < event2.start_date.getTime();
	var isFullyAfter = event1.start_date.getTime() > event2.end_date.getTime();
	return !( isFullyBefore || isFullyAfter);
}

var HOUR_DURATION = 60*60*1000;
var DAY_DURATION = 24*HOUR_DURATION;

function prepareEventsForDisplay(events) {
	// split event on multiple days into smaller events for each day
	var eventsForDisplay = events.map(function(event) {
		if (isSameDay(event.start_date, event.end_date)) {
			return event;
		} else {
			const splitEvents = [];
			var daysDifference = (event.end_date.getTime() - event.start_date.getTime()) / DAY_DURATION;
			var startDay = event.start_date.getDate();
			var endDay = event.end_date.getDate();
			for (var i = startDay; i < startDay+daysDifference+1; i++) {
				var startDate = new Date(event.start_date);
				if (i !== startDay) {
					startDate.setDate(i);
					startDate.setHours(0,0,0,0);
				}
				
				var endDate = new Date(event.end_date);
				if (i !== endDay) {
					endDate.setDate(i);
					endDate.setHours(23,59,59,0);
				}
				
				splitEvents.push({
					start_date: startDate,
					end_date: endDate,
					title: event.title
				});
			}
			return splitEvents;
		}
	}).reduce(function (flat, toFlatten) {
		return flat.concat(toFlatten);
	}, []);

	// assign each event its array of concurrents events
	eventsForDisplay.forEach(function(event) {
		event.concurrents = eventsForDisplay.filter(function(otherEvent) {
			return otherEvent !== event && areEventsConcurrent(event, otherEvent);
		});
	});
	
	// sort the events by start date
	return eventsForDisplay.sort(function(event1, event2) {
		return event1.start_date.getTime() - event2.start_date.getTime(); 
	});
}

window.Calendar = function(selector, dayToShow, events) {
	var firstDayOfWeek = 1; // Monday
	var eventsForDisplay = prepareEventsForDisplay(events);
	console.log(eventsForDisplay);
	
	// generate week's array of days
	var currentWeek = [];
	var firstDateOfCurrentWeek = dayToShow.getDate()+firstDayOfWeek-dayToShow.getDay();
	for (var i = firstDateOfCurrentWeek; i < 7+firstDateOfCurrentWeek; i++) {
		var day = new Date(dayToShow);
		day.setDate(i);
		currentWeek.push({
			date: day,
			events: eventsForDisplay.filter(function(event) {
				return isSameDay(event.start_date, day) || isSameDay(event.end_date, day);
			})
		});
	}
	
	function getDayLabelElement(day) {
		function getDayLabel(day) {
			if (window.Intl) {
				return new Intl.DateTimeFormat(undefined, {
					weekday: 'long',
					month: 'long',
					day: 'numeric'
				}).format(day.date);
			}
			
			// when the browser doesn't have the Intl API, just display the week day, date and month from date.toString
			return day.date.toString().split(' ').reduce(function(label, bit, index) {
				return index > 2 ? label : label + ' ' + bit;
			}, '');
		}
		
		var dayLabelElement = document.createElement('div');
		dayLabelElement.classList.add('Calendar_dayLabel');
		dayLabelElement.innerHTML = getDayLabel(day);
		return dayLabelElement;
	}
	
	function getHourLabel(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		// hey ! no dependency on left-pad 😬
		return (hours > 9 ? hours : '0'+hours) + ':' + (minutes > 9 ? minutes : '0'+minutes);
	}
	
	function getHoursElement() {
		var hoursElement = document.createElement('div');
		hoursElement.classList.add('Calendar_hours');
		var date = new Date();
		date.setMinutes(0);
		for (var i = 0; i < 24; i++) {
			var hourElement = document.createElement('div');
			hourElement.classList.add('Calendar_hour');
			date.setHours(i);
			hourElement.dataset.hour = getHourLabel(date);
			hoursElement.appendChild(hourElement);
		}
		return hoursElement;
	}
	
	function getEventElement(event) {
		var eventElement = document.createElement('div');
		eventElement.classList.add('Calendar_event');
		// the top and height of the event element as percentage of the 24 hours of the day
		var eventDuration = (event.end_date.getTime() - event.start_date.getTime()) / HOUR_DURATION;
		eventElement.style.height = (eventDuration/24)*100+'%';
		var startHour = event.start_date.getHours() + event.start_date.getMinutes()/60;
		eventElement.style.top = (startHour/24)*100+'%';
		
		var hourLabelElement = document.createElement('p');
		hourLabelElement.classList.add('Calendar_eventHour');
		hourLabelElement.innerHTML = getHourLabel(event.start_date);
		eventElement.appendChild(hourLabelElement);
		
		var titleElement = document.createElement('p');
		titleElement.classList.add('Calendar_eventTitle');
		titleElement.innerHTML = event.title;
		eventElement.appendChild(titleElement);
		
		return eventElement;
	}
	
	// what's the maximum of concurrents at the same time ?
	function getMaxConcurrents(event) {
		return event.concurrents.reduce(function(max, concurrent) {
			return Math.max(max, concurrent.concurrents.length);
		}, event.concurrents.length);
	}
	
	function getDayElement(day) {
		var dayElement = document.createElement('div');
		dayElement.classList.add('Calendar_day');
		dayElement.appendChild(getHoursElement());
		
		var dayContentElement = document.createElement('div');
		dayContentElement.classList.add('Calendar_dayContent');
		
		// We need to move concurrent events so their display don't overlap
		// We'll use this index to know how much we need to move each event
		var concurrentIndex = 0;
		day.events.forEach(function(event) {
			var eventElement = getEventElement(event);
			if (event.concurrents.length > 0) {
				var totalConcurrents = 1+getMaxConcurrents(event);
				eventElement.style.width = (100/totalConcurrents)+'%';
				eventElement.style.left = (100*concurrentIndex/totalConcurrents)+'%';
				concurrentIndex = concurrentIndex+1;
			} else {
				// We reset the concurrentIndex when we leave the concurrent block
				concurrentIndex = 0;
			}
			dayContentElement.appendChild(eventElement);
		});
		
		dayElement.appendChild(dayContentElement);
		
		return dayElement;
	}
	
	function getWeekElement(week) {
		var weekElement = document.createElement('div');
		weekElement.classList.add('Calendar_week');
		
		var daysLabelsElement = document.createElement('div');
		daysLabelsElement.classList.add('Calendar_daysLabels');
		week.forEach(function(day) {
			daysLabelsElement.appendChild(getDayLabelElement(day));
		});
		weekElement.appendChild(daysLabelsElement);
		
		var daysEventsElement = document.createElement('div');
		daysEventsElement.classList.add('Calendar_days');
		week.forEach(function(day) {
			daysEventsElement.appendChild(getDayElement(day));
		});
		weekElement.appendChild(daysEventsElement);
		
		return weekElement;
	}
	
	var calendarElement = document.querySelector(selector);
	if (calendarElement) {
		calendarElement.appendChild(getWeekElement(currentWeek));
	} else {
		throw 'Calendar : Provided selector didn\'t match any element';
	}
	
	return currentWeek;
};
