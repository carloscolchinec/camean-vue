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


    codeReader.listVideoInputDevices()
        .then((videoInputDevices) => {
            const sourceSelect = document.getElementById('sourceSelect');

            // Buscar la cámara trasera en la lista de dispositivos de video
            const rearCameraDevice = videoInputDevices.find(device => {
                return device.label.toLowerCase().includes('rear') || device.label.toLowerCase().includes('trasera');
            });

            if (rearCameraDevice) {
                // Si se encontró la cámara trasera, seleccionarla
                selectedDeviceId = rearCameraDevice.deviceId;
            } else {
                // Si no se encontró la cámara trasera, seleccionar el primer dispositivo disponible
                selectedDeviceId = videoInputDevices[0].deviceId;
            }

            if (videoInputDevices.length >= 1) {
                videoInputDevices.forEach((element) => {
                    const sourceOption = document.createElement('option');
                    sourceOption.text = element.label;
                    sourceOption.value = element.deviceId;
                    sourceSelect.appendChild(sourceOption);
                });

                sourceSelect.value = selectedDeviceId;

                sourceSelect.onchange = () => {
                    codeReader.reset();
                    selectedDeviceId = sourceSelect.value;
                    resetCanvas();
                    console.log(`Restarted with camera id ${selectedDeviceId}`);
                    codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', onScanResult, err => {
                        alert(selectedDeviceId)
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
