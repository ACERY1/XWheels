const desktopCapturer = require('electron').desktopCapturer;
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg'); //视频流格式转换 需要本地安装ffmpeg


/**
 * XMediaRecorder 构造函数
 * @param {object} constraint 视频流约束条件(max/min width,max/min height)
 * @param {string} screenId 窗口的名称，之后会录制该窗口
 * @constructor
 */
function XMediaRecorder(constraint, screenId) {
	
	if (!constraint.minWidth || !constraint.maxWidth || !constraint.maxHeight || !constraint.minHeight) {
		return console.error("XM ERR: some constraint params undefined")
	}
	
	if (!screenId) {
		return console.error("XM ERR: screenId undefined")
	}
	
	
	this.capture = electronDesktopCapture //election 录屏接口
	this.fs = fs
	this.ffmpeg = ffmpeg
	this.constraint = constraint  // 约束
	this.blob = []     // 存储mediaRecorder录入之后的blob对象
	this.recorder = null // mediaRecorder对象
	this.screenName = screenId // 欲录屏的id
	this.buffer = [] // 最终写入文件的buffer
	this.arrayBuffer = [] // toBuffer前的数据
	this.isDone = false // 判断是否完成录制
	
}


// stream->blob(MediaRecorder)->arrayBuffer

/**
 * 开始录制，只有录制完成后，其他功能才能使用
 */
XMediaRecorder.prototype.startRecord = function () {
	if (this.capture != undefined) {
		
		this.capture.getSources({types: ['window', 'screen']}, (error, sources) => {
			for (let item of sources) {
				if (item.name == this.screenName) {
					navigator.mediaDevices.getUserMedia(
						{
							audio: false,
							video: {
								mandatory: {
									chromeMediaSource: 'desktop',
									chromeMediaSourceId: item.id,
									minWidth: this.constraint.minWidth,
									maxWidth: this.constraint.maxWidth,
									minHeight: this.constraint.minHeight,
									maxHeight: this.constraint.maxHeight
								}
							}
						}
					).then((stream) => {
						this.recorder = new MediaRecorder(stream)
						console.log("XM: Starting recording media")
						
						/*bind stop event*/
						this.recorder.ondataavailable = (event) => {
							this.blob.push(event.data) // 获取录制得到的blobData
							this.isDone = true
						}
						
						/*start record*/
						this.recorder.start()
						
					}).catch((err) => {
						console.error("XM:", err)
					})
				}
			}
		})
		
		
	} else {
		console.error("XM ERR: init error! make sure you import electron at first")
	}
	
}


/**
 * 停止(结束)录制
 */
XMediaRecorder.prototype.stopRecord = function () {
	if(!this.isDone){
		return console.error("XM ERR: XMediaRecorder hasn't started record yet")
	}
	
	this.recorder.stop()
}

/**
 * 保存视频至本地
 * @param {string} storePath 保存路径如'../test/'
 * @param {string} fileName 保存文件名如'hello'
 * @param {string} format 保存格式如'MP4'
 */
XMediaRecorder.prototype.storeFile = function (storePath, fileName,format="mp4") {
	this.toArrayBuffer(new Blob(this.blob, {type: 'video/webm'}), (arrayBuffer) => {
		this.arrayBuffer = arrayBuffer
		this.buffer = this.toBuffer(arrayBuffer)
		
		let file = `${storePath}${fileName}.webm`
		this.fs.writeFile(file, this.buffer, (err) => {
			if (err) {
				console.error("XM ERR: Failed to save video ", err)
			} else {
				console.log('Saved video: ' + file);
				let prod = new this.ffmpeg({source:file})
				prod.save(`${storePath}${fileName}.${format}`)
			}
		})
		
	})
}

/**
 * 将array转为buffer
 * @param arrayBuffer
 * @returns {Buffer}
 */
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

/**
 * 将blob对象转为arrayBuffer
 * @param blob 传入的blob对象，可以来自于ondataavailable事件中的回调data
 * @param callBack  转换成功之后的回调函数
 */
XMediaRecorder.prototype.toArrayBuffer = function (blob, callBack) {
	let fileReader = new FileReader();
	
	// onload callback function
	fileReader.onload = function () {
		callBack(this.result);
	};
	
	// blob -> arrayBuffer
	fileReader.readAsArrayBuffer(blob);
}


/**
 *
 * @param {string} videoElementId 传入绑定的dom的id
 * @param {mediaStream} stream  传入mediaStream
 */
XMediaRecorder.prototype.showStream = function (videoElementId, stream) {
	document.getElementById(videoElementId).srcObject = stream
}

