console.log('data', data);
////////////////////////////////////////////НАДСТРОЙКИ
const arrLength = data.length; // length of the processed array, set data.length to all, or set number
const arrStart = 20201011; //date format: yyyy.mm.dd
const arrAmpl = 10000; // 10000 - for h4, 1000 - for week 
////////////////////////////////////////////

//пронумеровали все элементы добавиви параметр counti, добавляем параметры barheight, shadowheight, vol
function pushToElemntsi(arr){
	for (let i=0; i<arr.length; i++){
		arr[i].counti = i;
		arr[i].barheight = arr[i].cp - arr[i].op;
		arr[i].shadowheight = arr[i].mp - arr[i].lp;
		arr[i].date = arr[i].date +'';
		arr[i].time = arr[i].time + '';
	};
	return arr;
};

let arrDataWithLabels = pushToElemntsi(data);
let arrUsdxDataWithLabels = pushToElemntsi(usdxdata);
console.log('arrDataWithLabels', arrDataWithLabels);
console.log('usdxdata', usdxdata);

//ищем скачки
function findJump(arr1, arr2){ //1 - на вход, 2- на выход
	//ищем скачки
	for( let i=1; i<arr1.length-3; i++ ){

		if ( (arr1[i].mp - arr1[i].op) > 0.004 || ( arr1[i+1].mp - arr1[i].op > 0.004 ) || ( arr1[i+2].mp - arr1[i].op ) > 0.004 ) {
			arr1[i-1].result = 'up';
			arr2.push(arr1[i-1]);

			i+=3;
		};

		if ( (arr1[i].op - arr1[i].lp) > 0.004 || ( arr1[i].op - arr1[i+1].lp > 0.004 ) || ( arr1[i].op - arr1[i+2].lp ) > 0.004 ) {
			arr1[i-1].result = 'down';
			arr2.push(arr1[i-1]);
			i+=3;
		};
	};
}; 

const arrWithJumps = [];
findJump (arrDataWithLabels, arrWithJumps);
console.log('arrWithJumps', arrWithJumps);

//сортируем, считаем даты и время



function getDatesAndTimes(arr){
	/*
	let string00 = '00', string01 = '01', string02 = '02', string03 = '03', string03 = '03', string04 = '04', string05 = '05'
	for (let i=0; i<arr.length; i++){
		let ab = arr[i].time.substr(0,2);
		if (ab==='09'){h24+=1;}
	};*/
	//let ab = arr[i].time.substr(0,2);

	let h = [];

	let h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, h14, h15, h16, h17, h18, h19, h20, h21, h22, h23, h24;

	h1 = arr.filter(item => item.time.substr(0,2) == '01').length;
	h2 = arr.filter(item => item.time.substr(0,2) == '02').length;
	h3 = arr.filter(item => item.time.substr(0,2) == '03').length;
	h4 = arr.filter(item => item.time.substr(0,2) == '04').length;
	h5 = arr.filter(item => item.time.substr(0,2) == '05').length;
	h6 = arr.filter(item => item.time.substr(0,2) == '06').length;
	h7 = arr.filter(item => item.time.substr(0,2) == '07').length;
	h8 = arr.filter(item => item.time.substr(0,2) == '08').length;
	h9 = arr.filter(item => item.time.substr(0,2) == '09').length;
	h10 = arr.filter(item => item.time.substr(0,2) == '10').length;
	h11 = arr.filter(item => item.time.substr(0,2) == '11').length;
	h12 = arr.filter(item => item.time.substr(0,2) == '12').length;
	h13 = arr.filter(item => item.time.substr(0,2) == '13').length;
	h14 = arr.filter(item => item.time.substr(0,2) == '14').length;
	h15 = arr.filter(item => item.time.substr(0,2) == '15').length;
	h16 = arr.filter(item => item.time.substr(0,2) == '16').length;
	h17 = arr.filter(item => item.time.substr(0,2) == '17').length;
	h18 = arr.filter(item => item.time.substr(0,2) == '18').length;
	h19 = arr.filter(item => item.time.substr(0,2) == '19').length;
	h20 = arr.filter(item => item.time.substr(0,2) == '20').length;
	h21 = arr.filter(item => item.time.substr(0,2) == '21').length;
	h22 = arr.filter(item => item.time.substr(0,2) == '22').length;
	h23 = arr.filter(item => item.time.substr(0,2) == '23').length;
	h24 = arr.filter(item => item.time.substr(0,2) == '00').length;
	
	console.log('00', h24);
	console.log('01', h1);
	console.log('02', h2);
	console.log('03', h3);
	console.log('04', h4);
	console.log('05', h5);
	console.log('06', h6);
	console.log('07', h7);
	console.log('08', h8);
	console.log('09', h9);
	console.log('10', h10);
	console.log('11', h11);
	console.log('12', h12);
	console.log('13', h13);
	console.log('14', h14);
	console.log('15', h15);
	console.log('16', h16);
	console.log('17', h17);
	console.log('18', h18);
	console.log('19', h19);
	console.log('20', h20);
	console.log('21', h21);
	console.log('22', h22);
	console.log('23', h23);

};
getDatesAndTimes(arrWithJumps);


function getDaysWeek(arr){
	//let day = arr[1].date.substr(0,4)+' '+arr[0].date.substr(4,2)+' '+arr[0].date.substr(6,2);
	//console.log('day', day);

	//let date = new Date(day);
	//let weekday = date.getDay();

	//console.log('weekday', weekday);

	let day, date, weekday;
	for (let i=0; i<arr.length; i++){
		day = arr[i].date.substr(0,4)+' '+arr[i].date.substr(4,2)+' '+arr[i].date.substr(6,2);
		date = new Date(day);
		arr[i].weekday = date.getDay();
	};
	//console.log('arrWeekDays',arr);

	let day0, day1, day2, day3, day4, day5, day6;
	day1 = arr.filter(item => item.weekday == 1).length;
	day2 = arr.filter(item => item.weekday == 2).length;
	day3 = arr.filter(item => item.weekday == 3).length;
	day4 = arr.filter(item => item.weekday == 4).length;
	day5 = arr.filter(item => item.weekday == 5).length;

	console.log('day1', day1);
	console.log('day2', day2);
	console.log('day3', day3);
	console.log('day4', day4);
	console.log('day5', day5);
};

getDaysWeek(arrWithJumps);













































