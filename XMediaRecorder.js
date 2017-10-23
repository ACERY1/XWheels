const desktopCapturer = require('electron').desktopCapturer;
const fs = require('fs');


function XMediaRecorder(constraint, screenId) {
	if(!constraint.minWidth||!constraint.maxWidth||!constraint.maxHeight||!constraint.minHeight){
		return console.error("XM ERR: some constraint params undefined")
	}
	
	if(!screenId){
		return console.error("XM ERR: screenId undefined")
	}
	
	
	this.capture = electronDesktopCapture //election 录屏接口
	this.constraint = constraint  // 约束
	this.blob = []     // 存储mediaRecorder录入之后的blob对象
	this.recorder = null // mediaRecorder对象
	this.screenName = screenId // 欲录屏的id
	this.buffer = [] // 最终写入文件的buffer
	this.arrayBuffer = [] // toBuffer前的数据
	
}


// stream->blob(MediaRecorder)->arrayBuffer

// 开始录制
XMediaRecorder.prototype.startRecord = function () {
	if (this.capture != undefined) {
		navigator.mediaDevices.getUserMedia(
			{
				audio: false,
				video: {
					mandatory: {
						chromeMediaSource: 'desktop',
						chromeMediaSourceId: this.screenName,
						minWidth: this.constraint.minWidth,
						maxWidth:  this.constraint.maxWidth,
						minHeight:  this.constraint.minHeight,
						maxHeight:  this.constraint.maxHeight
					}
				}
			}
		).then((stream)=>{
			this.recorder = new MediaRecorder(stream)
			
		})
	} else {
		console.error("XM ERR: init error!")
	}
}


// 结束录制
XMediaRecorder.prototype.stopRecord = function () {
}

// 存储视频
XMediaRecorder.prototype.storeFile = function () {
}


XMediaRecorder.prototype.toBuffer = function (arrayBuffer) {
	// arrayBuffer -> buffer
	let buffer = new Buffer(arrayBuffer.byteLength);
	let arr = new Uint8Array(arrayBuffer);
	for (let i = 0; i < arr.byteLength; i++) {
		buffer[i] = arr[i];
	}
	
	// this data can be wirte into file
	return buffer;
}

XMediaRecorder.prototype.toArrayBuffer = function (blob, callBack) {
	let fileReader = new FileReader();
	
	// onload callback function
	fileReader.onload = function () {
		callBack(this.result);
	};
	
	// blob -> arrayBuffer
	fileReader.readAsArrayBuffer(blob);
}

XMediaRecorder.prototype.storeToLocal = function (storePath) {
	
}



