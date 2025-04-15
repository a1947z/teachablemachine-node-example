const canvas = require('canvas');
const express = require('express');

require('@tensorflow/tfjs-node'); // 注册 Node.js bindings
const tf = require('@tensorflow/tfjs'); // 引入 tfjs 核心

const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');


const app = express();

let model;
let labels = [];

function init() {
  configureBodyParser();
  configureBrowserPolyFills();
  configureEndPoints();

  app.listen(3000, () => {
    console.log('✅ Server running on port 3000');
  });
}

function configureBodyParser() {
  app.use(bodyParser.raw({ type: 'image/jpeg', limit: '3MB' }));
}

function configureBrowserPolyFills() {
  global.window = new JSDOM().window;
  global.document = window.document;
  global.fetch = require('node-fetch');
  global.HTMLVideoElement = class HTMLVideoElement {};
}

async function configureEndPoints() {
  // 读取本地模型和标签
  const modelPath = 'file://./model/model.json';
  const metadataPath = path.join(__dirname, 'model', 'metadata.json');

  model = await tf.loadGraphModel(modelPath);
  console.log('✅ 模型加载成功');

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  labels = metadata.labels || [];
  console.log('✅ 标签加载成功:', labels);

  app.post('/test', async (req, res) => {
    const base64Image = Buffer.from(req.body).toString('base64');
    const contentType = req.get('Content-Type');

    try {
      const prediction = await getPrediction(base64Image, contentType);
      res.send(prediction);
    } catch (err) {
      console.error('❌ 预测失败:', err);
      res.status(500).send({ error: 'Prediction failed' });
    }
  });
}

async function getPrediction(base64Image, contentType) {
  const img = new canvas.Image();
  img.src = `data:${contentType};base64,${base64Image}`;

  const CANVAS_SIZE = 224;
  const imageCanvas = canvas.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  const ctx = imageCanvas.getContext('2d');
  ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const input = tf.browser.fromPixels(imageCanvas)
    .toFloat()
    .expandDims();

  const predictionData = await model.predict(input).data();
  input.dispose();

  // 映射标签和置信度
  const result = Array.from(predictionData).map((probability, index) => ({
    className: labels[index] || `class_${index}`,
    probability: Number(probability.toFixed(4)),
  }));

  // 排序并返回
  return result.sort((a, b) => b.probability - a.probability);
}

init();
