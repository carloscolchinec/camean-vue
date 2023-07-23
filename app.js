Vue.config.productionTip = false;

new Vue({
  el: "#app",
  data() {
    return {
      scannerActive: false,
      detectedBarcode: null,
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
          },
          decoder: {
            readers: ["ean_reader"], // You can add more reader formats if needed
          },
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
      console.log("Código de barras detectado:", result.codeResult.code);
      this.detectedBarcode = result.codeResult;
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
