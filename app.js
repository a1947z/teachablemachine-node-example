/**
 * A demonstration of using Teachable Machine, which is intended to run in the
 * browser, in Node. The main entry point of the application is the `init()`
 * method, which is called at the end of this script. Configure your endpoints
 * in the `configureEndPoints()` method.
 */
const canvas = require('canvas');
const express = require('express');
const JSDOM = require('jsdom').JSDOM;
require('@tensorflow/tfjs-node');
const tmImage = require('@teachablemachine/image');

const app = express();

/**
 * Performs application initialization tasks including configuration of browser
 * API polyfills and associating models generated in Teachable Machine with HTTP
 * accessible endpoints.
 */
function init() {
  configureBodyParser();
  configureEndPoints();
  configureBrowserPolyFills();

  // Configure the server to begin listening for requests.
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

/**
 * Creates an application endpoint (route) and a associates it with the model it
 * should handle.
 * @param {string} name The route name to be used for the endpoint.
 * @param {string} baseUrl The base URL from where the model files can be
 *    loaded. `baseUrl` should end with a trailing slash
 *    (e.g. 'https://teachablemachine.withgoogle.com/models/AI5i76oG/')
 *    Note that local filesystem paths are not supported.
 */
async function addEndpoint(name, baseUrl) {
  const modelURL = baseUrl + 'model.json';
  const metadataURL = baseUrl + 'metadata.json';
  const model = await tmImage.load(modelURL, metadataURL);
  app.post('/' + name, (request, response) => {
    const base64Image = Buffer.from(request.body).toString('base64');
    const contentType = request.get('Content-Type');
    getPrediction(model, base64Image, contentType, (output) => {
      response.send(output);
    });
  });
}

/**
 * Configure body-parser's raw parser (@see https://bit.ly/2y70YFE) to handle
 * requests where the `Content-Type` header matches the type specified (in this
 * case, 'image/jpeg'). A new, parsed body object will be available on request
 * object (i.e. req.body). The body will be a Buffer object.
 */
function configureBodyParser() {
  app.use(require('body-parser').raw({type: 'image/jpeg', limit: '3MB'}));
}

/**
 * Simulates in Node just enough of the browser parts required for Teachable
 * Machine to work.
 */
function configureBrowserPolyFills() {
  global.window = new JSDOM(`
  <body>
    <script>
    document.body.appendChild(document.createElement("hr"));
    </script>
  </body>`).window;
  global.document = window.document;
  global.fetch = require('node-fetch');
  global.HTMLVideoElement = class HTMLVideoElement { };
}

/**
 * Create HTTP accessible named endpoints, each associated with a Teachable
 * Machine generated model. Add as many as you'd like.
 */
function configureEndPoints() {
  addEndpoint('test',
      'https://teachablemachine.withgoogle.com/models/AI5i76oG/');
}

/**
 * Forms a prediction for the supplied image data against a supplied model. Once
 * a prediction is formed, a supplied callback function is called, with the
 * prediction as its argument. A supplied function receives the prediction and
 * completes the request cycle by sending the prediction as the response.
 * @param {!CustomMobileNet} model An instance of the model. (for type info,
 *     @see https://bit.ly/2yOoM12)
 * @param {string} imageData A Base64 encoded representation of the image to be
 *    evaluated against the model.
 * @param {string} contentType The content type of the supplied imageData.
 * @param {!Function} responseFunction A function that receives the prediction
 *    and completes the request cycle by sending the prediction as a JSON
 *    formatted response.
 */
async function getPrediction(model, imageData, contentType, responseFunction) {
  const imageCanvas = canvas.createCanvas(64, 64);
  const canvasContext = imageCanvas.getContext('2d');

  const canvasImage = new canvas.Image();
  canvasImage.onload = async () => {
    canvasContext.drawImage(canvasImage, 0, 0, 64, 64);

    const prediction = await model.predict(imageCanvas);
    console.log(prediction);
    responseFunction(prediction);
  };

  canvasImage.onerror = (error) => {
    throw error;
  };

  canvasImage.src = `data:${contentType};base64,` + imageData;
}

// Main application entry point.
init();
