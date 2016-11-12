function getDateWithoutHours(date) {
	var newDate = new Date(date);
	newDate.setHours(0,0,0,0);
	return newDate;
}

function isSameDay(day1, day2) {
	return getDateWithoutHours(day1).getTime() === getDateWithoutHours(day2).getTime();
}

window.Calendar = function(selector, dayToShow, events) {
	var firstDayOfWeek = 1; // Monday
	var currentWeek = [];
	
	var firstDateOfCurrentWeek = dayToShow.getDate()+firstDayOfWeek-dayToShow.getDay();
	for (var i = firstDateOfCurrentWeek; i < 7+firstDateOfCurrentWeek; i++) {
		var day = new Date(dayToShow);
		day.setDate(i);
		currentWeek.push({
			date: day,
			events: events.filter(function(event) {
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
	
	function getHoursElement() {
		var hoursElement = document.createElement('div');
		hoursElement.classList.add('Calendar_hours');
		for (var i = 0; i < 24; i++) {
			var hourElement = document.createElement('div');
			hourElement.classList.add('Calendar_hour');
			hourElement.dataset.hour = (i > 9 ? i : '0'+i) + ':00';
			hoursElement.appendChild(hourElement);
		}
		return hoursElement;
	}
	
	function getDayElement() {
		var dayElement = document.createElement('div');
		dayElement.classList.add('Calendar_day');
		
		dayElement.appendChild(getHoursElement());
		
		var dayContentElement = document.createElement('div');
		dayContentElement.classList.add('Calendar_dayContent');
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
