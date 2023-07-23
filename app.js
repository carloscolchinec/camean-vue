Vue.config.productionTip = false;

new Vue({
  el: "#app",
  mounted() {
    this.initScanner();
  },
  methods: {
    initScanner() {
      const cameraView = document.querySelector(".camera-view");
      const cameraVideo = document.querySelector(".camera-video");
      const cameraOverlay = document.querySelector(".camera-overlay");
      const barcodeNumber = document.createElement("div");

      const canvasContext = cameraOverlay.getContext("2d");
      let scannerActive = true;

      cameraView.appendChild(barcodeNumber);
      barcodeNumber.classList.add("barcode-number");

      async function scanBarcode() {
        if (!scannerActive) return;

        try {
          const codeReader = new ZXing.BrowserBarcodeReader();
          const result = await codeReader.decodeFromStream(
            { video: { facingMode: "environment" } },
            cameraVideo
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

      // Iniciar el escaneo automáticamente
      scanBarcode();
    },
  },
});
