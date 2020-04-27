# Teachable Machine Node Example
A demonstration of using [Teachable Machine](https://teachablemachine.withgoogle.com/), which is intended to run in the browser, in Node. Based on the clever approach by [tr7zw](https://github.com/tr7zw) in their [original demo](https://github.com/tr7zw/teachablemachine-node-example).

## How It Works
1. A workaround simulates in Node just enough of the browser parts required for Teachable Machine to work.
    * [jsdom](https://github.com/jsdom/jsdom) to emulate a subset of browser APIs.
    * [node-canvas](https://github.com/Automattic/node-canvas) to simulate the browser's canvas.
    * [node-fetch](https://github.com/node-fetch/node-fetch) to polyfill [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for Node.
2. The script makes Teachable Machine models available through API endpoints defined in the script using [Express](https://expressjs.com/).
3. An image posted to an endpoint is parsed and passed to the model. Predictions are made and the endpoint responds to the request with JSON formatted prediction results.

## Usage
1. Clone this repo, `cd` into it, and run `npm install`
2. Edit app.js and add create endpoints associated with a trained model.
3. Run app server either with `npm start` or `node app.js`
4. Post an image to the endpoint. **This has the potential to be a source of frustration** — if POSTing the image is not done correctly the application may crash of malfunction. See "Image POST Tips and Notes" and "Post Examples" below.

## Image POST Tips and Notes
* Ensure you are pointing to the right endpoint name on the right port. (e.g. localhost:3000 if posting from the same computer the app is running on, or myhostname:3000 if posting from another computer)
* Ensure you are supplying the correct path to the image being posted.

### POST Examples
**Linux/OSX**
`curl -X POST -H "Content-Type: image/jpeg" --data-binary '@./sample_images/person-using-iphone-1194760.jpg' http://localhost:3000/test`
<sup>view a [breakdown of this command](https://bit.ly/3aEZ4t5)</sup>

**Windows**
`PowerShell.exe Invoke-WebRequest -uri http://localhost:3000/test -Method Post -Infile "./sample_images/person-using-iphone-1194760.jpg" -ContentType 'image/jpeg'`

## Notes
* The sample model used makes a prediction on whether a supplied image contains a Solo Human, a Solo Phone, or a Human and Phone. **I am not the creator of this model**.  It is used here with permission from the author, [lachlanjc](https://github.com/lachlanjc), who uses it [in this post](https://ima.lachlanjc.me/2019-11-17_cc_week_12_project/).
    + Use [the model's URL](https://teachablemachine.withgoogle.com/models/AI5i76oG/) to explore interactively in the Teachable Machine UI or use it in the code for this demo by passing the URL to the `addEndpoint()` method.
* [node-canvas is a jsdom dependency](https://github.com/jsdom/jsdom#canvas-support) for canvas/img support
    + See system dependency info at https://bit.ly/3bI4V2a
* Notable changes from the original demo on which this is based:
    + Removes requirement in original demo to monkey patch (comment out) part of the Teachable Machine npm package.
    + Removes custom _arrayBufferToBase64 method in favor of built-in conversion.
    + Dynamically allows for different image Content-Types (i.e. image/jpeg, image/png).
    + Uses eslint with [Google style guide](https://google.github.io/styleguide/jsguide.html) configuration for linting.
        + Adds additional comments and JSDOCs.
