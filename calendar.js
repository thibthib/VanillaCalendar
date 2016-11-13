function getDateWithoutHours(date) {
	var newDate = new Date(date);
	newDate.setHours(0,0,0,0);
	return newDate;
}

function isSameDay(day1, day2) {
	return getDateWithoutHours(day1).getTime() === getDateWithoutHours(day2).getTime();
}

function areEventsConcurrent(event1, event2) {
	var isFullyBefore = event1.end_date.getTime() < event2.start_date.getTime();
	var isFullyAfter = event1.start_date.getTime() > event2.end_date.getTime();
	return !( isFullyBefore || isFullyAfter);
}

function getConcurrentEvents(event, events) {
	return events.filter(function(otherEvent) {
		return otherEvent !== event && areEventsConcurrent(event, otherEvent);
	});
}

function computeEvents(events) {
	events.forEach(function(event) {
		event.concurrents = getConcurrentEvents(event, events);
	});
	
	return events.sort(function(event1, event2) {
		return event1.start_date.getTime() - event2.start_date.getTime(); 
	});
}

window.Calendar = function(selector, dayToShow, events) {
	var firstDayOfWeek = 1; // Monday
	var currentWeek = [];
	
	var computedEvents = computeEvents(events);
	
	var firstDateOfCurrentWeek = dayToShow.getDate()+firstDayOfWeek-dayToShow.getDay();
	for (var i = firstDateOfCurrentWeek; i < 7+firstDateOfCurrentWeek; i++) {
		var day = new Date(dayToShow);
		day.setDate(i);
		currentWeek.push({
			date: day,
			events: computedEvents.filter(function(event) {
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
		var length = (event.end_date.getTime() - event.start_date.getTime()) / 3600000;
		var eventElement = document.createElement('div');
		eventElement.classList.add('Calendar_event');
		eventElement.style.height = (length/24)*100+'%';
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
		var concurrentIndex = 0;
		day.events.forEach(function(event) {
			var eventElement = getEventElement(event);
			if (event.concurrents.length > 0) {
				var totalConcurrents = 1+getMaxConcurrents(event);
				eventElement.style.width = (100/totalConcurrents)+'%';
				eventElement.style.left = (100*concurrentIndex/totalConcurrents)+'%';
				concurrentIndex = concurrentIndex+1;
			} else {
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
