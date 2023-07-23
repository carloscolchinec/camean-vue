Vue.config.productionTip = false;

new Vue({
  el: "#app",
  data() {
    return {
      scannerActive: false,
      detectedBarcode: null,
      lastDetectedBarcode: null,
    };
  },
  mounted() {
    this.initScanner();
  },
  methods: {
    initScanner() {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector(".camera-view"),
            constraints: {
              facingMode: "environment", // Use the rear camera (or change to "user" for the front camera)
            },
            area: { // Limit the scanning area to a portion of the camera view
              top: "30%", // Adjust this value based on your needs
              right: "0%",
              left: "0%",
              bottom: "30%",
            },
          },
          decoder: {
            readers: ["ean_reader"], // You can add more reader formats if needed
            multiple: false, // Only detect one barcode at a time for better performance
          },
          locate: true, // Enable localization of the barcode in the image
        },
        (err) => {
          if (err) {
            console.error("Error al inicializar Quagga:", err);
            return;
          }
          console.log("Quagga inicializado correctamente.");
          Quagga.onProcessed(this.drawDetectedRectangle);
          this.startScanner();
        }
      );

      Quagga.onDetected(this.onBarcodeDetected);
    },
    startScanner() {
      this.scannerActive = true;
      Quagga.start();
    },
    onBarcodeDetected(result) {
      if (result && result.codeResult.code) {
        const detectedCode = result.codeResult.code;
        if (detectedCode !== this.lastDetectedBarcode) {
          this.detectedBarcode = detectedCode;
          this.lastDetectedBarcode = detectedCode;
          console.log("Código de barras detectado:", detectedCode);
        }
      }
    },
    drawDetectedRectangle(result) {
      if (!this.scannerActive) return;
      if (result) {
        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;
        drawingCtx.clearRect(
          0,
          0,
          parseInt(drawingCanvas.getAttribute("width")),
          parseInt(drawingCanvas.getAttribute("height"))
        );

        if (result.boxes) {
          result.boxes.forEach((box) => {
            drawingCtx.strokeStyle = "#f00";
            drawingCtx.lineWidth = 2;
            drawingCtx.strokeRect(
              box.x,
              box.y,
              box.width,
              box.height
            );
          });
        }
      }
    },
  },
});
