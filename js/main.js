/*const pianoKit = require("@jasonfleischer/spectrogram");

//const log = require("@jasonfleischer/log");



document.getElementById("start").onclick = function() { 
	
};
document.getElementById("resume").onclick = function() {
	
}
document.getElementById("pause").onclick = function() {
	
}*/
const Spectrogram = require("@jasonfleischer/spectrogram");

var spectrogram = new Spectrogram(id = "your_spectrogram_id", useHeatMapColors = true, highlightPeaks = false, darkMode = true, minimumFrequency = 0, maximumFrequency = 22050 );

var audioContext = {};

document.getElementById("your_button_id").onclick = onStartClickEvent;

function onStartClickEvent(){

	// STEP 2. build analyzerNode
	audioContext = new AudioContext();
	var analyzerNode = audioContext.createAnalyser();
	analyzerNode.smoothingTimeConstant = 0;
	analyzerNode.fftSize = 1024;

	// STEP 3. request microphone access
	/*navigator.mediaDevices.getUserMedia({ video: false, audio: true })
	  	.then( (mediaStreamObj) => {
	  		onStreamAquired(mediaStreamObj, analyzerNode);
		})
		.catch( (err) => {
		 	console.log("getUserMedia: " + err);
		});*/

	// ---- OR ----

	// STEP 3. setup audio element
	var audioElement = document.createElement("AUDIO");
	audioElement.src = "audio/your_audio_file.mp3";		
	audioElement.autoplay = true;	
	//audio_controller.audioElement.loop = true;
	audioElement.oncanplay = function () { 
		var mediaStreamObj = audioElement.captureStream();
		onStreamAquired(mediaStreamObj, analyzerNode);
	}
}

// STEP 4. connect spectrogram
function onStreamAquired(mediaStreamObj, analyzerNode) {
	var sourceNode = audioContext.createMediaStreamSource(mediaStreamObj);
	sourceNode.connect(analyzerNode);
	spectrogram.draw(analyzerNode, audioContext.sampleRate);
}


