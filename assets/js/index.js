const cam = document.getElementById("cam");

const startVideo = () => {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    // detecta todo os dispositivos
    console.log("Devices:", devices);
    if (Array.isArray(devices)) {
      devices.forEach((device) => {
        if (device.kind === "videoinput") {
          // seleciona o de video (nesse caso, há apenas uma opção)
          console.log("Device selected:\n", device);
          navigator.getUserMedia(
            {
              video: {
                deviceId: device.deviceId,
              },
            },
            (stream) => {
              // inicia o stream
              return (cam.srcObject = stream);
            },
            (error) => console.log("Erro:\n", error)
          );
        }
      });
    }
  });
};

const loadLabels = () => {
  const labels = ["MarcoAntonio"];

  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];

      for (let i = 1; i <= 5; i++) {
        // percorre todas as imagens do acervo
        const img = await faceapi.fetchImage(
          `/assets/lib/face-api/labels/${label}/${i}.PNG`
        );

        const detections = await faceapi
          .detectSingleFace(img) // reconhece rosto da imagem
          .withFaceLandmarks() // reconhece as marcações aos rostos
          .withFaceDescriptor(); // adiciona descrições

        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
};

Promise.all([
  // importa as funções do FaceAPI
  faceapi.nets.tinyFaceDetector.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/assets/lib/face-api/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/assets/lib/face-api/models"),
]).then(startVideo);

cam.addEventListener("play", async () => {
  console.log("Câmera Ligada!");

  const canvas = faceapi.createCanvasFromMedia(cam); // cria o canvas

  const labels = loadLabels(); // carrega labels com nomes de pessoas do acervo

  const canvasSize = { width: cam.width, height: cam.height };
  faceapi.matchDimensions(canvas, canvasSize); // iguala os sizes das imagens do canvas e do faceapi

  document.body.appendChild(canvas); // adiciona o canvas no body

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(cam, new faceapi.TinyFaceDetectorOptions()) // detecta rostos nas imagens da câmera
      .withFaceLandmarks() // reconhece as marcações aos rostos
      .withFaceExpressions() // reconhece as marcações aos rostos
      .withAgeAndGender() // reconhece as marcações aos rostos
      .withFaceDescriptors(); // adiciona descrições

    const resizedDetections = faceapi.resizeResults(detections, canvasSize); // ajusta o size das detections

    const faceMatcher = new faceapi.FaceMatcher(labels, 0.6); // cria um match com taxa de acerto de 60%

    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections); // desenha um quadrado ao redor do rosto
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections); // desenha as marcações
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections); // escreve as expressões faciais

    resizedDetections.forEach((detection) => {
      const { age, gender, genderProbability } = detection;

      new faceapi.draw.DrawTextField(
        [
          `${parseInt(age, 10)} years old`,
          `${gender} (${parseInt(genderProbability * 100, 10)})`,
        ],
        detection.detection.box.topRight
      ).draw(canvas);
    });

    results.forEach((result, index) => {
      const box = resizedDetections[index].detection.box;
      const { label, distance } = result;
      new faceapi.draw.DrawTextField(
        [`${label} (${distance})`],
        box.bottomRight
      ).draw(canvas);
    });

    console.log(detections);
  }, 100);
});
