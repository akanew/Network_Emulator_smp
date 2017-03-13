$(function () {
	document.getElementById("devices").style.height = screen.height+"px";
	document.getElementById("hr").style.height = screen.height+"px";

	// Глобальные переменные
	var pcList = new Array();
	var selectedPC = new Array();
	var creatorMode = false;
	var promptUsed = -1;

// ------------ <Drag & Drop и отображение свойств> ------------ //
	// Взятие объекта - Drag
	$('.draggable').draggable({
		start: function(){
			window.pc = $(this);
			window.pcClone = $(this).clone();
		}
	});
	
	// Сброс объекта - Drop
	$('#workArea').droppable({
		drop: function() {
			var masterOffset = $('.master').offset();
			// Добавляем новое устройство
			// ...графически
			window.pcClone.removeClass('master');
			
			var div = document.createElement('div');
			div.className = window.pcClone.attr('class');					
			var pcTitle = "Компьютер "+(parseInt(pcList.length)+1);					
			var smallCharWidth = 8; // омпьютер <№>
			var largeCharWidth = 10; // К
			div.innerHTML = '<div style="background:white; border-radius: 3px;">'+pcTitle;
			div.style.width = largeCharWidth+((pcTitle.length-1)*smallCharWidth)+"px";
			div.style.paddingLeft = "3px";
			div.style.paddingRight = "3px";		
			var ddiv = $(div);
			ddiv.addClass('slave');
			ddiv.prepend('<div><img src='+window.pcClone.attr('src')+' alt="'+pcList.length+'"></div>');
			
			$('#workArea').append(ddiv);
			ddiv.offset(masterOffset);
			
			$('#m1').offset({top:10, left:10});
			$('#m2').offset({top:10, left:124});
			
			// ...логически
			var controlPanelWidth = $('#devices').width()+$('#hr').width();
			var pc = {'failure':0.99,'left':'','top':'', 'linksList': new Array(),'lanPath': new Array(),'Id':pcList.length};
			pc.left = masterOffset.left - controlPanelWidth;
			pc.top = masterOffset.top;
			pcList[pcList.length]=pc;
			
			removeSelection();
			removeSelectedSettings();
			showSettingsList();
			setSelectionOnPC(pcList.length-1);
			showSettingsPC(pcList.length-1);
			slaveMousedownListener();
		}
	});
	
	// Выделить компьютер
	function setSelectionOnPC(id){
		id = parseInt(id);
		selectedPC[selectedPC.length-1] = id;
		var slavesList = document.getElementsByClassName('slave');
		for(var i=0; i<slavesList.length; i++){
			if(slavesList[i].getElementsByTagName('div')[0].getElementsByTagName('img')[0].alt == id)
				slavesList[i].className = 'slave selected';
		}		
	}

	//Отображение параметров выбранного компьютера
	function showSettingsPC(id) {
		id = parseInt(id);
		document.getElementById('pcFailure').readOnly=false;
		document.getElementById('pcFailure').value = (pcList[id].failure != '')?pcList[id].failure:'0';
		document.getElementsByClassName('pcName')[0].innerHTML = 'Параметры устройства<br/><hr/><b>Компьютер '+(id+1)+'</b>';
		
		if(pcList[id].linksList.length)
		{
			document.getElementById('linksList').previousSibling.previousSibling.innerHTML = 'Линии связи:';
			var ul = document.getElementsByTagName('ul')[0];
			var tmpUl = '';
			for(var i=0; i<pcList[id].linksList.length; i++)
			{
				tmpUl += "<label class='space' for='pcName'>Линия PC_"+(pcList[id].linksList[i].pc1+1)+", PC_"+(pcList[id].linksList[i].pc2+1)+"</label>";
				tmpUl += "<input class='space linkFailure' id='"+pcList[id].linksList[i].pc1+"|"+pcList[id].linksList[i].pc2+"' name='pcName' value='"+pcList[id].linksList[i].failure+"'>";
			}
			ul.innerHTML=tmpUl;
		}
		else document.getElementById('linksList').previousSibling.previousSibling.innerHTML = 'Линии связи: отсутствуют';

		pcSettingsInputListener();
	}
	
	// Изменение параметров устройства из меню (settings)
	function pcSettingsInputListener(){
		//Переопределяем отказоустойчивость PC
		$("#pcFailure").keyup(function(){
			if(selectedPC.length){
				for(var i=0; i<pcList.length; i++)
					if(pcList[i].Id == selectedPC[selectedPC.length-1]){
						pcList[i].failure = (parseFloat(this.value) != "NaN")? parseFloat(this.value) : 0;
						break;
					}
			}
		});
		//Переопределяем отказоустойчивость линии связи
		$(".linkFailure").keyup(function(){
			var idArr = this.id.split('|');
			var idCnt = 0;
			for(var i=0; i<pcList.length;i++){
				for(var j=0; j<pcList[i].linksList.length;j++){
					if((pcList[i].linksList[j].pc1 == idArr[0] && pcList[i].linksList[j].pc2 == idArr[1])||
					   (pcList[i].linksList[j].pc2 == idArr[0] && pcList[i].linksList[j].pc1 == idArr[1])){
						pcList[i].linksList[j].failure = (parseFloat(this.value) != "NaN")? parseFloat(this.value) : 0;
						idCnt++;
						if(idCnt == 2) break;
					}
				}
			}
		});
	}
	
	// Сбрасываем выделение
	function removeSelection(){
		var slavesList = document.getElementsByClassName('slave');
		for(var i=0; i<slavesList.length; i++)
			slavesList[i].className = 'slave';
	}

	// Удаление списка параметров ранее выделенного компьютера
	function removeSelectedSettings(){
		document.getElementsByClassName('pcName')[0].innerHTML = 'Параметры устройства';
		document.getElementById('pcFailure').readOnly=true;
		document.getElementById('pcFailure').value = '';
		var ul = document.getElementsByTagName('ul')[0];								
		ul.innerHTML="";				
		document.getElementById('linksList').previousSibling.previousSibling.innerHTML = 'Линии связи: отсутствуют';
	}
	
	// Скрыть окно параметров устр-ва
	function hideSettingsList(){
		var stngs = document.getElementsByClassName("settings");
		for(var i=0; i<stngs.length; i++)
			stngs[i].style.display="none"
	}
	hideSettingsList();
	
	// Показать окно параметров устр-ва
	function showSettingsList(){
		var stngs = document.getElementsByClassName("settings");
		for(var i=0; i<stngs.length; i++)
			stngs[i].style.display="block"
	}
	
	function slaveMousedownListener(){
		$('.slave').mousedown(function(event){
			event.preventDefault();
			var currentPC = parseInt($(this).find('img').attr('alt'));
			//var currentPC = parseInt($(this).attr('alt'));
			
			if(event.button == 0) //alert('Вы кликнули левой клавишей');
			{
				var selectedList = document.getElementsByClassName('selected');
				$(this).addClass('selected');
				selectedPC = getSelectedDevices();
				
				if(selectedList.length<2)
				{
					showSettingsList();
					showSettingsPC(currentPC);					
				}
				else if(selectedList.length == 2)
				{
					showSettingsList();
					showSettingsPC(currentPC);
				}
				else if(selectedList.length>2)
				{
					alert('Вы не можете использовать более двух устройств!')
					hideSettingsList();
					removeSelection();
					removeSelectedSettings();
				}
			} 
			else if(event.button == 1); //alert('Вы кликнули колесиком');
			else if(event.button == 2) //alert('Вы кликнули правой клавишей');
			{
				promptUsed++;
				var pc = pcList[currentPC];
				
				if(promptUsed == ((pcList.length-pc.Id)-1)){ // Избавляемся от странного бага: при изменении характеристик отказ. устройства окно prompt вызывается "<кол-во устр.> - <id устр.>" раз
					var failurePlaceholder = '0.99';
					for(var i=0; i<pcList.length; i++)
						if(pcList[i].Id == this.getElementsByTagName('img')[0].alt){
							failurePlaceholder = pcList[i].failure;
							break;
						}
				
					var failure=prompt('Укажите вероятность отказа элемента',failurePlaceholder);
					if(parseFloat(failure)<0 || parseFloat(failure)>1)
						alert('Вероятность отказа элемента должна быть от 0 до 1!')
					if(parseFloat(failure)>=0 && parseFloat(failure)<=1)
					{
						pc.failure = failure;
						
						if(selectedPC.length)
							if(selectedPC[selectedPC.length-1]==currentPC){
								showSettingsList();
								showSettingsPC(currentPC);
							}
					}
					promptUsed=-1;
				}
			}
		});
	}
	
	function getSelectedDevices(){
		var newArrSelectedPC = new Array();
		var selPCs = document.getElementsByClassName('selected');
		for(var i=0; i<selPCs.length; i++)
			newArrSelectedPC[newArrSelectedPC.length] = parseInt(selPCs[i].getElementsByTagName('div')[0].getElementsByTagName('img')[0].alt);
			
			return newArrSelectedPC;
	}
// ------------ </Drag & Drop и отображение свойств> ------------ //

// ---------------------- <Создание связей> --------------------- //
	$('#createLink').click(function() {
		selectedPC = getSelectedDevices();
		
		if(selectedPC.length > 1) {
			var canvasList = document.getElementsByClassName('line');
			var pcId1 = selectedPC[0];
			var pcId2 = selectedPC[1];

			// Подсчитываем количество неодинаковых связей (чтобы не создавать повторных для одинаковых pc)
			var cntNotEqualLinks=0;
			for(var i=0; i<canvasList.length; i++){
				var canvasId = canvasList[i].Id;
				var divider = canvasId.indexOf('|');
				var linkPC1 = canvasId.substr(0, divider);
				var linkPC2 = canvasId.substr(divider+1, canvasId.length-divider);
				if(((parseInt(pcId1) != parseInt(linkPC1)) && (parseInt(pcId1) != parseInt(linkPC2))) ||
					 ((parseInt(pcId2) != parseInt(linkPC1)) && (parseInt(pcId2) != parseInt(linkPC2))))// ????????? ?????? ???? ????? (????? ???????? =) )
					cntNotEqualLinks++;
			}
			// Отсеиваем одинаковые связи (между парой pc - одна связь!)
			if(cntNotEqualLinks == canvasList.length)
			{
				var selectedObj = getCoordinatesSelectedPC();
				drawLine(selectedObj.x1+($('.slave').width()/2), selectedObj.y1+($('.slave').height()/2), selectedObj.x2+($('.slave').width()/2), selectedObj.y2+($('.slave').height()/2),2,'red');
				
				//Сообщаем полю о хранимой им связи
				var lastCanvas = canvasList[canvasList.length-1];
				lastCanvas.Id = pcId1+"|"+pcId2;									
				
				//Узнаем отказоустойчивость
				var failure=prompt('Укажите вероятность отказа элемента','0.99');
				if(parseFloat(failure)<0 || parseFloat(failure)>1){
					failure=0;
					alert('Вероятность отказа элемента должна быть от 0 до 1!')
				}

				//Добавляем параметры связи pc
				var pcLink = {'pc1':pcId1,'pc2':pcId2,'failure':failure};
				var ll1  = pcList[pcId1].linksList;
				ll1[ll1.length] = pcLink;
				var ll2  = pcList[pcId2].linksList;
				ll2[ll2.length] = pcLink;
			}
			
			setTimeout(hideSettingsList, 99);
			setTimeout(removeSelection, 100);
			setTimeout(removeSelectedSettings, 101);
		}
		else alert('Выберите два компьютера для организации связи!');
		
		creatorMode = false;
	});
	
	function getCoordinatesSelectedPC(){
		selectedPC = getSelectedDevices();
		var x1 = pcList[selectedPC[0]].left;
		var y1 = pcList[selectedPC[0]].top;
		var x2 = pcList[selectedPC[1]].left;
		var y2 = pcList[selectedPC[1]].top;
		var coordData = {'x1':x1,'y1':y1,'x2':x2,'y2':y2};
		return coordData;
	}
	
	function drawLine(x1,y1,x2,y2,lineWidth, color){
		var elem = document.createElement('canvas');
		elem.className = 'line';
		elem.width=screen.width;
		elem.height=screen.height;
		$('#workArea').append(elem);
		var classLineList = document.getElementsByClassName('line');
		var canvas = classLineList[classLineList.length-1];
		var obCanvas = canvas.getContext('2d');				
		obCanvas.beginPath();
		obCanvas.lineWidth = lineWidth;
		obCanvas.strokeStyle = color;
		obCanvas.moveTo(x1, y1);
		obCanvas.lineTo(x2, y2);
		obCanvas.stroke();
	}
// --------------------- </Создание связей> --------------------- //

// ------------- <Загрузка готовой сцены устройств> ------------- //
	function clearWorkArea(){
		pcList = new Array();
		selectedPC = new Array();
		document.getElementById('workArea').innerHTML='';
	}
	
	$('#pcListSubmit').click(function(){
		clearWorkArea();
	
		var str = document.getElementById('pcListText').value;
		pcList = JSON.parse(str);
		
		for(var i=0; i<pcList.length; i++)
		{
			var div = document.createElement('div');
			var pcTitle = "Компьютер "+(parseInt(pcList[i].Id)+1);
			var smallCharWidth = 8; // омпьютер <№>
			var largeCharWidth = 10; // К
			div.innerHTML = '<div style="background:white; border-radius: 3px;">'+pcTitle;
			div.style.width = largeCharWidth+((pcTitle.length-1)*smallCharWidth)+"px";
			div.style.paddingLeft = "3px";
			div.style.paddingRight = "3px";					
			div.style.position = 'relative';
			div.style.left = pcList[i].left+'px';
			div.style.top = (pcList[i].top-i*$('.slave').height())+'px';
			var ddiv = $(div);
			ddiv.addClass('slave');
			ddiv.prepend('<div><img src='+$('.master').attr('src')+' alt="'+pcList[i].Id+'"></div>');
			$('#workArea').append(ddiv);
			
			for(var j=0; j<pcList[i].linksList.length; j++)
			{
				var pc1 = pcList[pcList[i].linksList[j].pc1];
				var pc2 = pcList[pcList[i].linksList[j].pc2];
				drawLine(pc1.left+($('.slave').width()/2), pc1.top+($('.slave').height()/2), pc2.left+($('.slave').width()/2), pc2.top+($('.slave').height()/2),2,'red');
				//Сообщаем полю о хранимой им связи
				var canvasList = document.getElementsByClassName('line');
				var lastCanvas = canvasList[canvasList.length-1];
				lastCanvas.Id = pcList[i].linksList[j].pc1+"|"+pcList[i].linksList[j].pc2;	
			}
		}
		slaveMousedownListener();
		window.location = "#close";
	});
// ------------ </Загрузка готовой сцены устройств> ------------- //

// --------------- <Обработка событий клавиш> ------------------- //
	//Работа с модальным окном
	$('#openModalButton').click(function(){
			window.location = "#openModal";
	});
	
	// Обработка событий клавиш клавиатуры
	$(document).keyup(function(e) {
		if (e.keyCode == 27) { // 'Ecs'
			hideSettingsList();
			removeSelection();
			removeSelectedSettings();
		}
		else if(e.keyCode == 76){ // 'L'
			$('#createLink').trigger('click');
		}
	});
	
	// Выгрузка готовой сцены устройств
	$('#getPcList').click(function(){
		var str = JSON.stringify(pcList);
		console.log(str);
	});
	
	// Открытие модального окна для загрузки сцены
	$('#setPcList').click(function(){
		window.location = "#openModal";
		document.getElementById('leftStatisticsIB').style.display='none';
		document.getElementById('rightStatisticsIB').style.display='none';
		document.getElementById('centerStatisticsIB').style.display='none';
		document.getElementById('pcListForm').style.display='block';
	});
// --------------- </Обработка событий клавиш> ------------------ //

// ---------------------- <Вычисление> --------------------------- //
	$('#calculate').click(function(){
		var linksArr = new Array();
		var cntActiveLinks = 0;
		selectedPC = getSelectedDevices();
		
		if(selectedPC.length==2){
		
			var iterationCnt = parseInt(document.getElementById("iterationCnt").value);
			var networkFailuresTimeArr = new Array();
			var copyAllSelectedDevicesAndLinksArr = new Array();
			var networkRecoveryTimeArr = new Array();

			for(var iter=0; iter<iterationCnt; iter++){
				//if(!iter)console.log("---"+iter)
				// Получаем все возможные маршруты для каждого устройства
				var ownPCsLinksArr = getAllOwnPCsLinks();		
				ownPCsLinksArr = addOtherPCsLinks(ownPCsLinksArr);
				ownPCsLinksArr = excludeEqualLinks(ownPCsLinksArr)//Все устр., все связи
				var allLinks = ownPCsLinksArr[0].linkArr.slice();
				ownPCsLinksArr = makeFinOwnPCsLinksArr(ownPCsLinksArr);
				// ----
				var foundLinks = findEqualSelectedDevicesWithLink(ownPCsLinksArr, selectedPC);
				var cutedFoundLinks = cutSelectedRang(foundLinks, selectedPC);
				//console.log(cutedFoundLinks) //Все линии связей содержащие выбранные устройства
				
				//Получаем массив устройств
				var allPCsArr = new Array();
				for(var i=0; i<pcList.length; i++){
					var obj = {'Id':pcList[i].Id, 'failure':pcList[i].failure};
					allPCsArr[allPCsArr.length]=obj;
				}
				
				var allDevicesAndLinks = allPCsArr.concat(allLinks);
				//console.log(allDevicesAndLinks)
			
				var selectedDevicesArr = new Array();
				for(var i=0; i<cutedFoundLinks.length; i++){
					var innerSelectedDevicesArr = new Array();
					for(var j=0; j<cutedFoundLinks[i].length; j++){
						for(var r=0; r<pcList.length; r++)
							if(cutedFoundLinks[i][j] == pcList[r].Id){
								var obj={'Id':pcList[r].Id, 'failure':pcList[r].failure}
								innerSelectedDevicesArr[innerSelectedDevicesArr.length]=obj;
								
							}							
					}
					selectedDevicesArr[selectedDevicesArr.length]=innerSelectedDevicesArr;
				}
				//console.log(selectedDevicesArr)//массив выделенных устройст
					
				var selectedLinksArr = new Array();
				for(var i=0; i<cutedFoundLinks.length; i++){
					var betterSelectedPCsLinksArr = new Array();
					for(var j=0; j<cutedFoundLinks[i].length-1; j++)
						for(var r=0; r<allLinks.length; r++)
							if((cutedFoundLinks[i][j] == allLinks[r].pc1 && cutedFoundLinks[i][j+1] == allLinks[r].pc2) || (cutedFoundLinks[i][j] == allLinks[r].pc2 && cutedFoundLinks[i][j+1] == allLinks[r].pc1))
								betterSelectedPCsLinksArr[betterSelectedPCsLinksArr.length]=allLinks[r];
					selectedLinksArr[selectedLinksArr.length]=betterSelectedPCsLinksArr;
				}
				//console.log(selectedLinksArr)//массив выделенных связей
					
				var allSelectedDevicesAndLinksArr = new Array();
				for(var i=0; i<cutedFoundLinks.length; i++)
					allSelectedDevicesAndLinksArr[allSelectedDevicesAndLinksArr.length]=selectedDevicesArr[i].concat(selectedLinksArr[i]);
				//console.log(allSelectedDevicesAndLinksArr)//все выделенные устройства и связи
				if(!iter)copyAllSelectedDevicesAndLinksArr = allSelectedDevicesAndLinksArr.slice();
			
				var commonFailureTime = 0;
				var commonRecoveryTime = 0;
				var networkIsCrashed = false;
				var aPCsa = allPCsArr.length;
				var aPCsl = allLinks.length;
				
				var cntWorkers = parseInt(document.getElementById("cntWorkers").value);
				var intensive = parseFloat(document.getElementById("intensive").value);
				
				var recoveryArr = new Array();
				var innerRecoveryArr = new Array();
				for(var i=0; i<cntWorkers; i++)
					recoveryArr[recoveryArr.length]=innerRecoveryArr;
				
				while(!networkIsCrashed){
					// Сумма отказов сети (lambda)
					var sumFailures=0;
					for(var i=0; i<allDevicesAndLinks.length; i++)
						sumFailures+=parseFloat(allDevicesAndLinks[i].failure);
						
					// Массив ширины интенсивности отказов элементов
					var conditinalCrashedStatisticsArr = new Array();
					for(var i=0; i<allDevicesAndLinks.length; i++)
						conditinalCrashedStatisticsArr[conditinalCrashedStatisticsArr.length]=parseFloat(allDevicesAndLinks[i].failure)/sumFailures;
					
					//Разыгрываем отказ
					var rnd = Math.random();
					var crashedDeviceId=-1;
					var sumB = 0;
					var sumE = 0;
					for(var i=-1; i<conditinalCrashedStatisticsArr.length-1; i++){
						
						if(i == -1){
							sumE+=conditinalCrashedStatisticsArr[i+1];
						}
						else {
							sumB+=conditinalCrashedStatisticsArr[i];
							sumE+=conditinalCrashedStatisticsArr[i+1]
						}
						
						if(rnd >= sumB && rnd < sumE)
								crashedDeviceId=i+1;
					}
					//console.log(crashedDeviceId)
					
					var time = (-1/parseFloat(allDevicesAndLinks[crashedDeviceId].failure))*Math.log(rnd);					
					commonFailureTime+=parseFloat(time);
					
					/*console.log("До восстановления")
					console.log(recoveryArr)
					console.log(allDevicesAndLinks)
					console.log(allSelectedDevicesAndLinksArr)*/
					//Восстановление устройства
					var recoveryType = document.getElementById("recoverySelect").options.selectedIndex;
					if(recoveryType > 0){
						for(var i=0; i<recoveryArr.length; i++){
							var tmpArr = new Array();
							for(var j=0; j<recoveryArr[i].length; j++){
								if(commonFailureTime >= recoveryArr[i][j].failureTime+intensive){
									allDevicesAndLinks = recoveryElementToDevicesAndLinks(recoveryArr[i][j], allDevicesAndLinks, allSelectedDevicesAndLinksArr);
									allSelectedDevicesAndLinksArr = recoveryElementToSelectedDevicesAndLinks(recoveryArr[i][j], allDevicesAndLinks, allSelectedDevicesAndLinksArr);
									if(typeof recoveryArr[i][j].element.Id !== "undefined") aPCsa++;
									else if(typeof recoveryArr[i][j].element.pc !== "undefined") aPCsl++;
									commonRecoveryTime+=intensive;
								}
								else tmpArr[tmpArr.length]=recoveryArr[i][j];
							}
							recoveryArr[i]=tmpArr;
						}							
					}
					
					/*console.log("После восстановления")
					console.log(recoveryArr)
					console.log(commonFailureTime)
					console.log(allDevicesAndLinks)
					console.log(allSelectedDevicesAndLinksArr)*/
					
					var allSelectedPCsStatus = new Array();
					var commonStatus=false;
					for(var i=0; i<allSelectedDevicesAndLinksArr.length; i++){
						allSelectedPCsStatus[allSelectedPCsStatus.length]=findInFullDevicesAndLinksArr(allSelectedDevicesAndLinksArr[i], selectedDevicesArr[i].length, selectedLinksArr[i].length, allDevicesAndLinks[crashedDeviceId]);
						commonStatus|=allSelectedPCsStatus[allSelectedPCsStatus.length-1];
					}
					//console.log(allSelectedPCsStatus)//массив поиска сломанного устройства в списке подсетей

					//Исключаем и из общего и из частного
					if(commonStatus){// Устройство найдено в подсетях
						var recoveryMinId = 0;
						if(recoveryType > 0){
							var recoveryMin = recoveryArr[0].length;
							for(var i=1; i<recoveryArr.length; i++)
								if(recoveryMin > recoveryArr[i].length){
									recoveryMin = recoveryArr[i].length;
									recoveryMinId = i;
								}
						}
						
						if(recoveryType == 1){ //FIFO
							var obj = {'Id':crashedDeviceId, 'element':allDevicesAndLinks[crashedDeviceId], 'failureTime':commonFailureTime, 'paths':new Array()}
							var tmpArr = recoveryArr[recoveryMinId].slice();
							tmpArr[tmpArr.length]=obj;
							recoveryArr[recoveryMinId]=tmpArr;
							//console.log(recoveryArr)
						}
						/*if(recoveryType == 2){ //IF
							var obj = {'Id':crashedDeviceId, 'element':allDevicesAndLinks[crashedDeviceId], 'failureTime':commonFailureTime, 'paths':new Array()}
							
							recoveryArr = new Array();
							for(var i=0; i<recoveryArr.length; i++){
								var innerRecoveryArr = new Array();
								for(var j=0; j<recoveryArr[i].length; j++)
									if(typeof recoveryArr[i][j].element.Id !== "undefined")
										for(var l=0; l<pcList.length; l++)
											if(pcList[l].Id == recoveryArr[i][j].element.Id)
												if(pcList[l].linksList.length < allDevicesAndLinks[crashedDeviceId].linksList.length)
													innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
												else if(pcList[l].linksList.length == allDevicesAndLinks[crashedDeviceId].linksList.length){
													innerRecoveryArr[innerRecoveryArr.length]=obj;
													innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
												}
												else innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
											else if(pcList[l].pc1 == recoveryArr[i][j].element.pc1){
												for(var k=0; k<pcList.length; k++)
													if(pcList[k].pc2 == recoveryArr[i][j].element.pc2)
														if(pcList[l].linksList.length>pcList[k].linksList.length)															
															if(pcList[l].linksList.length < allDevicesAndLinks[crashedDeviceId].linksList.length)
																innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
															else if(pcList[l].linksList.length == allDevicesAndLinks[crashedDeviceId].linksList.length){
																innerRecoveryArr[innerRecoveryArr.length]=obj;
																innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
															}
															else innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
														else if(pcList[k].linksList.length < allDevicesAndLinks[crashedDeviceId].linksList.length)
																innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
															else if(pcList[k].linksList.length == allDevicesAndLinks[crashedDeviceId].linksList.length){
																innerRecoveryArr[innerRecoveryArr.length]=obj;
																innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
															}
															else innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
														else if(pcList[l].pc2 == recoveryArr[i][j].element.pc1){
														for(var k=0; k<pcList.length; k++)
															if(pcList[k].pc1 == recoveryArr[i][j].element.pc2)
																if(pcList[l].linksList.length>pcList[k].linksList.length)															
																	if(pcList[l].linksList.length < allDevicesAndLinks[crashedDeviceId].linksList.length)
																		innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
																	else if(pcList[l].linksList.length == allDevicesAndLinks[crashedDeviceId].linksList.length){
																		innerRecoveryArr[innerRecoveryArr.length]=obj;
																		innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
																	}
																	else innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
																else if(pcList[k].linksList.length < allDevicesAndLinks[crashedDeviceId].linksList.length)
																		innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
																	else if(pcList[k].linksList.length == allDevicesAndLinks[crashedDeviceId].linksList.length){
																		innerRecoveryArr[innerRecoveryArr.length]=obj;
																		innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
																	}
																	else innerRecoveryArr[innerRecoveryArr.length]=recoveryArr[i][j];
											}
									}
								recoveryArr[recoveryArr.length]=innerRecoveryArr;
							}
						}*/
						/*console.log(allDevicesAndLinks)
						console.log(aPCsa)
						console.log(aPCsl)*/
						allDevicesAndLinks = excludeInFullDevicesAndLinksArr(allDevicesAndLinks, aPCsa, aPCsl, allDevicesAndLinks[crashedDeviceId]);//?????????? ?????
						if(crashedDeviceId < aPCsa) aPCsa--;
						else aPCsl--;

						if(allSelectedDevicesAndLinksArr.length >= 1){
							var innerRecoveryArr = new Array();
							
							var tmpAllSelectedDevicesAndLinksArr = new Array();							
							for(var i=0; i<allSelectedDevicesAndLinksArr.length; i++)
								if(!allSelectedPCsStatus[i])
									tmpAllSelectedDevicesAndLinksArr[tmpAllSelectedDevicesAndLinksArr.length]=allSelectedDevicesAndLinksArr[i];
								else innerRecoveryArr[innerRecoveryArr.length]=allSelectedDevicesAndLinksArr[i];
								
								if(recoveryType > 0)
									recoveryArr[recoveryMinId][recoveryArr[recoveryMinId].length-1].paths=innerRecoveryArr;
								
							allSelectedDevicesAndLinksArr=tmpAllSelectedDevicesAndLinksArr;
						}

						if(!allSelectedDevicesAndLinksArr.length)
							networkIsCrashed=true;
						
						/*console.log("После отказа")
						console.log(aPCsa)
						console.log(aPCsl)
						console.log(recoveryArr)
						console.log(allDevicesAndLinks)
						console.log(allSelectedDevicesAndLinksArr)
						console.log("==")*/
					}
				}
				//console.log("---")
				networkFailuresTimeArr[networkFailuresTimeArr.length]=commonFailureTime;
				networkRecoveryTimeArr[networkRecoveryTimeArr.length]=commonRecoveryTime;
			}
			//console.log(networkFailuresTimeArr);
			//console.log(networkRecoveryTimeArr);
			//console.log(copyAllSelectedDevicesAndLinksArr)
			
			var rMin = findMinOrMax(networkRecoveryTimeArr, "min");
			var rMax = findMinOrMax(networkRecoveryTimeArr, "max");
			var rAvSum = 0;
			for(var i=0; i<networkRecoveryTimeArr.length; i++)
				rAvSum+=networkRecoveryTimeArr[i];
			var rAverege = rAvSum/networkRecoveryTimeArr.length;
			
			var mMax = findMinOrMax(networkFailuresTimeArr, "max");
			var mMin = findMinOrMax(networkFailuresTimeArr, "min");
			var difference = mMax - mMin;
			
			var avSum = 0;
			for(var i=0; i<networkFailuresTimeArr.length; i++)
				avSum+=networkFailuresTimeArr[i];
			var averege = avSum/networkFailuresTimeArr.length;
				
			var cntParts = 20;
			var timeRangesArr = new Array();
			for(var j=0; j<cntParts+1; j++)
				timeRangesArr[timeRangesArr.length]=((difference/cntParts)*j).toFixed(2);

			//Расчет практического графика
			var statisticsArr = calculateConditionStatistics(networkFailuresTimeArr, cntParts, difference/cntParts);
			//console.log(statisticsArr)
			
			//Расчет теоретического графика
			
			//Расчет коэффициентов балансировки
			var isOneWay = true;
			if(copyAllSelectedDevicesAndLinksArr.length > 1){
				var dividedSelectedDevicesAndLinksArr = new Array();
				for(var i=0; i<copyAllSelectedDevicesAndLinksArr.length; i++){
					//Вычисляем количество устройств и линий связи для i-го пути
					var cntDevicesInPath = 0;
					for(var j=0; j<copyAllSelectedDevicesAndLinksArr[i].length; j++)
						if(typeof copyAllSelectedDevicesAndLinksArr[i][j].Id !== "undefined")
							cntDevicesInPath++;
					var cntLinksInPath = copyAllSelectedDevicesAndLinksArr[i].length-cntDevicesInPath;
					
					var obj = {'deviceCnt':cntDevicesInPath, 'linksCnt':cntLinksInPath}
					dividedSelectedDevicesAndLinksArr[dividedSelectedDevicesAndLinksArr.length]=obj;
				}

				var includesCntElsArr = new Array();
				for(var i=0; i<copyAllSelectedDevicesAndLinksArr.length; i++){
					var cntCmpInMat = new Array();
					for(var j=0; j<copyAllSelectedDevicesAndLinksArr[i].length; j++){
						var el=copyAllSelectedDevicesAndLinksArr[i][j];
						var cntCmpInArr = 0;
						for(var l=0; l<copyAllSelectedDevicesAndLinksArr.length; l++)
							if(findInFullDevicesAndLinksArr(copyAllSelectedDevicesAndLinksArr[l], dividedSelectedDevicesAndLinksArr[l].deviceCnt, dividedSelectedDevicesAndLinksArr[l].linksCnt, el))
								cntCmpInArr++;
						cntCmpInMat[cntCmpInMat.length]=cntCmpInArr;
					}					
					includesCntElsArr[includesCntElsArr.length]=cntCmpInMat;
				}		
				isOneWay=false;
			}
			else {
				var includesCntElsArr = new Array();
				var innerIncludesCntElsArr = new Array();
				for(var i=0; i<copyAllSelectedDevicesAndLinksArr[0].length; i++)
					innerIncludesCntElsArr[innerIncludesCntElsArr.length]=1;
				includesCntElsArr[includesCntElsArr.length]=innerIncludesCntElsArr;
			}
			//console.log(includesCntElsArr)
			
			//Вычисляем массив вероятностей
			var allPArr = new Array();
			for(var i=0; i<copyAllSelectedDevicesAndLinksArr.length; i++){
				var innerParr = new Array();
				//console.log(includesCntElsArr)
				for(var j=0; j<timeRangesArr.length; j++)
					innerParr[innerParr.length]=calculatePi(copyAllSelectedDevicesAndLinksArr[i], includesCntElsArr[i], timeRangesArr[j]);
				allPArr[allPArr.length]=innerParr;
			}
			//console.log(allPArr)
			
			//Находим общий массив функции вероятности
			var finalPArr = new Array();
			for(var i=0; i<timeRangesArr.length; i++){
				var tmpP = 1;
				for(var j=0; j<allPArr.length; j++){
					tmpP*=(1-allPArr[j][i]);
				}
				finalPArr[finalPArr.length]=1-tmpP;
			}
			//console.log(finalPArr)//Итоговый массив вероятностей
			
			//Формирование теоретического графика 
			var drawXYarr = new Array();
			for(var i=0; i<timeRangesArr.length; i++){
				var objXY = {'x':timeRangesArr[i], 'y':/*statisticsArr[i]/*/finalPArr[i]};
				drawXYarr[drawXYarr.length]=objXY;
			}
			
			//Формирование практического графика
			var headerArr = new Array();
			var backgroundColorArr = new Array();
			var borderColorArr = new Array();
			for(var j=0; j<statisticsArr.length; j++)
			{
				backgroundColorArr[backgroundColorArr.length]='rgba(255, 99, 132, 0.4)';
				borderColorArr[borderColorArr.length]='rgba(255,99,132,1)';
			}
			
			//отрисовка графиков
			drawLineGraph("myChart", "Кривая распределения времени отказа сети", drawXYarr);
			drawHystogramGraph("myChart2", "Гистограмма времени отказа сети", statisticsArr, timeRangesArr, backgroundColorArr, borderColorArr);
			
			document.getElementById('pcListForm').style.display='none';
			document.getElementById('leftStatisticsIB').style.display='block';
			document.getElementById('rightStatisticsIB').style.display='block';
			document.getElementById('centerStatisticsIB').style.height=100+"px";
			
			var calcCoeff = averege / (averege + rAverege);
			var cf = 10000;
			var outputTxt = '<label>Минимальное время безотказной работы: '+mMin*cf+' ч.</label></br>'+
			'<label>Среднее время безотказной работы: '+averege*cf+' ч.</label></br>'+
			'<label>Максимальное время безотказной работы: '+mMax*cf+' ч.</label></br>'+((recoveryType)?
			'<label>Среднее время восстановления: '+rAverege*cf+' ч.</label></br>'+
			'<label>Коэффициент восстановления: '+calcCoeff.toFixed(2)+'</label>':'')
			document.getElementById('centerStatisticsIB').innerHTML = outputTxt;
			
			document.getElementById('centerStatisticsIB').style.display='block';
			window.location = "#openModal";
		}
		else alert('Выберите два компьютера для анализа отказоустойчивости подсети!');
	});
	
	function recoveryElementToDevicesAndLinks(el, allDevicesAndLinks, allSelectedDevicesAndLinksArr){
		var newAllDevicesAndLinks = new Array();
		for(var i=0; i<allDevicesAndLinks.length; i++)
			if(i == el.Id){
				newAllDevicesAndLinks[newAllDevicesAndLinks.length]=el.element;
				newAllDevicesAndLinks[newAllDevicesAndLinks.length]=allDevicesAndLinks[i];
			}
			else newAllDevicesAndLinks[newAllDevicesAndLinks.length]=allDevicesAndLinks[i];
			
		return newAllDevicesAndLinks;
	}
	
	function recoveryElementToSelectedDevicesAndLinks(el, allDevicesAndLinks, allSelectedDevicesAndLinksArr){
		for(var i=0; i<el.paths.length; i++)
			allSelectedDevicesAndLinksArr[allSelectedDevicesAndLinksArr.length]=el.paths[i];
		
		return allSelectedDevicesAndLinksArr;
	}
	
	function calculatePi(devicesAndLinksArr, coefficient, timePoint){
		var failuresSum = 0;
		for(var i=0; i<devicesAndLinksArr.length; i++)
			failuresSum+=devicesAndLinksArr[i].failure/coefficient[i];
		
		return Math.exp(-failuresSum*timePoint)
	}
	
	function excludeInFullDevicesAndLinksArr(fullDevicesAndLinksArr, devicesCnt, linksCnt, excludeRecord){
		/*console.log(fullDevicesAndLinksArr)
		console.log(devicesCnt)
		console.log(linksCnt)
		console.log(excludeRecord)*/
		var newFullDevicesAndLinksArr = new Array();
		var deviceExcluded = false;
		for(var i=0; i<devicesCnt; i++){
			if(fullDevicesAndLinksArr[i].Id == excludeRecord.Id && typeof excludeRecord.Id !== "undefined"){			
				deviceExcluded = true;
				continue;
			}
			else newFullDevicesAndLinksArr[newFullDevicesAndLinksArr.length]=fullDevicesAndLinksArr[i];
		}
		
		for(var i=0; i<linksCnt; i++){
			if(!deviceExcluded){
				if(fullDevicesAndLinksArr[devicesCnt+i].pc1 == excludeRecord.pc1 && fullDevicesAndLinksArr[devicesCnt+i].pc2 == excludeRecord.pc2)
					continue;
				else newFullDevicesAndLinksArr[newFullDevicesAndLinksArr.length]=fullDevicesAndLinksArr[devicesCnt+i];
			}
			else newFullDevicesAndLinksArr[newFullDevicesAndLinksArr.length]=fullDevicesAndLinksArr[devicesCnt+i];				
		}
		
		return newFullDevicesAndLinksArr;
	}
	
	function findInFullDevicesAndLinksArr(fullDevicesAndLinksArr, devicesCnt, linksCnt, findRecord){
		var isFind = false;
		var foundInDevices = false;
		for(var i=0; i<devicesCnt; i++){
			if(fullDevicesAndLinksArr[i].Id == findRecord.Id){
				isFind=true;
				break;
			}
		}
		
		for(var i=0; i<linksCnt; i++){
			if(!foundInDevices)
				if(fullDevicesAndLinksArr[devicesCnt+i].pc1 == findRecord.pc1 && fullDevicesAndLinksArr[devicesCnt+i].pc2 == findRecord.pc2){
					isFind=true;
					break;
				}
		}
		
		return isFind;
	}
	
	function resetObjectDOM(elemId)
			{
				var elem = document.getElementById(elemId);
				var elemParent = elem.parentNode;
				elemParent.removeChild(elem);
				
				
				var newCanvas = document.createElement('canvas');
				newCanvas.id = elemId;
				elemParent.appendChild(newCanvas);
			}
			
	function drawHystogramGraph(elemId, header, data, labels, backgroundColor, borderColor)
			{
				// Блок для устранения повторной отрисовки <-- костыль
				resetObjectDOM(elemId)
				var canvas = document.getElementById(elemId);
				// конец костыля =)
				
				setTimeout(function(){
				var ctx = document.getElementById(elemId);
				var myChart = new Chart(ctx, {
					type: 'bar',
					data: {
						labels: labels,
						datasets: [{
							label: header,
							data: data,
							backgroundColor: backgroundColor,
							borderColor: borderColor,
							borderWidth: 1,
						}]
					},
					options: {
						scales: {
							yAxes: [{
								ticks: {
									beginAtZero:true
								}
							}]
						}
					}
				});
				}, 500);
			}
	
	function drawLineGraph(elemId, header, data)
			{
				// Блок для устранения повторной отрисовки <-- костыль
				resetObjectDOM(elemId)
				var canvas = document.getElementById(elemId);
				// конец костыля =)
				
				setTimeout(function(){
				var ctx = document.getElementById(elemId);
					var scatterChart = new Chart(ctx, {
					type: 'line',
					data: {
						datasets: [{
							label: header,
							data: data
						}]
					},
					options: {
						scales: {
							xAxes: [{
								type: 'linear',
								position: 'bottom'
							}]
						},
						//height: ctx2Height 
					}
				});
				}, 500);
			}
	
	function findMinOrMax(arr, operation){
		var m = arr[0];
		for(var i=1; i<arr.length; i++){
			if(operation == "min")
				if(m > arr[i])
					m = arr[i];
			if(operation == "max")
				if(m < arr[i])
					m = arr[i];
		}
				
		return m;
	}
	
	function calculateConditionStatistics(arr, cntParts, valueOnePart){	
		var statisticsArr = new Array();
		for(var i=0; i<cntParts; i++)
			statisticsArr[statisticsArr.length]=0;
		
		for(var i=0; i<arr.length; i++){
			for(var j=0; j<cntParts-1; j++)
				if((arr[i] >= valueOnePart*j) && (arr[i] < valueOnePart*(j+1)))
					statisticsArr[j]+=1;		
		}
		
		return statisticsArr;
	}
	
	function addFailureToDevices(arr){
		var failuresArr = new Array();
		for(var i=0; i<arr.length; i++)
			for(var j=0; j<pcList.length; j++)
				if(pcList[j].Id == arr[i])
					failuresArr[failuresArr.length]=pcList[j].failure;
		
		var failuresAndDevicesArr = new Array();
		for(var i=0; i<failuresArr.length; i++){
			var obj = {'Id':arr[i], 'failure':failuresArr[i]};
			failuresAndDevicesArr[failuresAndDevicesArr.length]=obj;
		}

		return failuresAndDevicesArr;
	}
	
	function getLinksArray(arr)
	{
		var onlyLinksArr = new Array();
			for(var k=0; k<arr.length-1; k++)
			{
				var pc1 = arr[k];
				var pc2 = arr[k+1];
				for(var i=0; i<pcList.length; i++){
					if(pcList[i].Id == pc1/* || pcList[i].Id == pc2*/){
						for(var e=0; e<pcList[i].linksList.length; e++)
							if(pcList[i].linksList[e].pc1 == pc1 && pcList[i].linksList[e].pc2 == pc2 || pcList[i].linksList[e].pc1 == pc2 && pcList[i].linksList[e].pc2 == pc1){
								onlyLinksArr[onlyLinksArr.length]=pcList[i].linksList[e];
								break;
							}
					}
				}
			}
			
		return onlyLinksArr;
	}
	
	// Обрезаем массивы линий по конечной границе
	function cutSelectedRang(foundLinksWithSelectedPCsArr, selected2PCsArr){
		
		var cutedLinksArr = new Array();
		for(var i=0; i<foundLinksWithSelectedPCsArr.length; i++){
			var innerLinkArr = new Array();
			var isFound = false;
			for(var j=0; j<foundLinksWithSelectedPCsArr[i].length; j++){
				var flp = foundLinksWithSelectedPCsArr[i][j];				
				if(!isFound){
					if(flp != selected2PCsArr[1]){
						innerLinkArr.push(flp);
					}
					else {
						innerLinkArr.push(flp);
						isFound=true;
					}
				}
			}
			cutedLinksArr.push(innerLinkArr);
		}
		
		// Пост-обработка: удаление одинаковых массивов
		var lastCutedLinksArr = new Array();
		lastCutedLinksArr.push(cutedLinksArr[0]);
		for(var i=1; i<cutedLinksArr.length; i++){
			var cntEqualsArr = 0;
			for(var j=0; j<lastCutedLinksArr.length; j++)
				if(cutedLinksArr[i].toString() != lastCutedLinksArr[j].toString())
					cntEqualsArr++;
					
				if(cntEqualsArr == lastCutedLinksArr.length)
					lastCutedLinksArr.push(cutedLinksArr[i]);
		}
		
		return lastCutedLinksArr;
	}
	
	// Поиск линий в которых присутствует промежуток между устройствами
	function findEqualSelectedDevicesWithLink(commonPCsLinksArr, selected2PCsArr){
			var foundLinks = new Array();
			for(var i=0; i<commonPCsLinksArr.length; i++){
				if(commonPCsLinksArr[i].path[0] == selected2PCsArr[0]){
					var isFound = false;
					for(var j=0; j<commonPCsLinksArr[i].path.length; j++)
						if(commonPCsLinksArr[i].path[j] == selected2PCsArr[1])
							foundLinks.push(commonPCsLinksArr[i].path);
				}
			}
			return foundLinks;
		}

	// Получить массив собственных связей устройств
	function getAllOwnPCsLinks(){
		var ownPCsLinksArr = new Array();
		
		for(var i=0; i<pcList.length; i++){
			var obj = {'Id':pcList[i].Id, 'linkArr':pcList[i].linksList};
			ownPCsLinksArr[ownPCsLinksArr.length]=obj;
		}
		
		return ownPCsLinksArr;
	}
	
	function makeFinOwnPCsLinksArr(ownPCsLinksArr){
		var commonPCsLinksArr = new Array();
		
		//Подготовительный этап - добавляем начальные узлы в список маршрутизации
		for(var i=0; i<ownPCsLinksArr.length; i++){
			var sts = {'closed':false, 'path':new Array()};
			sts.path[sts.path.length] = ownPCsLinksArr[i].Id;//0
			commonPCsLinksArr[commonPCsLinksArr.length] = sts;
		}

		// Находим все смежные узлы в соответствующих линиях
		var closedCnt = 0;
		while(closedCnt != commonPCsLinksArr.length){
			var cntSteps = commonPCsLinksArr.length;
			for(var i=0; i<cntSteps; i++){
				if(!commonPCsLinksArr[i].closed){
					var lastId = commonPCsLinksArr[i].path[commonPCsLinksArr[i].path.length-1];
					var neighborsArr = getNeighborsArr(lastId, ownPCsLinksArr);
					//console.log("i="+i)
					//console.log(lastId)
					//console.log(neighborsArr)
					
					if(neighborsArr.length == 1){
						//console.log("add_1p:"+commonPCsLinksArr[i].path)
						if(findEqual(commonPCsLinksArr[i].path, neighborsArr[0]) == false)
							commonPCsLinksArr[i].path[commonPCsLinksArr[i].path.length]=neighborsArr[0];
						else commonPCsLinksArr[i].closed = true;					
						//console.log("add_1n:"+commonPCsLinksArr[i].path)
					}
					else if(neighborsArr.length > 1){				
						var copyPCsLinksArr = commonPCsLinksArr[i].path.slice();
						//console.log("all2:"+copyPCsLinksArr)
						var useFS = false;
						if(findEqual(copyPCsLinksArr, neighborsArr[0]) == false){
							//console.log("add_2p:"+commonPCsLinksArr[i].path)
							var dbCopyPCsLinksArr = copyPCsLinksArr.slice();
							dbCopyPCsLinksArr[dbCopyPCsLinksArr.length]=neighborsArr[0];
							var sts = {'closed':false, 'path':dbCopyPCsLinksArr};
							commonPCsLinksArr[i] = sts;
							//console.log("add_2n:"+commonPCsLinksArr[i].path)
							useFS=true;
						}
						else {
							commonPCsLinksArr[i].closed = true;
							useFS=true;
						}
						
						for(var j=1; j<neighborsArr.length; j++){
							var dbCopyPCsLinksArr = copyPCsLinksArr.slice();
							//console.log("all3:"+dbCopyPCsLinksArr)
							
							if(findEqual(dbCopyPCsLinksArr, neighborsArr[j]) == false){
								//console.log("add_3p:"+dbCopyPCsLinksArr)
								dbCopyPCsLinksArr[dbCopyPCsLinksArr.length]=neighborsArr[j];
								var sts = {'closed':false, 'path':dbCopyPCsLinksArr};
								
								if(useFS) commonPCsLinksArr[commonPCsLinksArr.length] = sts;
								else {
									commonPCsLinksArr[i].path[commonPCsLinksArr[i].path.length] = neighborsArr[j];
									useFS=true;
								}
								//console.log("add_3n:"+commonPCsLinksArr[commonPCsLinksArr.length-1].path)
							}
							else {
								var sts = {'closed':true, 'path':dbCopyPCsLinksArr};
								if(useFS) commonPCsLinksArr[commonPCsLinksArr.length] = sts;
								else {
									commonPCsLinksArr[i].closed=true;
									useFS=true;
								}
							}
						}
					}
					else commonPCsLinksArr[i].closed = true; 
					//console.log("-------")
				}
			}
		
			// Перерасчет кол-ва закрытых линий
			closedCnt=0;
			for(var i=0; i<commonPCsLinksArr.length; i++){
				if(commonPCsLinksArr[i].closed == true)
					closedCnt++;				
			}
			//console.log("--------------")
		}
		//console.log(commonPCsLinksArr)
		return commonPCsLinksArr;
	}
	
	function findEqual(arr, el){
		var equal = false;
		for(var i=0; i<arr.length; i++){
			if(arr[i] == el)
				equal=true;
		}
		return equal;
	}
	
	function getNeighborsArr(Id, ownPCsLinksArr){
		var neighborsArr = new Array();
		for(var i=0; i<ownPCsLinksArr.length; i++)
			if(ownPCsLinksArr[i].Id == Id)
				for(var j=0; j<ownPCsLinksArr[i].linkArr.length; j++){
					if(ownPCsLinksArr[i].linkArr[j].pc1 == Id)
						neighborsArr[neighborsArr.length]=ownPCsLinksArr[i].linkArr[j].pc2;
					if(ownPCsLinksArr[i].linkArr[j].pc2 == Id)
						neighborsArr[neighborsArr.length]=ownPCsLinksArr[i].linkArr[j].pc1;
				}
		return neighborsArr;
	}
	
	// Исключение одинаковых связей из листа маршрутизации каждого компьютера
	function excludeEqualLinks(ownPCsLinksArr){
		var newOwnPCsLinksArr = new Array();
		var linksArr = new Array();
		for(var i=0; i<ownPCsLinksArr.length; i++){
			var pcLinksArr = ownPCsLinksArr[i].linkArr;
			
			for(var j=0; j<pcLinksArr.length; j++){
				var pcLink = pcLinksArr[j];
				var pc1 = pcLink.pc1; 
				var pc2 = pcLink.pc2;
				
				var cntNE = 0;
				var prevLength = linksArr.length;
				for(var l=0; l<prevLength; l++){
					if(parseInt(linksArr[l].pc1) == parseInt(pc1) && parseInt(linksArr[l].pc2) == parseInt(pc2))
						break;
					else
						cntNE++;
				}

				if(cntNE == prevLength)
					linksArr.push(pcLink)
			}	
			var obj = {'Id':ownPCsLinksArr[i].Id, 'linkArr':linksArr};
			newOwnPCsLinksArr.push(obj);
		}
		return newOwnPCsLinksArr;
	}
	
	// Копируем каждому из устройств таблицы связей всех прочих устройств (у всех одинаковые таблицы маршрутизации на выходе!)
	function addOtherPCsLinks(ownPCsLinksArr){
		var ownPCsLinksArr_1 = new Array();
		var ownPCsLinksArr_2 = new Array();
		var ownPCsLinksArr_3 = new Array();
		
		for(var i=0; i<ownPCsLinksArr.length; i++){
			ownPCsLinksArr_1[i]=ownPCsLinksArr[i];
			ownPCsLinksArr_2[i]=ownPCsLinksArr[i]
			var obj = {'Id':ownPCsLinksArr[i].Id, 'linkArr':new Array()};
			ownPCsLinksArr_3[i]=obj;
		}
		
		var ownPCsLinksArrCnt=ownPCsLinksArr.length;

		for(var i=0; i<ownPCsLinksArrCnt; i++)
			for(var j=0; j<ownPCsLinksArrCnt; j++)
				ownPCsLinksArr_3[i].linkArr = ownPCsLinksArr_3[i].linkArr.concat(ownPCsLinksArr_2[j].linkArr);
		
		return ownPCsLinksArr_3;
	}
	
	function getAllPCsLinks(){
		var linksArr = new Array();
		
		cntActiveLinks = linksArr.length;
		
	}
// ---------------------- </Вычисление> -------------------------- //
});
