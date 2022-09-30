const log = require("@jasonfleischer/log");
const Spectrogram = require("@jasonfleischer/spectrogram");

var spectrogram = {};
var audio_controller = {};
var audio_element_audio_controller = {};

var model = {
	is_colored: true,
	is_dark_mode: true,
	volume_percent: 100,
	max_frequency:22050,
	fft_size: 1024
}

init = function() {

	spectrogram = new Spectrogram("spectrogram", 
									useHeatMapColors = model.is_colored, 
									highlightPeaks = !model.is_colored, 
									darkMode = model.is_dark_mode,
									minimumFrequency = 0, 
									maximumFrequency = model.max_frequency);

	audio_controller = new AudioController(	
		onStateChange = onAudioStateChanged, 
		startVisualization = startVisualization, 
		fftSize = model.fft_size);

	var audio_element = document.createElement("AUDIO");
	audio_element.src = "audio/your_audio_file.mp3";		
	audio_element.autoplay = true;
	audio_element.loop = true;
	audio_element_audio_controller = new AudioController(	
		onStateChange = onAudioStateChanged, 
		startVisualization = startVisualization, 
		fftSize = model.fft_size,
		audioElement = audio_element);
	
	setup_controls();
	updateUI_buttons(audio_controller.state);
}

onAudioStateChanged = function(audio_state) {
	switch(audio_state){
		case audio_controller_state.STOPPED:
			break;
		case audio_controller_state.RESUMED:
			spectrogram.resume();
			break;
		case audio_controller_state.PAUSED:
			spectrogram.pause();
			break;
	}
	updateUI_buttons(audio_state);
}

updateUI_buttons = function(audio_state) {
	switch(audio_state){
		case audio_controller_state.STOPPED:
			$("start").disabled = false;
			$("audio_element_start").disabled = false;
			$("resume").disabled = true;
			$("pause").disabled = true;
			break;
		case audio_controller_state.RESUMED:
			$("start").disabled = true;
			$("audio_element_start").disabled = true;
			$("resume").disabled = true;
			$("pause").disabled = false;
			break;
		case audio_controller_state.PAUSED:
			$("start").disabled = true;
			$("audio_element_start").disabled = true;
			$("resume").disabled = false;
			$("pause").disabled = true;
			break;
	}
}

function startVisualization(audio_controller) {
	spectrogram.draw(audio_controller.analyzerNode, audio_controller.ctx.sampleRate);
}

function setup_controls(){

	setupOnClicks();
	function setupOnClicks(){
		$("start").onclick = function() { audio_controller.start(); };
		$("resume").onclick = function() { audio_controller.resume(); };
		$("pause").onclick = function() { audio_controller.pause(); };
		$("audio_element_start").onclick = function() { audio_element_audio_controller.start(); };
	}

	setupMaxFrequencySlider();
	function setupMaxFrequencySlider() {
		const base_id = "maxFrequency";
		var slider = $(base_id+"Range");
		slider.value = model.max_frequency;
		var sliderText = $(base_id);
		sliderText.innerHTML = "Max Freq: " + Number(slider.value).toFixed() + "Hz";
		slider.oninput = function() {
			var value = Number(this.value);
			model.max_frequency = value;
			sliderText.innerHTML = "Max Freq: " + value.toFixed() + "Hz";
			updateMaxFrequency(value);
		}

		function updateMaxFrequency(maximumFrequency) {
			var savedState = audio_controller.state;
			audio_controller.pause();
			spectrogram.updateMaximumFrequency(maximumFrequency);
			spectrogram.refreshCanvasHeight();	
			if(savedState == audio_controller_state.RESUMED){
				audio_controller.resume();
			}
		}
	}

	setupCheckboxControls();
	function setupCheckboxControls(){
		setupIsColoredSwitch();
		function setupIsColoredSwitch() { 
			$("colors_checkbox").addEventListener("change", function(e){
				var value = this.checked;
				log.i("on colors change: " + value);
				model.is_colored = value;
				spectrogram.updateColors(value);
				spectrogram.updateHighlightPeaks(!value);			
			});
			$("colors_checkbox").checked = model.is_colored;
		}
		setupDarkModeSwitch();
		function setupDarkModeSwitch() { 
			$("darkmode_checkbox").addEventListener("change", function(e){
				var value = this.checked;
				log.i("on darkmode change: " + value);
				model.is_dark_mode = value;
				spectrogram.darkMode = value;
				spectrogram.updateColors(model.is_colored);
			});
			$("darkmode_checkbox").checked = model.is_dark_mode;
		}
	}

	setupSelectControls();
	function setupSelectControls(){
		setupFFTSizeSelect();
		function setupFFTSizeSelect() {
			const id = "fft_size_select";
			var select = $(id);
		
			$(id).addEventListener("change", function(e){
				var value = parseInt(this.value);
				log.i("on "+id+": " + value);
				model.note_type = value;
				model.fft_size = value;
				updateFFTSize(value);
			});
			$(id).value = model.fft_size;
		}

		function updateFFTSize(fftSize) {

			var savedState = audio_controller.state;
			audio_controller.pause();
			audio_controller.fftSize = fftSize;
			audio_controller.analyzerNode.fftSize = fftSize;
			spectrogram.refreshCanvasHeight();

			if(savedState == audio_controller_state.RESUMED){
				audio_controller.resume();
			}
		}
	}
}

$ = function(id){ return document.getElementById(id); }

init();
///////
/*
// STEP 1. create spectrogram
const Spectrogram = require("@jasonfleischer/spectrogram");

var spectrogram = new Spectrogram(id = "spectrogram", useHeatMapColors = true, highlightPeaks = false, darkMode = true, minimumFrequency = 0, maximumFrequency = 22050 );

var audioContext = {};

document.getElementById("start").onclick = onStartClickEvent;

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
		});* /

	// ---- OR ----

	// STEP 3. setup audio element
	var audioElement = document.createElement("AUDIO");
	audioElement.src = "audio/your_audio_file.mp3";		
	audioElement.autoplay = true;
	audioElement.loop = true;
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

// Additional commands

/*spectrogram.resume();
spectrogram.pause();*/


