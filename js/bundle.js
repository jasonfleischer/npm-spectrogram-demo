(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){const audio_controller_state=Object.freeze({STOPPED:0,RESUMED:1,PAUSED:2});audio_controller={state:audio_controller_state.STOPPED,ctx:{},analyzerNode:{},audioElement:{},use_microphone:true};audio_controller.start=function(fftSize=storage.get_fft_size(),audioElement=undefined){if(audio_controller.state==audio_controller_state.STOPPED){audio_controller.ctx=new AudioContext;audio_controller.analyzerNode=audio_controller.ctx.createAnalyser();audio_controller.analyzerNode.smoothingTimeConstant=0;audio_controller.analyzerNode.fftSize=fftSize;audio_controller.use_microphone=audioElement==undefined;if(audio_controller.use_microphone){navigator.mediaDevices.getUserMedia({video:false,audio:true}).then(mediaStreamObj=>{onStreamAquired(mediaStreamObj)}).catch(err=>{log.e("getUserMedia: "+err)})}else{audio_controller.audioElement=audioElement;audio_controller.audioElement.oncanplay=function(){var mediaStreamObj=audio_controller.audioElement.captureStream();onStreamAquired(mediaStreamObj)}}}else{log.e("already started")}function onStreamAquired(mediaStreamObj){var sourceNode=audio_controller.ctx.createMediaStreamSource(mediaStreamObj);sourceNode.connect(audio_controller.analyzerNode);startVisualization();audio_controller.state=audio_controller_state.RESUMED;updateUI_buttons(audio_controller.state)}function startVisualization(){oscilloscope.draw(audio_controller.analyzerNode);frequency_view.draw(audio_controller.analyzerNode);spectrogram.draw(audio_controller.analyzerNode,audio_controller.ctx.sampleRate)}};audio_controller.resume=function(){if(audio_controller.state==audio_controller_state.PAUSED){oscilloscope.resume();frequency_view.resume();spectrogram.resume();audio_controller.state=audio_controller_state.RESUMED;updateUI_buttons(audio_controller.state)}else{log.e("not paused")}};audio_controller.pause=function(){if(audio_controller.state==audio_controller_state.RESUMED){oscilloscope.pause();frequency_view.pause();spectrogram.pause();if(!audio_controller.use_microphone){audio_controller.audioElement.pause()}audio_controller.state=audio_controller_state.PAUSED;updateUI_buttons(audio_controller.state)}else{log.e("not resumed")}};audio_controller.updateFFTSize=function(fftSize){var savedState=audio_controller.state;audio_controller.pause();audio_controller.analyzerNode.fftSize=fftSize;spectrogram.refreshCanvasHeight();if(savedState==audio_controller_state.RESUMED){audio_controller.resume()}};audio_controller.updateMaxFrequency=function(maximumFrequency){var savedState=audio_controller.state;audio_controller.pause();spectrogram.updateMaximumFrequency(maximumFrequency);spectrogram.refreshCanvasHeight();if(savedState==audio_controller_state.RESUMED){audio_controller.resume()}};const Spectrogram=require("@jasonfleischer/spectrogram");var spectrogram=new Spectrogram(id="your_spectrogram_id",useHeatMapColors=true,highlightPeaks=false,darkMode=true,minimumFrequency=0,maximumFrequency=22050);var audioContext={};document.getElementById("your_button_id").onclick=onStartClickEvent;function onStartClickEvent(){audioContext=new AudioContext;var analyzerNode=audioContext.createAnalyser();analyzerNode.smoothingTimeConstant=0;analyzerNode.fftSize=1024;var audioElement=document.createElement("AUDIO");audioElement.src="audio/your_audio_file.mp3";audioElement.autoplay=true;audioElement.oncanplay=function(){var mediaStreamObj=audioElement.captureStream();onStreamAquired(mediaStreamObj,analyzerNode)}}function onStreamAquired(mediaStreamObj,analyzerNode){var sourceNode=audioContext.createMediaStreamSource(mediaStreamObj);sourceNode.connect(analyzerNode);spectrogram.draw(analyzerNode,audioContext.sampleRate)}},{"@jasonfleischer/spectrogram":2}],2:[function(require,module,exports){const Spectrogram=require("./lib/spectrogram.js");module.exports=Spectrogram},{"./lib/spectrogram.js":3}],3:[function(require,module,exports){class Spectrogram{constructor(id="spectrogram",useHeatMapColors=true,highlightPeaks=false,darkMode=true,minimumFrequency=0,maximumFrequency=22050){this.id=id;this.darkMode=darkMode;this.buildView();this.DECIBEL_MAX=255;this.canvasCtx=this.canvas.getContext("2d");this.drawing=true;this.highlightThresholdPercent=75;this.highlightPeaks=highlightPeaks;this.useHeatMapColors=useHeatMapColors;this.colors=useHeatMapColors?this.generateHeatMapColors():this.generateDefaultColors();this.canvasHeightSetup=false;this.minimumFrequency=minimumFrequency;this.maximumFrequency=maximumFrequency}buildView(){var root_view=document.getElementById(this.id);this.canvas=document.createElement("canvas");this.canvas.style.position="absolute";this.canvas.style.background=this.darkMode?"#000":"#FFF";this.canvas.width=root_view.clientWidth;this.canvas.style.width=root_view.clientWidth+"px";this.canvas.style.height=root_view.clientHeight+"px";root_view.appendChild(this.canvas)}draw(analyserNode,sampleRate){window.requestAnimationFrame(this.draw.bind(this,analyserNode,sampleRate));const bufferLength=analyserNode.frequencyBinCount;const dataArray=new Uint8Array(bufferLength);analyserNode.getByteFrequencyData(dataArray);if(!this.canvasHeightSetup){this.canvas.height=this.getCanvasHeight(sampleRate,dataArray.length);this.canvasHeightSetup=true}this.drawWithArray(dataArray,sampleRate,this.colors)}drawWithArray(array,sampleRate,colors){if(this.drawing){var canvas=this.canvas;var canvasContext=this.canvas.getContext("2d");var width=canvas.width;var height=this.getCanvasHeight(sampleRate,array.length);var tempCanvas=canvas;var tempCanvasContext=canvasContext;tempCanvasContext.drawImage(canvas,0,0,width,height);var minIndex=Math.max(Math.floor(this.minimumFrequency/(sampleRate/2)*array.length),0);var maxIndex=Math.min(Math.ceil(this.maximumFrequency/(sampleRate/2)*array.length),22050);for(var i=minIndex;i<=maxIndex;i++){var decibelValue=array[i];var decibelPercentValue=decibelValue/this.DECIBEL_MAX*100;var frequency=i/(array.length-1)*(sampleRate/2);canvasContext.fillStyle=getColor(decibelPercentValue,colors);canvasContext.fillRect(width-1,height-i+minIndex,1,1);if(this.highlightPeaks){if(decibelPercentValue>this.highlightThresholdPercent){if(isPeak(i,array)){var alpha=(decibelPercentValue-this.highlightThresholdPercent)/(100-this.highlightThresholdPercent);canvasContext.fillStyle="rgba("+[255,0,0,alpha].toString()+")";canvasContext.fillRect(width-1,height-i,1,1)}}}}canvasContext.translate(-1,0);canvasContext.drawImage(tempCanvas,0,0,width,height+minIndex,0,0,width,height+minIndex);canvasContext.setTransform(1,0,0,1,0,0)}function isPeak(i,array){if(i==0||i==array.length-1)return false;var previousDecibelValue=array[i-1];var decibelValue=array[i];var nextDecibelValue=array[i+1];return decibelValue>previousDecibelValue&&decibelValue>nextDecibelValue}function getColor(decibelPercentValue,colors){var index=parseInt(decibelPercentValue/100*(colors.length-1));return colors[index]}}getCanvasHeight(sampleRate,arrayLength){var maxIndex=Math.min(Math.ceil(this.maximumFrequency/(sampleRate/2)*arrayLength),22050);var minIndex=Math.max(Math.floor(this.minimumFrequency/(sampleRate/2)*arrayLength),0);return maxIndex-minIndex}generateDefaultColors(){var numberOfColors=50;var frequency=Math.PI/numberOfColors;var amplitude=127;var center=128;var slice=Math.PI/2*3.1;var colors=[];for(var i=0;i<numberOfColors;i++){var v=Math.sin(frequency*i+slice)*amplitude+center>>0;v=this.darkMode?v:255-v;colors.push("rgba("+[v,v,v,1].toString()+")")}return colors}generateHeatMapColors(){function getColors(fromColor=[0,0,0],toColor=[255,255,255],numberOfColors=100){function getColorValue(startValue,endValue,percent){if(startValue===endValue){return startValue}else if(startValue>endValue){return startValue-percent*(startValue-endValue)}else{return startValue+percent*(endValue-startValue)}}var colors=[];var startRedValue=fromColor[0];var startGreenValue=fromColor[1];var startBlueValue=fromColor[2];var endRedValue=toColor[0];var endGreenValue=toColor[1];var endBlueValue=toColor[2];for(var i=0;i<numberOfColors;i++){var percent=i/(numberOfColors-1);var redValue=getColorValue(startRedValue,endRedValue,percent);var greenValue=getColorValue(startGreenValue,endGreenValue,percent);var blueValue=getColorValue(startBlueValue,endBlueValue,percent);colors.push("rgba("+[redValue,greenValue,blueValue,1].toString()+")")}return colors}const black=[0,0,0];const white=[255,255,255];const background=this.darkMode?black:white;const purple=this.darkMode?[64,0,64]:[125,0,125];const blue=[0,0,255];const green=[0,170,0];const orange=[255,170,0];const red=[255,0,0];return[].concat(getColors(background,purple,15),getColors(purple,blue,35),getColors(blue,green,10),getColors(green,orange,20),getColors(orange,red,20))}resize(newWidth){var root_view=document.getElementById(this.id);root_view.style.width=newWidth+"px";this.canvasHeightSetup=false;this.buildView()}updateColors(useHeatMapColors){this.colors=useHeatMapColors?this.generateHeatMapColors():this.generateDefaultColors()}updateHighlightPeaks(highlightPeaks){this.highlightPeaks=highlightPeaks}updateMaximumFrequency(maximumFrequency){this.maximumFrequency=maximumFrequency}refreshCanvasHeight(){this.canvasHeightSetup=false}pause(){this.drawing=false}resume(){this.drawing=true}}module.exports=Spectrogram},{}]},{},[1]);