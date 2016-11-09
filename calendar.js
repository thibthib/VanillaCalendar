window.Calendar = function(element, dayToShow, events) {
	var firstDayOfWeek = 1; // Monday
	var currentWeek = [];
	
	var firstDateOfCurrentWeek = dayToShow.getDate()+firstDayOfWeek-dayToShow.getDay();
	for (var i = firstDateOfCurrentWeek; i < 7+firstDateOfCurrentWeek; i++) {
		var day = new Date(dayToShow);
		day.setDate(i);
		currentWeek.push({
			date: day
		});
	}
}
