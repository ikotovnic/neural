const numValues=2;
data = dataAll.bars.slice(-3700,-500);
const numBarsPrev = 100; //!!!дублируется в другую переменную исправить
let barscount = numBarsPrev;
console.log('15min');
pushToElemntsi(data);

/*
async function getBars(){
 console.log('wait response...');
 const response = await fetch("https://alpha-vantage.p.rapidapi.com/query?to_symbol=gbp&from_symbol=usd&function=FX_INTRADAY&interval=15min&datatype=json&outputsize=full", {
  "method": "GET",
  "headers": {
   "x-rapidapi-key": "4b3202c2ccmshde9694dbadca041p1abc60jsn40f28bf57b8c",
   "x-rapidapi-host": "alpha-vantage.p.rapidapi.com"
  }
 });
return response.json();
};

(async () => {
  const respAlpha = await getBars();
  let barsObj = respAlpha['Time Series FX (15min)'];

  console.log('response from Alpha', barsObj);

  let arrBars = Object.entries(barsObj);//Object.keys(barsObj).map((key) => [Number(key), barsObj[key]]);

  console.log('convert to arr', arrBars);
})()*/

loadModel();

/////load moel
async function loadModel(){
  const model = await tf.loadLayersModel('savedmodels/31/my-model.json');

  addForecast();
  makeGraph();
  getStat(data);
  simulateTradingSL(data);
  simulateTradingSimple(data);

  function addForecast(){
     //добавляем предсказание
    let n = data.length - 100;
    for (let i=n; i<data.length; i++){
      let arrForecast = getHistoryBars(data, data[i].date, data[i].time, i);
      let arrClean = cleanArray(arrForecast);
      let a = testModel(model, arrClean);
      //console.log('a', a);

      data[i].forecast = a;
    };
  };
};

///по дате и времени выбираем бар и n количество перед ним для загрузки в нейросеть

let numBarsUse = numBarsPrev; //проверить из файла handledata
let neuronsNum = numBarsUse * numValues; //количество баров умножаем на количество значений в каждом баре

function getHistoryBars(arr1, date, time, i){

    let arr2=[];
    

      let firstI = i - numBarsUse;

      arr2[0] = {};
      arr2[0].bars = [];

      for (let j=firstI; j<i; j++){
        arr2[0].bars.push( arr1[j] );
      };
      
    
    //console.log('forecast array', arr2);
    //console.log(date, time);
    console.log(arr2);
    return arr2;
};


//чистим массивы, преобразуем объекты в массивы, оставляем только числа, создаем независимую копию
function cleanArray(arr1){
  let arr2 =[];
  for (let i=0; i<arr1.length; i++){
    arr2[i]=[];
    arr2[i].bars=[];

    for (let j=0; j<arr1[i].bars.length; j++){
      let temparr = [ arr1[i].bars[j].barheight, arr1[i].bars[j].vol];
      arr2[i].bars.push(temparr);
    };
  };
  console.log(arr2);
  return arr2;
};

//пронумеровали все элементы добавиви параметр counti, добавляем параметры barheight, shadowheight, vol
function pushToElemntsi(arr){
  for(let i=0; i<arr.length; i++){
    /*arr[i].time += ""; 
    arr[i].date +=  ""; 
    arr[i].barheight = arr[i].cp - arr[i].op;
    arr[i].heightVol = arr[i].barheight * arr[i].vol;
    arr[i].shadowHeight = arr[i].mp - arr[i].lp;
    */

        //arr[i].time += ""; 
    //arr[i].date +=  ""; 
    //arr[i].barheight = arr[i].cp - arr[i].op;
    //arr[i].heightVol = arr[i].barheight * arr[i].vol;

    arr[i].op = arr[i].open;
    arr[i].mp = arr[i].high;
    arr[i].lp = arr[i].low;
    arr[i].cp = arr[i].close;
    arr[i].barheight = arr[i].cp - arr[i].op;
  };
  console.log(arr);
};

/**/
function testModel(model, arrToPredict){
//меняем форму 
  const inputs = arrToPredict.map(d => d.bars);
  let tensorToPredict1 = tf.tensor(inputs, [ inputs.length, numBarsUse, numValues]);
  const tensorToPredict = tensorToPredict1.reshape([inputs.length, neuronsNum]);
//нормализуем
  const inputPredictMax = tensorToPredict.max();
  const inputPredictMin = tensorToPredict.min();
  const normalizedInputToPredict = tensorToPredict.sub(inputPredictMin).div(inputPredictMax.sub(inputPredictMin)); 
//запускаем предсказания и зписываем их в ys
  const ys = tf.tidy(() =>{
    const preds = model.predict(normalizedInputToPredict);
    return [preds.dataSync()];
  });
  console.log('Forecast:',ys[0][0],ys[0][1]);

  let a = ys[0][0];
  let b = ys[0][1];
  return [ys[0][0],ys[0][1]];

};


//////////////////////////////////////////////////////////////////////////////////////////////////////////GRAPH
////////////////////////////////////////////////////////////////////////////////////////////////////////
const drawwidth = data.length * 3 + 250;
const draw = SVG('#drawing').size(drawwidth, 2500);
const middleGraphPos = 1250;
const amplitude = 10000;
let barcolor = '#ffffff';
let forecastcolor = '#000000';
const barwidth = 2;

function makeGraph(){
  let barposx = 0;
  let barposy = 0;

  for (let i=0; i<data.length; i++){
    //добавляем бары
    let barheight = - data[i].barheight * amplitude;
    let shadowHeight = - data[i].shadowHeight * amplitude;
    if (data[i-1]){barposy = barposy - data[i-1].barheight * amplitude;}

    if (data[i].forecast){
      addBar(barposx, barposy, barheight, shadowHeight, data[i].forecast[0], data[i].forecast[1]);
      barposx += 5;
    }
  };
};

function addBar(xPos, yPos, height, shadowHeight, forecast1, forecast2){
  
    if (height>0){
      barcolor = '#4e4e4e';
      yPos = yPos + middleGraphPos;
    };

    if (height<=0){
      barcolor = '#C5C5C5';
      yPos = yPos - Math.abs(height) + middleGraphPos;
    };

    let forecastOpacity;

    let forecast1Round = (Math.round(forecast1*100))/100;
    let forecast2Round = (Math.round(forecast2*100))/100;

    if (forecast1 > forecast2){forecastcolor ='#e32222'; forecastOpacity = forecast1Round;  }
    if (forecast1 < forecast2){forecastcolor ='#34BC72'; forecastOpacity = forecast2Round; }

    let bar = draw.rect( barwidth, Math.abs(height) );
    let bar2 = draw.rect(1,1);
    //let shadow = draw.rect(1, Math.abs(shadowHeight));

    var text = draw.text(function(add) {
      add.tspan(forecast1Round).newLine().fill(forecastcolor);
      add.tspan(forecast2Round).newLine().fill(forecastcolor);
    })


    bar.attr ({
      fill: barcolor,
      x: xPos,
      y: yPos
    });

    bar2.attr ({
      fill: forecastcolor,
      x: xPos,
      y: yPos-5
    });


    text.attr({
      x: xPos,
      'fill-opacity': forecastOpacity,
      y: yPos-10
    });

    text.font({
      family:   'Helvetica'
    , size:     2
    , anchor:   'middle'
    , leading:  '1.5em'
    })

  
};




//////////////////////////////////////////////////////////считаем статистику



function getStat(arr){
  let countForecastTrue = 0;
  let countTotalForecasts = 0;

  let hTotalForecast = 0;
  let hTotalForecastTrue = 0;
  let hour;

  let countBatchForecastTrueTrue = 0;
  let countBatchForecastTrueFalse = 0;
  let n;

  let day, date, weekday;

  for (let i =0; i<arr.length; i++){

    ///////////////////////////////////общее число правдивых прогнозов
    //(Math.abs(arr[i+1].barheight)>=0.0015)
    if( (arr[i].forecast) && (arr[i+1]) ) {

      countTotalForecasts+=1;
      hTotalForecast+= Math.abs(arr[i].barheight);

      if( (arr[i].forecast[0]<arr[i].forecast[1]) && (arr[i+1].barheight >=0) ) {

        countForecastTrue+=1;
        hTotalForecastTrue+= Math.abs(arr[i].barheight);
        
      };

      if( (arr[i].forecast[0]>arr[i].forecast[1]) && (arr[i+1].barheight <= 0 ) ){
        countForecastTrue+=1;
        hTotalForecastTrue+= Math.abs(arr[i].barheight);
        
      };

    };
  };
  console.log('countForecastTrue=', countForecastTrue);
  console.log('countTotalForecasts=', countTotalForecasts);
  console.log('% true forecasts=',countForecastTrue/countTotalForecasts);

  console.log('hTotalForecastTrue=', hTotalForecastTrue);
  console.log('hTotalForecast=', hTotalForecast);

};

function simulateTradingSL(arr){
  let walletSumm = 0;
  let stopLoss = 0.0025;

  let extremMax, extremMin;

  for (let i=0; i<arr.length; i++){
    if ( (arr[i].forecast || arr[i].forecast == 0) && (arr[i+1]) ){

      extremMax = Math.abs(arr[i+1].mp - arr[i+1].op);
      extremMin = Math.abs(arr[i+1].lp - arr[i+1].op);


      if ( (arr[i].forecast[0]<arr[i].forecast[1]) && (arr[i+1].barheight > 0) ){
        if ( extremMin > stopLoss){ walletSumm -= stopLoss }
        else{ walletSumm += Math.abs(arr[i+1].barheight);}

      };

      if ( (arr[i].forecast[0]<arr[i].forecast[1]) && (arr[i+1].barheight < 0) ){
        //walletSumm -= Math.abs(arr[i+1].barheight*0.5);
        if( extremMin > stopLoss ){ walletSumm -= stopLoss;} 
        else { walletSumm -=Math.abs(arr[i+1].barheight); }
      };


      if ( (arr[i].forecast[0]>arr[i].forecast[1]) && (arr[i+1].barheight <0) ){
        if ( extremMax > stopLoss){ walletSumm -= stopLoss }
        else{ walletSumm += Math.abs(arr[i+1].barheight);}
      };

      if ( (arr[i].forecast[0]>arr[i].forecast[1]) && (arr[i+1].barheight > 0) ){
        if ( extremMax > stopLoss){ walletSumm -= stopLoss }
        else{ walletSumm -= Math.abs(arr[i+1].barheight);}
      };

    };
  };

  console.log('SL walletSumm=', walletSumm);
};

function simulateTradingSimple(arr){
  let walletSumm = 0;


  for (let i=0; i<arr.length; i++){
    if ( (arr[i].forecast || arr[i].forecast == 0) && (arr[i+1]) ){


      if ( (arr[i].forecast[0]<arr[i].forecast[1]) && (arr[i+1].barheight > 0) ){
        walletSumm+=Math.abs(arr[i+1].barheight);

      };

      if ( (arr[i].forecast[0]<arr[i].forecast[1]) && (arr[i+1].barheight < 0) ){
        walletSumm-=Math.abs(arr[i+1].barheight);
      };


      if ( (arr[i].forecast[0]>arr[i].forecast[1]) && (arr[i+1].barheight <0) ){
        walletSumm+=Math.abs(arr[i+1].barheight);
      };

      if ( (arr[i].forecast[0]>arr[i].forecast[1]) && (arr[i+1].barheight > 0) ){
        walletSumm-=Math.abs(arr[i+1].barheight);
      };

    };
  };

  console.log('simple walletSumm=', walletSumm);
};

///getstat






