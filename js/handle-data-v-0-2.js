console.log('v.0.0.6');

let arrHistory = [];
const numBarsPrev = 100;
const numValues=2;//количество значений в каждом баре
let data;

data = dataAll.bars.slice(-1500,-100);

handleBars(data);
handleBars(usdxdata);

init(data, usdxdata);

console.log('gbpusd', data);
console.log('usdxdata', usdxdata);

function handleBars(arr){
	for(let i=0; i<arr.length; i++){
		//arr[i].time += ""; 
		//arr[i].date +=  ""; 
		//arr[i].barheight = arr[i].cp - arr[i].op;
		//arr[i].heightVol = arr[i].barheight * arr[i].vol;

		arr[i].op = arr[i].open;
		arr[i].mp = arr[i].high;
		arr[i].lp = arr[i].low;
		arr[i].cp = arr[i].close;
		arr[i].barheight = arr[i].cp - arr[i].op;

	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////GRAPH
////////////////////////////////////////////////////////////////////////////////////////////////////////


makeGraph(data, gbpusd, 10000);
//makeGraph(usdxdata,usdx, 100);

function makeGraph(arr,svgid, amplitude){
	const id = svgid + "";

	const drawwidth = arr.length * 3 + 250;
	const draw = SVG(svgid).size(drawwidth, 2500);
	const middleGraphPos = 1250;
	let barcolor = '#ffffff';
	let forecastcolor = '#000000';
	const barwidth = 2;

  let barposx = 0;
  let barposy = 0;

  for (let i=0; i<arr.length; i++){
    //добавляем бары
    let result = arr[i].result
    let barheight = - arr[i].barheight * amplitude;
    if (arr[i-1]){barposy = barposy - arr[i-1].barheight * amplitude;}

    if (arr[i]){
      addBar(barposx, barposy, barheight, middleGraphPos, draw, barwidth, forecastcolor, result);
      barposx += 5;
    }
  };
};

function addBar(xPos, yPos, height, middleGraphPos, draw, barwidth, forecastcolor, result){
	if (height>0){
	  barcolor = '#4e4e4e';
	  yPos = yPos + middleGraphPos;
	};

	if (height<=0){
	  barcolor = '#C5C5C5';
	  yPos = yPos - Math.abs(height) + middleGraphPos;
	};

	if (result === 'up'){
		barcolor = '#34BC72'
	}
	if (result === 'down'){
		barcolor = '#E5750C'
	}

	let bar = draw.rect( barwidth, Math.abs(height) );
	let bar2 = draw.rect(1,1);

	bar.attr ({
	  fill: barcolor,
	  x: xPos,
	  y: yPos
	});

	bar2.attr ({
	  fill: forecastcolor,
	  x: xPos,
	  y: yPos-3
	});
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////handledata
////////////////////////////////////////////////////////////////////////////////////////////////////////

function init(arr1, arr2){
	
	let barscount = numBarsPrev;

	function getJumps(arr1, arr2){
		for (let i=barscount; i<arr1.length; i++){

			if ( arr1[i].barheight > 0.0015 ){
				arr1[i].result = 'up';
				if (arr1[i+1]&&arr1[i+1].barheight>0){
					if (arr1[i+2] && arr1[i+2].barheight>0){
						i+=2;
					};
					i++;
				};
			};

			if ( arr1[i].barheight < -0.0015 ){
				arr1[i].result = 'down';
				if (arr1[i+1]&&arr1[i+1].barheight<0){
					if (arr1[i+2] && arr1[i+2].barheight<0){
						i+=2;
					};
					i++;
				};
			};			



		};
	};
	getJumps(arr1, arr2);

	function getHistory(arr, arrhistory){
		for (let i=0; i<arr.length; i++){
			if ( arr[i].result === 'up' || arr[i].result === 'down' ){
				arrhistory.push(arr[i]);
				arrhistory[arrhistory.length-1].bars = [];
				for (j=barscount;j>0;j--){					
					arrhistory[arrhistory.length-1].bars.push(arr[i-j]);	
				}
			};
		};
	};
	getHistory(arr1, arrHistory);

	console.log ('arrHistory', arrHistory);
};

let arrClean = [];
function cleanArray(arr1, arr2){
	for (let i=0; i<arr1.length; i++){
		arr2[i]=[];
		arr2[i].bars=[];
		arr2[i].result = arr1[i].result;

		for (let j=0; j<arr1[i].bars.length; j++){
			let temparr = [ /*arr1[i].bars[j].heightVol ,*/ arr1[i].bars[j].barheight, arr1[i].bars[j].vol];
			arr2[i].bars.push(temparr);
		};
	};
};
cleanArray(arrHistory, arrClean);
console.log('arrClean', arrClean);


// копируем в новый массив часть данных для тренировки, остальное для теста
let arrCleanTrain=[];
let arrCleanTest=[];

//let sliced = Math.round(arrSorted.length * 0.9); // переменная для разделения массива на обучение и предсказание
//let rest = Math.round(arrSorted.length * 0.1);

let sliceNum = 100;
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
















