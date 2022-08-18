console.log('data', data);
////////////////////////////////////////////НАДСТРОЙКИ
const arrLength = data.length; // length of the processed array, set data.length to all, or set number
const arrStart = 20211222; //date format: yyyy.mm.dd
const arrAmpl = 10000; // 10000 - for h4, 1000 - for week 
////////////////////////////////////////////


//пронумеровали все элементы добавиви параметр counti, добавляем параметры barheight, shadowheight, vol
function pushToElemntsi(arr1){
	for (let i=0; i<arr1.length; i++){
		arr1[i].counti = i;
		arr1[i].barheight = arr1[i].cp - arr1[i].op;
		arr1[i].shadowheight = arr1[i].mp - arr1[i].lp;
	};
};
pushToElemntsi(data);
pushToElemntsi(usdxdata);

// добавили в массив arrLength элементов с даты начала
const arrDateStart = [];
function getDataFromDate(arr1, arr2){
	let arrStarti = findDate(arrStart, arr1);
	for (let i = arrStarti; i<arrStarti+arrLength; i++){
		if (data[i]){
			arr2.push(data[i]);
		};
	};
};

//нашли элемент старта по дате
function findDate(arrStart, arr1){
	for (let i=0; i<arr1.length; i++){
		if (arrStart==arr1[i].date){
			//console.log('array element number of your date is',i);
			return i;
		};
	};console.log('no match date. Propably entered date is weekend day. Change your date');
};

getDataFromDate(data, arrDateStart);

let usdxdataFromDate =[];
getDataFromDate(usdxdata, usdxdataFromDate)

console.log('arrDateStart', arrDateStart);
console.log('usdxdataFromDate', usdxdataFromDate);

function combineDataAndUsdx(arr1, arr2){
	for (let i=0;i<arr1.length; i++){
		arr1[i].usdxbarheight = arr2[i].barheight;
	};
};
combineDataAndUsdx(data, usdxdataFromDate);
console.log('combined', data);

//ищем скачки
const arrDateStartJump = [];
function filterArr(arr1, arr2){ //1 - на вход, 2- на выход
	//ищем скачки
	for( let i=1; i<arr1.length; i++ ){

		if ( (arr1[i].mp - arr1[i].op) > 0.002 /*|| ( arr1[i+1].mp - arr1[i].op > 0.002 ) || ( arr1[i+2].mp - arr1[i].op ) > 0.002*/ ) {
			arr1[i-1].result = 'up';
			arr2.push(arr1[i-1]);

			//i+=3;
		};

		if ( (arr1[i].op - arr1[i].lp) > 0.002 /*|| ( arr1[i].op - arr1[i+1].lp > 0.002 ) || ( arr1[i].op - arr1[i+2].lp ) > 0.002*/ ) {
			arr1[i-1].result = 'down';
			arr2.push(arr1[i-1]);
			//i+=3;
		};
	};
}; 
filterArr(arrDateStart, arrDateStartJump);
console.log('arrDateStartJump', arrDateStartJump);


//записвываем в двумерный массив наборы до прыжка и результаты после
const numBarsPrev = 500; // количество баров в наборе, ВНИМАНИЕ! влияет на настройку нейросети 491 - неделя 15мин

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
				arr2[i].result = arr1[i].result;

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
			let temparr = [arr1[i].bars[j].barheight, arr1[i].bars[j].barheight,/**/ arr1[i].bars[j].vol]
			arr2[i].bars.push(temparr);
		};
	};
};

cleanArray(arrDataToClean, arrClean);
console.log('arrClean', arrClean);



// копируем в новый массив часть данных для тренировки, остальное для теста
let arrCleanTrain=[];
let arrCleanTest=[];

//let sliced = Math.round(arrSorted.length * 0.9); // переменная для разделения массива на обучение и предсказание
//let rest = Math.round(arrSorted.length * 0.1);

let sliceNum = 20;
let sliced = arrClean.length - sliceNum; // переменная для разделения массива на обучение и предсказание

arrCleanTrain = arrClean.slice(0, sliced); // берем данные для обучения
arrCleanTest = arrClean.slice(-sliceNum);

console.log('arrCleanTrain', arrCleanTrain);
console.log('arrCleanTest', arrCleanTest);


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
let arrSorted = arrSort(arrCleanTrain);
console.log('sorted random', arrSorted)

