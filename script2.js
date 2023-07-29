
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
                                                                                                                                        

window.addEventListener('load', function () {
    let selectedDeviceId;
    const codeReader = new ZXing.BrowserMultiFormatReader();
    const canvas = document.getElementById('scanner-overlay');
    const ctx = canvas.getContext('2d');
    const detectedBarcode = document.getElementById('detectedBarcode');
    const video = document.getElementById('video');
    const barcodeBox = document.querySelector('.barcode-box');
    const badgeContainer = document.getElementById('badgeContainer');
    const scanSound = document.getElementById('scanSound');
    const maxVerificationCount = 3;
    const barcodeVerificationCount = {};


    function adjustBarcodeBox(x, y, width, height) {
        // Mostrar el rectángulo del tamaño y posición del código de barras detectado
        barcodeBox.style.top = `${y}px`;
        barcodeBox.style.left = `${x}px`;
        barcodeBox.style.width = `${width}px`;
        barcodeBox.style.height = `${height}px`;
        barcodeBox.style.display = 'block';
    }

    function resetCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        detectedBarcode.style.display = 'none';
        barcodeBox.style.display = 'none';
    }

    function adjustLinePosition() {
        const videoHeight = video.clientHeight;
        const animatedLine = document.querySelector('.animated-line');
        animatedLine.style.top = `${videoHeight / 2}px`;
        sourceSelectPanel.style.marginTop = `${videoHeight + 20}px`;
    }

    function preloadScanSound() {
        const scanSound = new Howl({
            src: ['./barcode.mp3'],
            volume: 0.5,
            autoplay: true,
            onload: function () {
                // Esta función se ejecuta cuando el sonido ha sido cargado
                console.log('Sonido cargado.');
            },
            onloaderror: function (id, error) {
                // Esta función se ejecuta si ocurre un error al cargar el sonido
                console.error('Error al cargar el sonido:', error);
            }
        });
    }

 function isAndroid() {
                return /Android/i.test(navigator.userAgent) && /Samsung|Huawei|Xiaomi|Redmi/i.test(navigator.userAgent);
            }

            // Función para detectar si el sistema operativo es iOS (iPhone)
            function isiOS() {
                return /(iPhone|iPod)/i.test(navigator.userAgent);
            }

            // Función para seleccionar la cámara correspondiente según el sistema operativo
            async function selectCameraByOS(videoInputDevices) {
                if (isAndroid() || isiOS()) {
                    // Si es Android o iOS, selecciona la cámara trasera (deviceId = '1')
                    const rearCamera = videoInputDevices.find(device => device.deviceId === '1');
                    if (rearCamera) {
                        return rearCamera.deviceId;
                    }
                }
                // Si no es Android ni iOS, selecciona la cámara delantera (deviceId = '0')
                return videoInputDevices[0].deviceId;
            }


   codeReader.listVideoInputDevices()
  .then((videoInputDevices) => {
   codeReader.listVideoInputDevices()
                .then((videoInputDevices) => {
                    const sourceSelect = document.getElementById('sourceSelect');
                    // Selección de la cámara según el sistema operativo
                    selectedDeviceId = selectCameraByOS(videoInputDevices);

                    if (videoInputDevices.length >= 1) {
                        videoInputDevices.forEach((element) => {
                            const sourceOption = document.createElement('option');
                            sourceOption.text = element.label;
                            sourceOption.value = element.deviceId;
                            sourceSelect.appendChild(sourceOption);
                        });

                        sourceSelect.onchange = () => {
                            codeReader.reset();
                            selectedDeviceId = sourceSelect.value;
                            resetCanvas();
                            console.log(`Restarted with camera id ${selectedDeviceId}`);
                            codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', onScanResult, err => {
                                if (!(err instanceof ZXing.NotFoundException)) {
                                    console.error(err);
                                }
                            });
                        };

                        const sourceSelectPanel = document.getElementById('sourceSelectPanel');
                        sourceSelectPanel.style.display = 'block';
                    }
            function onScanResult(result, err) {
                if (result) {
                    resetCanvas();

                    preloadScanSound();

                    badgeContainer.textContent = `Codigo Escaneado: ${result.text}`;

                    // Mostrar el rectángulo alrededor del código de barras detectado
                    if (result.barcodeResult) {
                        const { x, y, width, height } = getBoundingBox(result.barcodeResult.resultPoints);
                        ctx.strokeStyle = '#10B981';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(x, y, width, height);

                        // Mostrar el código detectado en la esquina superior derecha del rectángulo
                        detectedBarcode.textContent = `[${result.text}]`;
                        detectedBarcode.style.top = `${y}px`;
                        detectedBarcode.style.left = `${x + width}px`;
                        detectedBarcode.style.display = 'block';

                        // Mostrar el rectángulo que encierra el código de barras
                        adjustBarcodeBox(x, y, width, height);

                        // Guardar el número escaneado en el array
                        if (!scannedNumbers[result.text]) {
                            scannedNumbers[result.text] = [];
                        }
                        scannedNumbers[result.text].push(new Date());

                    }
                }
                if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.error(err);
                    document.getElementById('badgeContainer').textContent = err;
                }
            }

            video.onloadedmetadata = adjustLinePosition;
            window.addEventListener('resize', adjustLinePosition);

            codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', onScanResult, err => {
                if (!(err instanceof ZXing.NotFoundException)) {
                    console.error(err);
                    document.getElementById('badgeContainer').textContent = err;
                }
            });
            console.log(`Started continuous decode from camera with id ${selectedDeviceId}`);
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

    resultPoints.forEach(point => {
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
