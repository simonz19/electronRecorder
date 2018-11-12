const { desktopCapturer, ipcRenderer, remote } = require("electron");
const domify = require("domify");

let localStream;
let microAudioStream;
let recordedChunks = [];
let numRecordedChunks = 0;
let recorder;
let includeMic = false;
// let includeSysAudio = false

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#record-desktop")
    .addEventListener("click", recordDesktop);
  document
    .querySelector("#record-camera")
    .addEventListener("click", recordCamera);
  document
    .querySelector("#record-window")
    .addEventListener("click", recordWindow);
  document.querySelector("#play-video").addEventListener("click", playVideo);
  document
    .querySelector("#micro-audio")
    .addEventListener("click", microAudioCheck);
  // document.querySelector('#system-audio').addEventListener('click', sysAudioCheck)
  document
    .querySelector("#record-stop")
    .addEventListener("click", stopRecording);
  document.querySelector("#play-button").addEventListener("click", play);
  document
    .querySelector("#download-button")
    .addEventListener("click", download);
  document
    .querySelector("#record-voice")
    .addEventListener("click", recordVoice);
});

const playVideo = () => {
  remote.dialog.showOpenDialog({ properties: ["openFile"] }, filename => {
    console.log(filename);
    let video = document.querySelector("video");
    video.muted = false;
    video.src = filename;
  });
};

const disableButtons = () => {
  document.querySelector("#record-desktop").disabled = true;
  document.querySelector("#record-camera").disabled = true;
  document.querySelector("#record-window").disabled = true;
  document.querySelector("#record-stop").hidden = false;
  document.querySelector("#play-button").hidden = true;
  document.querySelector("#download-button").hidden = true;
};

const enableButtons = () => {
  document.querySelector("#record-desktop").disabled = false;
  document.querySelector("#record-camera").disabled = false;
  document.querySelector("#record-window").disabled = false;
  document.querySelector("#record-stop").hidden = true;
  document.querySelector("#play-button").hidden = true;
  document.querySelector("#download-button").hidden = true;
};

/** the audio checkbox */
const microAudioCheck = () => {
  var video = document.querySelector("video");
  video.muted = true;
  includeMic = !includeMic;
  // if (includeMic)
  //   document.querySelector("#micro-audio-btn").classList.add("active");
  // else document.querySelector("#micro-audio-btn").classList.remove("active");
  console.log("Audio =", includeMic);
};

const cleanRecord = () => {
  let video = document.querySelector("video");
  video.controls = false;
  recordedChunks = [];
  numRecordedChunks = 0;
};

/** process args will be passed by when main mainWindow is finish loaded */
ipcRenderer.on('get-process-args', (event, options) => {
  console.log('options', options);
})

ipcRenderer.on("source-id-selected", (event, sourceId) => {
  // Users have cancel the picker dialog.
  if (!sourceId) return;
  console.log(sourceId);
  onCaptureSelected(sourceId);
});

const recordDesktop = () => {
  cleanRecord();
  ipcRenderer.send("show-picker", { types: ["screen"] });
};

const recordWindow = () => {
  cleanRecord();
  ipcRenderer.send("show-picker", { types: ["window"] });
};

const recordVoice = () => {
  cleanRecord();
  getAudioStream()
    .then(prepareToStartRecording(false))
    .catch(getUserMediaError);
};

const recordCamera = () => {
  cleanRecord();
  getCameraStream(includeMic)
    .then(prepareToStartRecording(true))
    .catch(getUserMediaError);
};

/** triggered by users selection of capture area id */
const onCaptureSelected = id => {
  cleanRecord();
  if (includeMic) {
    Promise.all([getCaptureStream(id), getAudioStream()])
      .then(resp => {
        const captureStream = resp[0];
        const audioStream = resp[1];
        let audioTracks = audioStream.getAudioTracks();
        captureStream.addTrack(audioTracks[0]);
        prepareToStartRecording(true)(captureStream);
      })
      .catch(getUserMediaError);
  } else {
    getCaptureStream(id)
      .then(prepareToStartRecording(true))
      .catch(getUserMediaError);
  }
};

/** cach stream chunk datas for potential download */
const recorderOnDataAvailable = event => {
  if (event.data && event.data.size > 0) {
    recordedChunks.push(event.data);
    numRecordedChunks += event.data.byteLength;
  }
};

/** stop recorder and anything about track */
const stopRecording = () => {
  console.log("Stopping record");
  enableButtons();
  document.querySelector("#play-button").hidden = false;
  document.querySelector("#download-button").hidden = false;
  if (recorder) recorder.stop();
  if (localStream) {
    const videoTrack = localStream.getVideoTracks();
    const audioTrack = localStream.getAudioTracks();
    videoTrack.concat(audioTrack).forEach(track => {
      track.stop();
    });
  }
};

/** prepare something before actually recording */
const prepareToStartRecording = showVideo => {
  return stream => {
    if (showVideo) {
      let video = document.querySelector("video");
      video.src = URL.createObjectURL(stream);
    }
    startRecording(stream);
  };
};

/** actually recording */
const startRecording = stream => {
  try {
    console.log("Start recording the stream.");
    recorder = new MediaRecorder(stream);
  } catch (e) {
    console.assert(false, "Exception while creating MediaRecorder: " + e);
    return;
  }
  stream.onended = () => {
    console.log("Media stream ended.");
  };
  localStream = stream;
  recorder.ondataavailable = recorderOnDataAvailable;
  recorder.onstop = () => {
    console.log("recorderOnStop fired");
  };
  recorder.start();
  console.log("Recorder is started.");
  disableButtons();
};

const play = () => {
  // Unmute video.
  let video = document.querySelector("video");
  video.controls = true;
  video.muted = false;
  let blob = new Blob(recordedChunks, { type: "video/webm" });
  video.src = window.URL.createObjectURL(blob);
};

const download = () => {
  let blob = new Blob(recordedChunks, { type: "video/webm" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "electron-screen-recorder.webm";
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};

/** return promise ,noly audio stream */
const getAudioStream = () => {
  return new Promise((resolve, reject) => {
    navigator.webkitGetUserMedia(
      {
        audio: true,
        video: false
      },
      resolve,
      reject
    );
  });
};

/** return promise ,camera stream wdith audio or not*/
const getCameraStream = includeMic => {
  return new Promise((resolve, reject) => {
    navigator.webkitGetUserMedia(
      {
        audio: !!includeMic,
        video: { mandatory: { minWidth: 1280, minHeight: 720 } }
      },
      resolve,
      reject
    );
  });
};

/**
 * return promise, desktop capture stream
 * !! notice that, capture rtc should not configure "audio: true", this will make some mistake,
 *  you should make audio stream track involded in capture stream instead
 */
const getCaptureStream = id => {
  return new Promise((resolve, reject) => {
    if (!id) {
      console.log("Access rejected.");
      return;
    }
    console.log("Window ID: ", id);
    navigator.webkitGetUserMedia(
      {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: id,
            maxWidth: window.screen.width,
            maxHeight: window.screen.height
          }
        }
      },
      resolve,
      reject
    );
  });
};

const getUserMediaError = () => {
  console.log("getUserMedia() failed.");
};
