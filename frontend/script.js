"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL = "http://127.0.0.1:5000";

const PREDICTION_INTERVAL = 250; // milliseconds


/* =========================================================
   DOM ELEMENTS
========================================================= */

const camera =
    document.getElementById("camera");

const canvas =
    document.getElementById("captureCanvas");

const startButton =
    document.getElementById("startButton");

const stopButton =
    document.getElementById("stopButton");

const resetButton =
    document.getElementById("resetButton");

const cameraMessage =
    document.getElementById("cameraMessage");

const connectionDot =
    document.getElementById("connectionDot");

const connectionText =
    document.getElementById("connectionText");

const statusBadge =
    document.getElementById("statusBadge");

const prediction =
    document.getElementById("prediction");

const rawPrediction =
    document.getElementById("rawPrediction");

const predictionIcon =
    document.getElementById("predictionIcon");

const confidence =
    document.getElementById("confidence");

const confidenceBar =
    document.getElementById("confidenceBar");

const drowsyTime =
    document.getElementById("drowsyTime");

const drowsyFrames =
    document.getElementById("drowsyFrames");

const totalFrames =
    document.getElementById("totalFrames");

const drowsyEvents =
    document.getElementById("drowsyEvents");

const faceDetected =
    document.getElementById("faceDetected");

const alarmOverlay =
    document.getElementById("alarmOverlay");

const dismissAlarm =
    document.getElementById("dismissAlarm");


/* Probability elements */

const probabilityElements = {

    Closed: {
        value: document.getElementById(
            "closedProbability"
        ),

        bar: document.getElementById(
            "closedBar"
        )
    },

    Open: {
        value: document.getElementById(
            "openProbability"
        ),

        bar: document.getElementById(
            "openBar"
        )
    },

    no_yawn: {
        value: document.getElementById(
            "noYawnProbability"
        ),

        bar: document.getElementById(
            "noYawnBar"
        )
    },

    yawn: {
        value: document.getElementById(
            "yawnProbability"
        ),

        bar: document.getElementById(
            "yawnBar"
        )
    }
};


/* =========================================================
   STATE
========================================================= */

let stream = null;

let monitoring = false;

let predictionTimer = null;

let processingFrame = false;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkBackend();

        resetUI();

    }
);


/* =========================================================
   BACKEND HEALTH CHECK
========================================================= */

async function checkBackend() {

    try {

        const response =
            await fetch(
                `${API_URL}/`,
                {
                    method: "GET"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Backend returned an error."
            );
        }

        const data =
            await response.json();

        setBackendStatus(
            true,
            data
        );

    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );

        setBackendStatus(
            false
        );

    }

}


/* =========================================================
   CONNECTION STATUS
========================================================= */

function setBackendStatus(
    online,
    data = null
) {

    if (online) {

        connectionDot.classList.add(
            "online"
        );

        connectionText.textContent =
            "Backend Online";

        if (data && data.classes) {

            console.log(
                "Backend classes:",
                data.classes
            );

        }

    } else {

        connectionDot.classList.remove(
            "online"
        );

        connectionText.textContent =
            "Backend Offline";

    }

}


/* =========================================================
   START CAMERA
========================================================= */

async function startCamera() {

    if (monitoring) {
        return;
    }

    try {

        stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    },

                    facingMode: "user"
                },

                audio: false

            });

        camera.srcObject = stream;

        await camera.play();

        monitoring = true;

        cameraMessage.style.display =
            "none";

        startButton.disabled = true;

        stopButton.disabled = false;

        setStatus(
            "WAITING",
            "waiting"
        );

        startPredictionLoop();

        console.log(
            "Camera started."
        );

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        alert(
            "Unable to access the camera.\n\n" +
            "Please allow camera permission " +
            "and try again."
        );

    }

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera() {

    monitoring = false;

    stopPredictionLoop();

    if (stream) {

        stream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        stream = null;

    }

    camera.srcObject = null;

    cameraMessage.style.display =
        "flex";

    startButton.disabled = false;

    stopButton.disabled = true;

    setStatus(
        "WAITING",
        "waiting"
    );

    console.log(
        "Camera stopped."
    );

}


/* =========================================================
   PREDICTION LOOP
========================================================= */

function startPredictionLoop() {

    stopPredictionLoop();

    predictionTimer =
        setInterval(
            sendFrame,
            PREDICTION_INTERVAL
        );

}


function stopPredictionLoop() {

    if (predictionTimer !== null) {

        clearInterval(
            predictionTimer
        );

        predictionTimer = null;

    }

}


/* =========================================================
   CAPTURE FRAME
========================================================= */

async function sendFrame() {

    if (!monitoring) {
        return;
    }

    if (!camera.videoWidth ||
        !camera.videoHeight) {
        return;
    }

    // Prevent multiple requests from
    // running simultaneously.
    if (processingFrame) {
        return;
    }

    processingFrame = true;

    try {

        const context =
            canvas.getContext("2d");

        canvas.width =
            camera.videoWidth;

        canvas.height =
            camera.videoHeight;

        /*
         * The video is mirrored visually using CSS.
         * The actual captured image is not mirrored.
         * This is normally better for model inference.
         */

        context.drawImage(
            camera,
            0,
            0,
            canvas.width,
            canvas.height
        );


        const blob =
            await new Promise(
                resolve => {

                    canvas.toBlob(
                        resolve,
                        "image/jpeg",
                        0.75
                    );

                }
            );


        if (!blob) {
            return;
        }


        const formData =
            new FormData();

        formData.append(
            "frame",
            blob,
            "frame.jpg"
        );


        const response =
            await fetch(
                `${API_URL}/predict`,
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                `Prediction request failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.error ||
                "Prediction failed."
            );

        }


        setBackendStatus(true);

        updateUI(data);


    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );

        setBackendStatus(false);

    } finally {

        processingFrame = false;

    }

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI(data) {

    const currentPrediction =
        data.prediction || "Unknown";

    const currentStatus =
        data.status || "UNCERTAIN";


    /* Prediction */

    prediction.textContent =
        formatPrediction(
            currentPrediction
        );


    rawPrediction.textContent =
        `Raw: ${
            formatPrediction(
                data.raw_prediction || "Unknown"
            )
        }`;


    /* Confidence */

    const confidenceValue =
        Number(
            data.confidence || 0
        );

    confidence.textContent =
        `${confidenceValue.toFixed(1)}%`;

    confidenceBar.style.width =
        `${clamp(
            confidenceValue,
            0,
            100
        )}%`;


    /* Status */

    updateStatus(
        currentStatus
    );


    /* Prediction icon */

    updatePredictionIcon(
        currentStatus
    );


    /* Drowsiness */

    drowsyFrames.textContent =
        data.drowsy_frame_count || 0;

    drowsyTime.textContent =
        `${Number(
            data.drowsy_elapsed_seconds || 0
        ).toFixed(1)} s`;


    /* Statistics */

    totalFrames.textContent =
        data.total_frames || 0;

    drowsyEvents.textContent =
        data.drowsy_events || 0;


    faceDetected.textContent =
        data.face_detected
            ? "YES"
            : "NO";


    /* Probabilities */

    updateProbabilities(
        data.probabilities || {}
    );


    /* Alarm */

    if (data.alarm === true) {

        showAlarm();

    }

}


/* =========================================================
   STATUS
========================================================= */

function updateStatus(status) {

    const normalized =
        String(status)
            .toUpperCase()
            .replaceAll(
                " ",
                "-"
            );


    let className =
        "waiting";


    if (status === "ALERT") {

        className = "alert";

    }

    else if (status === "DROWSY") {

        className = "drowsy";

    }

    else if (
        status === "LOW CONFIDENCE"
    ) {

        className =
            "low-confidence";

    }

    else if (
        status === "UNCERTAIN"
    ) {

        className =
            "uncertain";

    }

    else if (
        status === "NO FACE"
    ) {

        className =
            "no-face";

    }


    setStatus(
        normalized,
        className
    );

}


function setStatus(
    text,
    className
) {

    statusBadge.textContent =
        text;

    statusBadge.className =
        `status ${className}`;

}


/* =========================================================
   PREDICTION ICON
========================================================= */

function updatePredictionIcon(
    status
) {

    predictionIcon.classList.remove(
        "alert-icon",
        "drowsy-icon",
        "unknown-icon"
    );


    if (status === "DROWSY") {

        predictionIcon.classList.add(
            "drowsy-icon"
        );

        predictionIcon.textContent =
            "!";

    }

    else if (status === "ALERT") {

        predictionIcon.classList.add(
            "alert-icon"
        );

        predictionIcon.textContent =
            "✓";

    }

    else {

        predictionIcon.classList.add(
            "unknown-icon"
        );

        predictionIcon.textContent =
            "?";

    }

}


/* =========================================================
   PROBABILITIES
========================================================= */

function updateProbabilities(
    probabilities
) {

    Object.keys(
        probabilityElements
    ).forEach(
        className => {

            const item =
                probabilityElements[
                    className
                ];

            const probability =
                Number(
                    probabilities[
                        className
                    ] || 0
                );

            const percentage =
                probability * 100;


            item.value.textContent =
                `${percentage.toFixed(1)}%`;


            item.bar.style.width =
                `${clamp(
                    percentage,
                    0,
                    100
                )}%`;

        }
    );

}


/* =========================================================
   ALARM
========================================================= */

function showAlarm() {

    alarmOverlay.classList.add(
        "show"
    );

    playAlarmSound();

}


function hideAlarm() {

    alarmOverlay.classList.remove(
        "show"
    );

}


/*
 * Browser audio normally requires a user interaction.
 * Because monitoring was started by clicking a button,
 * audio can generally be played after that interaction.
 */

function playAlarmSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        const audioContext =
            new AudioContext();


        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.type =
            "square";

        oscillator.frequency.value =
            880;


        gain.gain.setValueAtTime(
            0.001,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.25,
            audioContext.currentTime + 0.05
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.8
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.8
        );


        setTimeout(
            () => {
                audioContext.close();
            },
            1000
        );

    } catch (error) {

        console.warn(
            "Alarm audio unavailable:",
            error
        );

    }

}


/* =========================================================
   RESET
========================================================= */

async function resetDetection() {

    try {

        const response =
            await fetch(
                `${API_URL}/reset`,
                {
                    method: "POST"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Reset request failed."
            );

        }


        resetUI();

        console.log(
            "Detection reset."
        );


    } catch (error) {

        console.error(
            "Reset error:",
            error
        );

        alert(
            "Could not reset the backend."
        );

    }

}


/* =========================================================
   RESET UI
========================================================= */

function resetUI() {

    prediction.textContent =
        "Waiting";

    rawPrediction.textContent =
        "Raw: —";

    confidence.textContent =
        "0%";

    confidenceBar.style.width =
        "0%";

    drowsyTime.textContent =
        "0.0 s";

    drowsyFrames.textContent =
        "0";

    totalFrames.textContent =
        "0";

    drowsyEvents.textContent =
        "0";

    faceDetected.textContent =
        "—";


    updateProbabilities({});


    setStatus(
        "WAITING",
        "waiting"
    );


    updatePredictionIcon(
        "WAITING"
    );


    hideAlarm();

}


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function formatPrediction(
    value
) {

    if (!value) {
        return "Unknown";
    }

    switch (value) {

        case "Closed":
            return "Eyes Closed";

        case "Open":
            return "Eyes Open";

        case "no_yawn":
            return "No Yawn";

        case "yawn":
            return "Yawn";

        case "No face":
            return "No Face";

        default:
            return value;

    }

}


function clamp(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            Number(value) || 0,
            min
        ),
        max
    );

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

startButton.addEventListener(
    "click",
    startCamera
);


stopButton.addEventListener(
    "click",
    stopCamera
);


resetButton.addEventListener(
    "click",
    resetDetection
);


dismissAlarm.addEventListener(
    "click",
    hideAlarm
);


/* =========================================================
   PAGE EXIT
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        stopCamera();

    }
);