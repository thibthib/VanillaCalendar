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
	
	function getDayElement(day) {
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
		
		var dayElement = document.createElement('div');
		dayElement.classList.add('Calendar_day');
		
		var dayLabelElement = document.createElement('div');
		dayLabelElement.classList.add('Calendar_dayLabel');
		dayLabelElement.innerHTML = getDayLabel(day);
		dayElement.appendChild(dayLabelElement);
		
		var dayContentElement = document.createElement('div');
		dayContentElement.classList.add('Calendar_dayContent');
		dayElement.appendChild(dayContentElement);
		
		return dayElement;
	}
	
	function getWeekElement(week) {
		var weekElement = document.createElement('div');
		weekElement.classList.add('Calendar_week');
		week.forEach(function(day) {
			weekElement.appendChild(getDayElement(day));
		});
		
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
