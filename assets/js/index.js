const cam = document.getElementById("cam");

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
