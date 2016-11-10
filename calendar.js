function getDateWithoutHours(date) {
	var newDate = new Date(date);
	newDate.setHours(0,0,0,0)
	return newDate;
}

function isSameDay(day1, day2) {
	return getDateWithoutHours(day1).getTime() === getDateWithoutHours(day2).getTime();
}

window.Calendar = function(element, dayToShow, events) {
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
	
	return currentWeek;
}
