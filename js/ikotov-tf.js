
let countUp=0;
let countDown=0;
let countSide=0;

function getCount(arrDataToTrain){
	for (let i=0; i< arrDataToTrain.length; i++){
	  if (arrDataToTrain[i].result === 'down'){countDown +=1};
	  if (arrDataToTrain[i].result === 'up'){countUp +=1};
	};

	console.log('cuntUp=', countUp);
	console.log('countDown=', countDown);
};
getCount(arrSorted);
console.log('getCount');

//берем одинаковое число баров вверх и вниз и записываем в ноый массив filtered
let filteredData = [];
let diffUpDown = countUp - countDown;
function filterData(arrDataToTrain){
	if (diffUpDown<=0){
		let c=0;
		for(let i=0; i<arrDataToTrain.length; i++){
			if(arrDataToTrain[i].result === 'up'){filteredData.push(arrDataToTrain[i]);};
			if(arrDataToTrain[i].result === 'down' && countUp>c){
				filteredData.push(arrDataToTrain[i]);
				c+=1;
			};
			//if(arrDataToTrain[i].result === 'side'){filteredData.push(arrDataToTrain[i]);};
		};
	};

	if (diffUpDown>0){
		let c=0;
		for(let i=0; i<arrDataToTrain.length; i++){
			if(arrDataToTrain[i].result === 'down'){filteredData.push(arrDataToTrain[i]);};
			if(arrDataToTrain[i].result === 'up' && countDown>c){
				filteredData.push(arrDataToTrain[i]);
				c+=1;
			};
			//if(arrDataToTrain[i].result === 'side'){filteredData.push(arrDataToTrain[i]);};
		};		
	};
}; filterData(arrSorted);

console.log('filteredData', filteredData);


let arrPredicts=[];
async function run() {
  // Load and plot the original input data_tf that we are going to train on.
  const data_tf = filteredData;

  // More code will be added below
  // Create the model
  const model = createModel();  
  tfvis.show.modelSummary({name: 'Model Summary'}, model);

  // Convert the data_tf to a form we can use for training.
  const tensorData_tf = convertToTensor(data_tf);
  const {inputs, labels} = tensorData_tf;
  

  // Train the model  
  await trainModel(model, inputs, labels);

  console.log('TRAINING DONE');


  const saveResult = await model.save('downloads://my-model');
  console.log('model saved in downloads://my-model');

  // Make some predictions using the model and compare them to the
  // original data_tf
  //testModel(model, data_tf, tensorData_tf);
  testModel(model, arrCleanTest);
};


document.addEventListener('DOMContentLoaded', run);

let neuronsNum = numBarsPrev * numValues; //количество баров умножаем на количество значений в каждом баре

//model architect
function createModel() {
  // Create a sequential model
  const model = tf.sequential(); 
  // Add a single input layer

  //model.add(tf.layers.dropout({inputShape: [neuronsNum], units: neuronsNum, rate:0.5}));
  //model.add(tf.layers.dense({ units: neuronsNum, useBias: true, activation: 'relu'}));

   model.add(tf.layers.dense({inputShape: [neuronsNum], units: neuronsNum, useBias: true, activation: 'relu'}));
   //model.add(tf.layers.dropout({rate:0.5}));

  model.add(tf.layers.reshape({inputShape:[neuronsNum], targetShape:[100,2]}));
  model.add(tf.layers.lstm({inputShape: [100, 2], units: neuronsNum, useBias: true, activation: 'relu', returnSequences: false}));
  //model.add(tf.layers.dense({units: 100, activation: 'relu', useBias: true}));


  // Add an output layer
  model.add(tf.layers.dense({units: 2, activation: 'softmax', returnSequences: false}));
  return model;
}

/**
 * Convert the input data_tf to tensors that we can use for machine 
 * learning. We will also do the important best practices of _shuffling_
 * the data_tf and _normalizing_ the data_tf
 * MPG on the y-axis.
 */
function convertToTensor(data_tf) {
  // Wrapping these calculations in a tidy will dispose any 
  // intermediate tensors.
  
  return tf.tidy(() => {
    // Step 1. Shuffle the data_tf    
    tf.util.shuffle(data_tf);

    // Step 2. Convert data_tf to Tensor
    
    const inputs = data_tf.map(d => d.bars);
    const labels = data_tf.map(d => d.result);

    let inputTensor1 = tf.tensor(inputs, [inputs.length, numBarsPrev, numValues]);
    const inputTensor = inputTensor1.reshape([inputs.length, neuronsNum]);

    //const labelTensor = tf.tensor(labels, [labels.length, 1]);

    //Step 3. Normalize the data_tf to the range 0 - 1 using min-max scaling
    /**/
    const labelTensor = tf.tensor2d(data_tf.map(item => [
      item.result === 'down' ? 1 : 0,
      item.result === 'up' ? 1 : 0
      //100 - down, 010 - up, 001 - side
    ]), [labels.length,2]);
    
    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();  
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
    
    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      // Return the min/max bounds so we can use them later.
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    }
  });  
}

//train model
async function trainModel(model, inputs, labels) {
  console.log('training...');

  // Prepare the model for training.  
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError, //tf.losses.softmaxCrossEntropy,
    metrics: ['accuracy'],
  });
  
  const batchSize = 2000000;
  const epochs = 175;
  
  return await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss'], 
      { height: 500, callbacks: ['onEpochEnd'] }
    )
  });
};


/**/
function testModel(model, arrToPredict){

//меняем форму 
  const inputs = arrToPredict.map(d => d.bars);
  let tensorToPredict1 = tf.tensor(inputs, [ inputs.length, numBarsPrev, numValues]);
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

//преобразовываем из тензора в массив
  const predicts = Array.from(ys).map((val, i) => {
    return {x:val, y: ys[i]}
  });

  const results = arrToPredict.map(d=> ({
    x: d.result === 'down' ? 1 : 0,
    y: d.result === 'up' ? 1 : 0
  }));

//группируем по 2
  for (let i=0; i< predicts[0].x.length; i+=2){
    arrPredicts.push(predicts[0].x.slice(i, i + 2));
  };
  //console.log('predicts', arrPredicts);

//выводим в отдельной вкладке на визоре
  const data = [
    {index: 0, value: 50 },
    {index: 1, value: 150 }
  ];

  const surface = {name: 'Bar chart', tab: 'Carts'};
  //tfvis.render.barchart( surface, data);

  compare (arrPredicts, arrCleanTest);
  return arrPredicts;
};

//сравниваем предсказания с реальноситью

//onsole.log('predicts', arrPredicts);

function compare(pred, real){

  let countCons = 0;
  for (let i=0; i<pred.length; i++){
    if ( (pred[i][0] - pred[i][1] > 0) && real[i].result === 'down'){
      countCons++;
    }
    if ( (pred[i][1] - pred[i][0] > 0) && real[i].result === 'up'){
      countCons++;
    }
  }

  let hitPercent = Math.round((countCons/pred.length)*100);

  console.log('countCons – ', countCons);
  console.log('predictions - %', hitPercent);
  
  console.log('preds array:');
  console.log('down, up');

  for (let i=0; i<real.length; i++){
    console.log(i, 'real –', real[i].result);
    console.log(i, 'pred –', pred[i][0], pred[i][1]);
 
  };

  console.log('TEST DONE!')
};




