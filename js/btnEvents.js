$(function() {
	//������ � ��������� �����
	$('#openModalButton').click(function(){
			window.location = "#openModal";
	});
	
	// ��������� ������� ������ ����������
	$(document).keyup(function(e) {
		if (e.keyCode == 27) { // 'Ecs'
			removeSelectedSettings();
		}
		else if(e.keyCode == 76){ // 'L'
			$('#createLink').trigger('click');
		}
	});
});