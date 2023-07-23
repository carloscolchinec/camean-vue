Vue.config.productionTip = false;

new Vue({
  el: "#app",
  mounted() {
    this.initScanner();
  },
  methods: {
    async initScanner() {
      const cameraView = document.querySelector(".camera-view");
      const cameraVideo = document.createElement("video");
      const cameraOverlay = document.querySelector(".camera-overlay");
      const barcodeNumber = document.createElement("div");

      const canvasContext = cameraOverlay.getContext("2d");
      let scannerActive = true;

      cameraView.appendChild(cameraVideo);
      cameraView.appendChild(barcodeNumber);
      barcodeNumber.classList.add("barcode-number");

      async function setupCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });

          cameraVideo.srcObject = stream;
          await cameraVideo.play();
          scanBarcode();
        } catch (err) {
          console.error("Error al acceder a la cámara:", err);
          scannerActive = false;
          alert("No se pudo acceder a la cámara o el acceso fue denegado por el usuario.");
        }
      }

      async function scanBarcode() {
        if (!scannerActive) return;

        try {
          const codeReader = new ZXing.BrowserBarcodeReader();
          const result = await codeReader.decodeFromVideoElement(
            cameraVideo,
            cameraVideo.width,
            cameraVideo.height
          );

          if (result && result.text) {
            drawDetectedBarcode(result.text);
          }

          // Continuar escaneando
          scanBarcode();
        } catch (err) {
          console.error("Error al escanear:", err);
        }
      }

      function drawDetectedBarcode(detectedCode) {
        canvasContext.clearRect(0, 0, cameraOverlay.width, cameraOverlay.height);

        if (!detectedCode) return;

        // Dibujar rectángulo
        canvasContext.strokeStyle = "#f00";
        canvasContext.lineWidth = 2;
        canvasContext.strokeRect(
          cameraOverlay.width / 4,
          cameraOverlay.height / 4,
          cameraOverlay.width / 2,
          cameraOverlay.height / 2
        );

        // Dibujar número de código de barras arriba del rectángulo
        barcodeNumber.textContent = "[" + detectedCode + "]";
      }

      // Verificar si getUserMedia está disponible en el navegador
      if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
        // Configurar la cámara y escanear automáticamente
        setupCamera();
      } else {
        console.error("getUserMedia no es compatible en este navegador.");
        alert("getUserMedia no es compatible en este navegador.");
      }
    },
  },
});
