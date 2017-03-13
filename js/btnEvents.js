$(function() {
	//Работа с модальным окном
	$('#openModalButton').click(function(){
			window.location = "#openModal";
	});
	
	// Обработка событий клавиш клавиатуры
	$(document).keyup(function(e) {
		if (e.keyCode == 27) { // 'Ecs'
			removeSelectedSettings();
		}
		else if(e.keyCode == 76){ // 'L'
			$('#createLink').trigger('click');
		}
	});
});