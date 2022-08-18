console.log('data', data);
////////////////////////////////////////////НАДСТРОЙКИ
const arrLength = data.length; // length of the processed array, set data.length to all, or set number
const arrStart = 20180101; //date format: yyyy.mm.dd
const arrAmpl = 10000; // 10000 - for h4, 1000 - for week 
////////////////////////////////////////////


//пронумеровали все элементы добавиви параметр counti, добавляем параметры barheight, shadowheight, vol
function pushToElemntsi(){
	for (let i=0; i<data.length; i++){
		data[i].counti = i;
		data[i].barheight = data[i].cp - data[i].op;
		data[i].shadowheight = data[i].mp - data[i].lp;
		data[i].date = data[i].date +'';
		data[i].time = data[i].time + '';
	};
};
pushToElemntsi();

// добавили в массив arrLength элементов с даты начала
const arrDateStart = [];
function getDataFromDate(){
	let arrStarti = findDate(arrStart);
	for (let i = arrStarti; i<arrStarti+arrLength; i++){
		if (data[i]){
			arrDateStart.push(data[i]);
		};
	};
};

//нашли элемент старта по дате
function findDate(arrStart){
	for (let i=0; i<data.length; i++){
		if (arrStart==data[i].date){
			//console.log('array element number of your date is',i);
			return i;
		};
	};console.log('no match date. Propably entered date is weekend day. Change your date');
};
getDataFromDate(); 
console.log('arrDateStart', arrDateStart);


//записываем в массив по 4 дня каждой недели и 5 как result
const arrFour = [];
function filterArr(arr1, arr2){ //1 - на вход, 2- на выход
	
	for (let i=0; i<arr1.length; i++){

		let year = arr1[i].date[0] + arr1[i].date[1] + arr1[i].date[2] + arr1[i].date[3];
		let month = arr1[i].date[4] + arr1[i].date[5];
		let day = arr1[i].date[6]+arr1[i].date[7];
		let dmy = day + ' ' + month + ' ' + year;

		if ( dmy.getDay() == 1 && arr1[i].time == '000000' ){
			for (let j=0; j<360; j++){
				arr2.push(arr1[j]);
			}
			i+=360;
		}; 
	};
}; 
filterArr(arrDateStart, arrFour);
console.log('arrFour', arrFour);




//записвываем в двумерный массив наборы до прыжка и результаты после
const numBarsPrev = 450; // количество баров в наборе, ВНИМАНИЕ! влияет на настройку нейросети

let arrWithResults = [];
let nullBar =  {
    "date": 0,
    "time": 0,
    "op": 0,
    "mp": 0,
    "lp": 0,
    "cp": 0,
    "vol": 0,
    "barheight":0,
    "shadowheight":0,
    "counti":0
  };

function getHistory(arr1, arr2){

	for (let i=0; i<arr1.length; i++){

		for (let j=0; j<data.length; j++){

			if ( arr1[i].counti == data[j].counti ){

				arr2[i] = {};
				arr2[i].bars = [];

				if ( arr1[i].barheight>0 ){
					arr2[i].result = 'up';
				};
				if ( arr1[i].barheight<0 ){
					arr2[i].result = 'down';
				};
				if ( arr1[i].barheight==0 ){
					arr2[i].result = '0';
				};

				let currentNum = data[j].counti;
				let firstNum = currentNum - numBarsPrev;

				//console.log(data[j].counti);

				for (let k=firstNum; k<currentNum; k++){
					if (data[k]){
						arr2[i].bars.push(data[k]);
					};
					if (!data[k]){
						arr2[i].bars.push(nullBar);
					}
				};
			};
		};	
	};
};
getHistory(arrDateStartJump, arrWithResults);
console.log('arrWithResults', arrWithResults);


//чистим массивы, преобразуем объекты в массивы, оставляем только числа, создаем независимую копию
let arrDataToClean = JSON.parse(JSON.stringify(arrWithResults));
let arrClean = [];

function cleanArray(arr1, arr2){
	for (let i=0; i<arr1.length; i++){
		arr2[i]=[];
		arr2[i].bars=[];
		arr2[i].result = arr1[i].result;

		for (let j=0; j<arr1[i].bars.length; j++){
			let temparr = [arr1[i].bars[j].barheight, arr1[i].bars[j].shadowheight, arr1[i].bars[j].vol]
			arr2[i].bars.push(temparr);
		};
	};
};
cleanArray(arrDataToClean, arrClean);
console.log('arrClean', arrClean);

//сортируем случайным образом, алгоритм фишера-йетса
function arrSort(arr){
	var j, temp;
		for(var i = arr.length - 1; i > 0; i--){
			j = Math.floor(Math.random()*(i + 1));
			temp = arr[j];
			arr[j] = arr[i];
			arr[i] = temp;
		}
	return arr;
};
let arrSorted = arrSort(arrClean);
console.log('sorted random', arrSorted)

// копируем в новый массив часть данных для тренировки, остальное для теста
let arrCleanTrain=[];
let arrCleanTest=[];

let sliced = Math.round(arrSorted.length * 0.8); // переменная для разделения массива на обучение и предсказание
let rest = Math.round(arrSorted.length * 0.2);
arrCleanTrain = arrSorted.slice(0, sliced); // берем данные для обучения
arrCleanTest = arrSorted.slice(-rest);

console.log('arrCleanTrain', arrCleanTrain);
console.log('arrCleanTest', arrCleanTest);


