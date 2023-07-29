// ______   ______  __       __    __ ________ ________         ______   ______  ________ ________ __       __  ______  _______  ________
// /      \ /      \|  \     |  \  |  |        |        \       /      \ /      \|        |        |  \  _  |  \/      \|       \|        \
// |  $$$$$$|  $$$$$$| $$     | $$\ | $| $$$$$$$$\$$$$$$$$      |  $$$$$$|  $$$$$$| $$$$$$$$\$$$$$$$| $$ / \ | $|  $$$$$$| $$$$$$$| $$$$$$$$
// | $$   \$| $$  | $| $$     | $$$\| $| $$__      | $$         | $$___\$| $$  | $| $$__      | $$  | $$/  $\| $| $$__| $| $$__| $| $$__
// | $$     | $$  | $| $$     | $$$$\ $| $$  \     | $$          \$$    \| $$  | $| $$  \     | $$  | $$  $$$\ $| $$    $| $$    $| $$  \
// | $$   __| $$  | $| $$     | $$\$$ $| $$$$$     | $$          _\$$$$$$| $$  | $| $$$$$     | $$  | $$ $$\$$\$| $$$$$$$| $$$$$$$| $$$$$
// | $$__/  | $$__/ $| $$_____| $$ \$$$| $$_____   | $$         |  \__| $| $$__/ $| $$        | $$  | $$$$  \$$$| $$  | $| $$  | $| $$_____
// \$$    $$\$$    $| $$     | $$  \$$| $$     \  | $$          \$$    $$\$$    $| $$        | $$  | $$$    \$$| $$  | $| $$  | $| $$     \
//  \$$$$$$  \$$$$$$ \$$$$$$$$\$$   \$$\$$$$$$$$   \$$           \$$$$$$  \$$$$$$ \$$         \$$   \$$      \$$\$$   \$$\$$   \$$\$$$$$$$$

//                                             Todos los derechos reservados © COLNET 2023

window.addEventListener("load", function () {
    let selectedDeviceId;
    const codeReader = new ZXing.BrowserMultiFormatReader();
    const canvas = document.getElementById("scanner-overlay");
    const ctx = canvas.getContext("2d");
    const video = document.getElementById("video");
    const barcodeBox = document.querySelector(".barcode-box");
    const badgeContainer = document.getElementById("badgeContainer");
    const scanSound = document.getElementById("scanSound");

    function adjustBarcodeBox(x, y, width, height) {
        barcodeBox.style.top = `${y}px`;
        barcodeBox.style.left = `${x}px`;
        barcodeBox.style.width = `${width}px`;
        barcodeBox.style.height = `${height}px`;
        barcodeBox.style.display = "block";
    }

    function resetCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        barcodeBox.style.display = "none";
    }

    function adjustLinePosition() {
        const videoHeight = video.clientHeight;
        const animatedLine = document.querySelector(".animated-line");
        animatedLine.style.top = `${videoHeight / 2}px`;
        sourceSelectPanel.style.marginTop = `${videoHeight + 20}px`;
    }

    function preloadScanSound() {
        const scanSound = new Howl({
            src: ["./barcode.mp3"],
            volume: 0.5,
            autoplay: true,
            onload: function () {
                // Esta función se ejecuta cuando el sonido ha sido cargado
                console.log("Sonido cargado.");
            },
            onloaderror: function (id, error) {
                // Esta función se ejecuta si ocurre un error al cargar el sonido
                console.error("Error al cargar el sonido:", error);
            },
        });
    }

    codeReader
    .listVideoInputDevices()
    .then((videoInputDevices) => {
      const sourceSelect = document.getElementById("sourceSelect");
      selectedDeviceId = videoInputDevices[0].deviceId;
      if (videoInputDevices.length >= 1) {
        // Show all cameras in the sourceSelect dropdown
        videoInputDevices.forEach((element) => {
          const sourceOption = document.createElement("option");
          sourceOption.text = element.label;
          sourceOption.value = element.deviceId;
          sourceSelect.appendChild(sourceOption);
        });

        // If it's a mobile device, try to select the rear camera
        function isMobileDevice() {
          return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
        }

        if (isMobileDevice()) {
          const rearCameraDevices = videoInputDevices.filter(
            (device) =>
              device.label.includes("back") || device.label.includes("trasera")
          );
          selectedDeviceId =
            rearCameraDevices.length > 0
              ? rearCameraDevices[0].deviceId
              : videoInputDevices[0].deviceId;
        }

        sourceSelect.value = selectedDeviceId;

        sourceSelect.onchange = () => {
          codeReader.reset();
          selectedDeviceId = sourceSelect.value;
          resetCanvas();
          console.log(`Restarted with camera id ${selectedDeviceId}`);
          codeReader.decodeFromVideoDevice(
            selectedDeviceId,
            "video",
            onScanResult,
            (err) => {
              if (!(err instanceof ZXing.NotFoundException)) {
                console.error(err);
              }
            }
          );
        };

        const sourceSelectPanel = document.getElementById("sourceSelectPanel");
        sourceSelectPanel.style.display = "block";

        setTimeout(() => {
          const video = document.getElementById("video");
          video.style.border = "1px solid #fe8e14";

          const animatedLine = document.querySelector(".animated-line");
          animatedLine.style.backgroundColor = "#fe8e14";
        }, 700);
      }

      function onScanResult(result, err) {
        if (result) {
          resetCanvas();

          preloadScanSound();

          badgeContainer.textContent = `Codigo Escaneado: ${result.text}`;

          if (result.barcodeResult) {
            if (!scannedNumbers[result.text]) {
              scannedNumbers[result.text] = [];
            }
            scannedNumbers[result.text].push(new Date());
          }
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
          console.error(err);
          document.getElementById("badgeContainer").textContent = err;
        }
      }

      video.onloadedmetadata = adjustLinePosition;
      window.addEventListener("resize", adjustLinePosition);

      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        "video",
        onScanResult,
        (err) => {
          if (!(err instanceof ZXing.NotFoundException)) {
            console.error(err);
            document.getElementById("badgeContainer").textContent = err;
          }
        }
      );
      console.log(
        `Started continuous decode from camera with id ${selectedDeviceId}`
      );
    })
    .catch((err) => {
      console.error(err);
    });
});

// Función para obtener el rectángulo del código de barras a partir de los puntos de resultado
function getBoundingBox(resultPoints) {
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;

    resultPoints.forEach((point) => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    });

    const x = Math.floor(minX);
    const y = Math.floor(minY);
    const width = Math.ceil(maxX - minX);
    const height = Math.ceil(maxY - minY);

    return { x, y, width, height };
}
