const cam = document.getElementById("cam");

const startVideo = () => {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    console.log("Devices:", devices);
    if (Array.isArray(devices)) {
      devices.forEach((device) => {
        if (device.kind === "videoinput") {
          console.log("Device selected:\n", device);
          navigator.getUserMedia(
            {
              video: {
                deviceId: device.deviceId,
              },
            },
            (stream) => (cam.srcObject = stream),
            (error) => console.log("Erro:\n", error)
          );
        }
      });
    }
  });
};

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/assets/lib/face-api/models"),
]).then(startVideo);
