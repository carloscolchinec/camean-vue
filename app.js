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

      async function scanBarcode() {
        if (!scannerActive) return;

        try {
          const codeReader = new ZXing.BrowserBarcodeReader();
          const constraints = { video: { facingMode: "environment" } };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          cameraVideo.srcObject = stream;
          await cameraVideo.play();

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
        // Iniciar el escaneo automáticamente
        scanBarcode();
      } else {
        console.error("getUserMedia no es compatible en este navegador.");
      }
    },
  },
});
