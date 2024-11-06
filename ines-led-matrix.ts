namespace NeoPixelMatrix {
    // ENUMS
    enum Direction {
        //% block="right"
        Right = 0,
        //% block="left"
        Left = 1
    }

    // //% block="JoystickDirection" // in case strings are needed instead of numbers
    // type JoystickDirection = 
    //     | "notPressed"
    //     | "center"
    //     | "up"
    //     | "down"
    //     | "right"
    //     | "left";
    enum JoystickDirection {
        //% block="notPressed"
        NotPressed = 0,
        //% block="center"
        Center = 1,
        //% block="up"
        Up = 2,
        //% block="down"
        Down = 3,
        //% block="right"
        Right = 4,
        //% block="left"
        Left = 5
    }

    // GLOBAL VARIABLES
    const startTime = control.millis();
    let currentTimeSeconds: number = 0;
    const timeUpdateInterval: number = 1; // in second
    let timeUpdateIntervalCounter = 0;
    let isUpdatingTime: boolean = false;
    let missedTimeUpdates: number = 0;
    let strip: neopixel.Strip;
    let matrixWidth = 8; // x
    let matrixHeight = 8; // y
    let currentBrightness = 100; // 0 to 255
    let pollingInterval = 100 // 100ms Interval for polling LED Matrix Interface. Adjust the polling interval as needed.
    let wordClockDisplayUpdateInterval = 3; // 1 second
    let pinSlider: DigitalPin = DigitalPin.P1;
    let pinCenterButton: DigitalPin = DigitalPin.P2;
    let pinUpButton: DigitalPin = DigitalPin.P9;
    let pinDownButton: DigitalPin = DigitalPin.P16;
    let pinRightButton: DigitalPin = DigitalPin.P8;
    let pinLeftButton: DigitalPin = DigitalPin.P12;
    let counter = 0;
    let lastSliderValue = readSlider();
    let lastJoystickDirection: JoystickDirection = JoystickDirection.NotPressed;
    let result: number[][] = [];
    let binaryArray: number[] = [];
    let finalResult: number[][] = [];
    let output: number[][] = [];
    let charData: number[] = [];
    let charMatrix: number[][] = [];
    let im: Image;
    let textArray: number[][] = [];
    let totalWidth: number = 0;
    let index: number = 0;
    let debugEnabled: boolean = false;

    // Simple 8x8 font
    let textFont: { [char: string]: number[] } = {
        // Uppercase letters map
        'A': [0b00000000, 0b00011000, 0b00100100, 0b01000010, 0b01111110, 0b01000010, 0b01000010, 0b00000000],
        'B': [0b00000000, 0b01111000, 0b01000100, 0b01111000, 0b01000100, 0b01000100, 0b01111000, 0b00000000],
        'C': [0b00000000, 0b00111100, 0b01000010, 0b01000000, 0b01000000, 0b01000010, 0b00111100, 0b00000000],
        'D': [0b00000000, 0b01111000, 0b01000100, 0b01000010, 0b01000010, 0b01000100, 0b01111000, 0b00000000],
        'E': [0b00000000, 0b01111110, 0b01000000, 0b01111000, 0b01000000, 0b01000000, 0b01111110, 0b00000000],
        'F': [0b00000000, 0b01111110, 0b01000000, 0b01111000, 0b01000000, 0b01000000, 0b01000000, 0b00000000],
        'G': [0b00000000, 0b00111100, 0b01000010, 0b01000000, 0b01001110, 0b01000010, 0b00111100, 0b00000000],
        'H': [0b00000000, 0b01000010, 0b01000010, 0b01111110, 0b01000010, 0b01000010, 0b01000010, 0b00000000],
        'I': [0b00000000, 0b00111100, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00111100, 0b00000000],
        'J': [0b00000000, 0b00011110, 0b00000100, 0b00000100, 0b00000100, 0b01000100, 0b00111000, 0b00000000],
        'K': [0b00000000, 0b01000010, 0b01000100, 0b01001000, 0b01110000, 0b01001000, 0b01000100, 0b00000000],
        'L': [0b00000000, 0b01000000, 0b01000000, 0b01000000, 0b01000000, 0b01000000, 0b01111110, 0b00000000],
        'M': [0b00000000, 0b01000010, 0b01100110, 0b01011010, 0b01000010, 0b01000010, 0b01000010, 0b00000000],
        'N': [0b00000000, 0b01000010, 0b01100010, 0b01010010, 0b01001010, 0b01000110, 0b01000010, 0b00000000],
        'O': [0b00000000, 0b00111100, 0b01000010, 0b01000010, 0b01000010, 0b01000010, 0b00111100, 0b00000000],
        'P': [0b00000000, 0b01111000, 0b01000100, 0b01000100, 0b01111000, 0b01000000, 0b01000000, 0b00000000],
        'Q': [0b00000000, 0b00111100, 0b01000010, 0b01000010, 0b01001010, 0b01000100, 0b00111010, 0b00000000],
        'R': [0b00000000, 0b01111000, 0b01000100, 0b01000100, 0b01111000, 0b01001000, 0b01000100, 0b00000000],
        'S': [0b00000000, 0b00111100, 0b01000010, 0b00110000, 0b00001100, 0b01000010, 0b00111100, 0b00000000],
        'T': [0b00000000, 0b01111110, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00000000],
        'U': [0b00000000, 0b01000010, 0b01000010, 0b01000010, 0b01000010, 0b01000010, 0b00111100, 0b00000000],
        'V': [0b00000000, 0b01000010, 0b01000010, 0b01000010, 0b00100100, 0b00100100, 0b00011000, 0b00000000],
        'W': [0b00000000, 0b01000010, 0b01000010, 0b01000010, 0b01011010, 0b01100110, 0b01000010, 0b00000000],
        'X': [0b00000000, 0b01000010, 0b00100100, 0b00011000, 0b00011000, 0b00100100, 0b01000010, 0b00000000],
        'Y': [0b00000000, 0b01000010, 0b00100100, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00000000],
        'Z': [0b00000000, 0b01111110, 0b00000100, 0b00001000, 0b00010000, 0b00100000, 0b01111110, 0b00000000],
        ' ': [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000],
        // Lowercase letters map
        'a': [0b00000000, 0b00000000, 0b00111100, 0b00000010, 0b00111110, 0b01000010, 0b00111110, 0b00000000],
        'b': [0b00000000, 0b01000000, 0b01000000, 0b01111100, 0b01000010, 0b01000010, 0b01111100, 0b00000000],
        'c': [0b00000000, 0b00000000, 0b00111100, 0b01000000, 0b01000000, 0b01000010, 0b00111100, 0b00000000],
        'd': [0b00000000, 0b00000010, 0b00000010, 0b00111110, 0b01000010, 0b01000010, 0b00111110, 0b00000000],
        'e': [0b00000000, 0b00000000, 0b00111100, 0b01000010, 0b01111110, 0b01000000, 0b00111100, 0b00000000],
        'f': [0b00000000, 0b00001100, 0b00010010, 0b00010000, 0b01111100, 0b00010000, 0b00010000, 0b00000000],
        'g': [0b00000000, 0b00000000, 0b00111110, 0b01000010, 0b00111110, 0b00000010, 0b01111100, 0b00000000],
        'h': [0b00000000, 0b01000000, 0b01000000, 0b01111100, 0b01000010, 0b01000010, 0b01000010, 0b00000000],
        'i': [0b00000000, 0b00000000, 0b00011000, 0b00000000, 0b00111000, 0b00001000, 0b00111100, 0b00000000],
        'j': [0b00000000, 0b00000000, 0b00001100, 0b00000000, 0b00011100, 0b00000100, 0b00111100, 0b00000000],
        'k': [0b00000000, 0b01000000, 0b01000010, 0b01000100, 0b01111000, 0b01000100, 0b01000010, 0b00000000],
        'l': [0b00000000, 0b00110000, 0b00001000, 0b00001000, 0b00001000, 0b00001000, 0b00111100, 0b00000000],
        'm': [0b00000000, 0b00000000, 0b01100100, 0b01011010, 0b01000010, 0b01000010, 0b01000010, 0b00000000],
        'n': [0b00000000, 0b00000000, 0b01111000, 0b01000100, 0b01000100, 0b01000100, 0b01000100, 0b00000000],
        'o': [0b00000000, 0b00000000, 0b00111100, 0b01000010, 0b01000010, 0b01000010, 0b00111100, 0b00000000],
        'p': [0b00000000, 0b00000000, 0b01111100, 0b01000010, 0b01111100, 0b01000000, 0b01000000, 0b00000000],
        'q': [0b00000000, 0b00000000, 0b00111110, 0b01000010, 0b00111110, 0b00000010, 0b00000010, 0b00000000],
        'r': [0b00000000, 0b00000000, 0b01011100, 0b01100010, 0b01000000, 0b01000000, 0b01000000, 0b00000000],
        's': [0b00000000, 0b00000000, 0b00111110, 0b01000000, 0b00111100, 0b00000010, 0b01111100, 0b00000000],
        't': [0b00000000, 0b00000000, 0b00010000, 0b01111100, 0b00010000, 0b00010010, 0b00001100, 0b00000000],
        'u': [0b00000000, 0b00000000, 0b01000010, 0b01000010, 0b01000010, 0b01000110, 0b00111010, 0b00000000],
        'v': [0b00000000, 0b00000000, 0b01000010, 0b01000010, 0b00100100, 0b00100100, 0b00011000, 0b00000000],
        'w': [0b00000000, 0b00000000, 0b01000010, 0b01000010, 0b01011010, 0b01100110, 0b01000010, 0b00000000],
        'x': [0b00000000, 0b00000000, 0b01000010, 0b00100100, 0b00011000, 0b00100100, 0b01000010, 0b00000000],
        'y': [0b00000000, 0b00000000, 0b01000010, 0b01000010, 0b00111110, 0b00000010, 0b00111100, 0b00000000],
        'z': [0b00000000, 0b00000000, 0b01111110, 0b00000100, 0b00001000, 0b00100000, 0b01111110, 0b00000000],
    };

    //% block="set serial debugging prints to $enable"
    //% enable.shadow="toggleOnOff"
    export function debugEnable(enable: boolean): void {
        debugEnabled = enable;
    }

    function serialDebugMsg(message: string): void {
        if (debugEnabled) {
            serial.writeLine(message);
        }
    }

    //% block="initialize NeoPixel matrix with pin $pin and brightness $brightness"
    //% brightness.min=0 brightness.max=255
    export function initializeMatrix(pin: DigitalPin = DigitalPin.P0, brightness: number): void {
        serial.setBaudRate(BaudRate.BaudRate115200)
        serial.redirectToUSB();

        currentBrightness = brightness;
        strip = neopixel.create(pin, matrixWidth * matrixHeight, NeoPixelMode.RGB);
        strip.setBrightness(brightness);
        clear();
        initializeMatrixInterface();
        control.inBackground(function () {
            while (true) {
                calculateCurrentTime();
            }
        });
        serialDebugMsg("initializeMatrix: Matrix init on pin: " + pin + " with brightness: " + brightness);
    }

    function initializeMatrixInterface(): void {
        pins.setPull(pinSlider, PinPullMode.PullUp);
        pins.setPull(pinCenterButton, PinPullMode.PullUp);
        pins.setPull(pinUpButton, PinPullMode.PullUp);
        pins.setPull(pinDownButton, PinPullMode.PullUp);
        pins.setPull(pinRightButton, PinPullMode.PullUp);
        pins.setPull(pinLeftButton, PinPullMode.PullUp);
        serialDebugMsg("initializeMatrixInterface: pinSlider: " + pinSlider + ", pinCenterButton:" + pinCenterButton + ", pinUpButton: " + pinUpButton + ", pinDownButton: " + pinDownButton + ", pinRightButton:" + pinRightButton + ", pinLeftButton: " + pinLeftButton);
    }

    //% block="initialize LED Matrix Interface (Expert). \nSlider pin $pinSliderTemp \nCenter button pin $pinCenterButtonTemp \nUp button pin $pinUpButtonTemp \nDown button pin $pinDownButtonTemp \nRight button pin $pinRightButtonTemp \nLeft button pin $pinLeftButtonTemp"
    export function initializeMatrixInterfaceExpert(
        pinSliderTemp: DigitalPin,
        pinCenterButtonTemp: DigitalPin,
        pinUpButtonTemp: DigitalPin,
        pinDownButtonTemp: DigitalPin,
        pinRightButtonTemp: DigitalPin,
        pinLeftButtonTemp: DigitalPin
    ): void {
        pinSlider = pinSliderTemp;
        pinCenterButton = pinCenterButtonTemp;
        pinUpButton = pinUpButtonTemp;
        pinDownButton = pinDownButtonTemp;
        pinRightButton = pinRightButtonTemp;
        pinLeftButton = pinLeftButtonTemp;

        pins.setPull(pinSlider, PinPullMode.PullUp);
        pins.setPull(pinCenterButton, PinPullMode.PullUp);
        pins.setPull(pinUpButton, PinPullMode.PullUp);
        pins.setPull(pinDownButton, PinPullMode.PullUp);
        pins.setPull(pinRightButton, PinPullMode.PullUp);
        pins.setPull(pinLeftButton, PinPullMode.PullUp);
        basic.pause(5); // Wait 5ms for pull-up to take effect
        serialDebugMsg("initializeMatrixInterface: pinSlider: " + pinSlider + ", pinCenterButton:" + pinCenterButton + ", pinUpButton: " + pinUpButton + ", pinDownButton: " + pinDownButton + ", pinRightButton:" + pinRightButton + ", pinLeftButton: " + pinLeftButton);
    }

    //% block="clear NeoPixel matrix"
    export function clear(): void {
        if (strip) {
            strip.clear();
            strip.show();
        }
    }

    //% block="set Brightness $brightness"
    export function setBrightness(brightness: number): void {
        currentBrightness = brightness;
        strip.setBrightness(brightness);
        strip.show();
        serialDebugMsg(`setBrightness: Brightness is set to = ${brightness}`);
    }

    function setPixel(x: number, y: number, color: number): void {
        if (strip) {
            if (color < 0 || color > 16777215) {
                serialDebugMsg("setPixel: Error color value out of range");
                color = 16777215;
            }
            if (x >= 0 && x < matrixWidth && y >= 0 && y < matrixHeight) {
                index = (matrixHeight - 1 - y) * matrixWidth + x; // (y)* 8 + x;
                strip.setPixelColor(index, color);
                // serialDebugMsg("setPixel: set pixel(" + x + "," + y + ") to = #" + color);
            } else {
                serialDebugMsg("setPixel: Error pixel out of range");
            }
        }
    }

    //% block="set one pixel at x $x y $y to color $color"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% color.shadow="colorNumberPicker"
    export function setOnePixel(x: number, y: number, color: number): void {
        setPixel(x, y, color);
        strip.show();
        serialDebugMsg("setOnePixel: Pixel: " + x + "," + y + " is set to color: " + color);
    }

    //% block="set one pixel at x:$x y:$y to RGB colors R:$R G:$G B:$B"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% R.min=0 R.max=255 G.min=0 G.max=255 B.min=0 B.max=255
    export function setOnePixelRGB(x: number, y: number, R: number, G: number, B: number): void {
        R = Math.max(0, Math.min(255, R));
        G = Math.max(0, Math.min(255, G));
        B = Math.max(0, Math.min(255, B));
        let color = neopixel.rgb(R, G, B);
        setPixel(x, y, color);
        strip.show();
        serialDebugMsg("setOnePixel: Pixel: " + x + "," + y + " is set to color(R,G,B): (" + R + "," + G + "," + B + ")");
    }

    //% block="read GPIO $pin"
    export function readGPIO(pin: DigitalPin): number { // Function not really needed, just for debugging
        let value = pins.analogReadPin(pin);
        serialDebugMsg("readGPIO: GPIO: " + pin + " Value: " + value);
        return value;
    }

    //% block="read slider value"
    export function readSlider(): number {
        return pins.digitalReadPin(pinSlider);
    }

    //% block="when slider value changed"
    export function SliderValueChanged(callback: () => void): void {
        control.inBackground(() => {
            while (true) {
                let currentSliderValue = pins.digitalReadPin(pinSlider);
                if (currentSliderValue !== lastSliderValue) {
                    lastSliderValue = currentSliderValue;
                    callback();
                }
                basic.pause(pollingInterval);
            }
        });
    }

    //% block="read joystick direction"
    export function readJoystick(): number {
        if (pins.digitalReadPin(pinCenterButton) == 0) {
            return JoystickDirection.Center;
        } else if (pins.digitalReadPin(pinUpButton) == 0) {
            return JoystickDirection.Up;
        } else if (pins.digitalReadPin(pinDownButton) == 0) {
            return JoystickDirection.Down;
        } else if (pins.digitalReadPin(pinRightButton) == 0) {
            return JoystickDirection.Right;
        } else if (pins.digitalReadPin(pinLeftButton) == 0) {
            return JoystickDirection.Left;
        } else {
            return JoystickDirection.NotPressed;
        }
    }

     //% block="read joystick direction as text"
     export function readJoystickText(): string {
        if (pins.digitalReadPin(pinCenterButton) == 0) {
            return "Center";
        } else if (pins.digitalReadPin(pinUpButton) == 0) {
            return "Up";
        } else if (pins.digitalReadPin(pinDownButton) == 0) {
            return "Down";
        } else if (pins.digitalReadPin(pinRightButton) == 0) {
            return "Right";
        } else if (pins.digitalReadPin(pinLeftButton) == 0) {
            return "Left";
        } else {
            return "NotPressed";
        }
    }

    /**
     */
    //% block="Bild8x8"
    //% imageLiteral=1
    //% imageLiteralColumns=8
    //% imageLiteralRows=8
    //% shim=images::createImage
    //% weight=90
    export function matrix8x8(i: string): Image {
        im = <Image><any>i;
        return im
    }

    //% block="show image on NeoPixel matrix $image with color $color"
    //% color.shadow="colorNumberPicker"
    export function showImage(image: Image, color: number): void {
        try {
            let imagewidth = image.width();
            let imageheight = image.height();

            for (let x = 0; x < imagewidth; x++) {
                //serialDebugMsg("generating matrix 1");
                for (let y = 0; y < imageheight; y++) {
                    //serialDebugMsg("generating matrix 0");
                    if (image.pixel(x, y)) {
                        setPixel(x, y, color);
                    }
                }
            }
        } catch {
            serialDebugMsg("showImage: Error creating image matrix");
        }
        strip.show();
        im = <Image><any>'';
    }

    //% block="show moving image on NeoPixel matrix $image with color $color and speed $speed in direction $direction"
    //% color.shadow="colorNumberPicker"
    //% speed.defl=100 speed.min=1 speed.max=1000
    //% direction.defl=Direction.Right
    export function movingImage(image: Image, color: number, speed: number, direction: Direction): void {
        // Due to a bug the block is always generated with speed of 0. In this case we set it to 100ms.
        if (speed < 1) {
            speed = 100; // 100ms
        } else {
            speed = 1001 - speed; // make 1000 the fstest speed
        }

        try {
            if (direction === Direction.Left) {
                for (let offset = -matrixWidth; offset <= matrixWidth; offset++) {
                    for (let x = 0; x < matrixWidth; x++) {
                        for (let y = 0; y < matrixHeight; y++) {
                            const PixelOn = image.pixel(x + offset, y);
                            //serialDebugMsg(`Pixel at (${x + offset}, ${y}) is ${PixelOn ? "on" : "off"}`);
                            setPixel(x, y, PixelOn ? color : 0);
                        }
                    }
                    strip.show();
                    basic.pause(speed);
                }
            } else if (direction === Direction.Right) {
                for (let offset = matrixWidth; offset >= -matrixWidth; offset--) {
                    for (let x = 0; x < matrixWidth; x++) {
                        for (let y = 0; y < matrixHeight; y++) {
                            ;
                            const PixelOn = image.pixel(x + offset, y);
                            //serialDebugMsg(`Pixel at (${x + offset}, ${y}) is ${PixelOn ? "on" : "off"}`);
                            setPixel(x, y, PixelOn ? color : 0);
                        }
                    }
                    strip.show();
                    basic.pause(speed);
                }
            }
        } catch {
            serialDebugMsg("movingImage: Error displaying moving image");
        }
    }

    // function isValidString(input: string): string {
    //     const regex = /[^a-zA-Z0-9.,!?]/g;
    //     return input.replace(regex, ' ');
    //     // return regex.test(input);
    //     //return input.replace(regex, ' ');
    // }

    //% block="scroll text $text with color $color and speed $speed"
    //% color.shadow="colorNumberPicker"
    //% speed.defl=100 speed.min=1 speed.max=1000
    export function scrollText(text: string, color: number, speed: number): void {
        if (speed < 1) {
            speed = 100; // 100ms
        } else {
            speed = 1001 - speed; // make 1000 the fstest speed
        }
        textArray = getTextArray(text);
        totalWidth = textArray[0].length;
        serialDebugMsg("\nscrollText: beginning Scrolling text: " + text);
        for (let offset = 0; offset < totalWidth; offset++) { // Scrolls text to the left
            for (let x = 0; x < matrixWidth; x++) {
                for (let y = 0; y < matrixHeight; y++) {
                    if (x + offset >= totalWidth) continue;
                    const PixelOn = textArray[y][x + offset] == 1;
                    setPixel(x, y, PixelOn ? color : 0);
                }
            }
            strip.show();
            basic.pause(speed);
        }
        textArray = [];
        serialDebugMsg("scrollText: Scroll Text Completed\n");
    }

    function getTextArray(text: string): number[][] {
        result = [];
        binaryArray = [];
        finalResult = [];
        output = [];
        charData = [];
        charMatrix = [];
        counter += 1;
        //serialDebugMsg("getTextArray: Number of Executions: " + counter);

        //create binary array of each 
        for (let i = 0; i < text.length; i++) {
            if (textFont[text[i]]) {
                try {
                    charData = textFont[text[i]];
                } catch {
                    serialDebugMsg("getTextArray: Error getting char Data");
                }

                for (let row of charData) {
                    for (let bit = matrixWidth - 1; bit >= 0; bit--) {
                        try {
                            binaryArray.push((row >> bit) & 1);
                        } catch {
                            serialDebugMsg("getTextArray: Error transforming Array");
                        }
                    }
                    try {
                        charMatrix.push(binaryArray);
                        binaryArray = [];
                    } catch {
                        serialDebugMsg("getTextArray: Error pushing binary Array");
                    }
                }
                //serialDebugMsg("getTextArray: pushed binary")
                try {
                    output = charMatrix[0].map((_, colIndex) => charMatrix.map(row => row[colIndex]));
                    charMatrix = [];
                } catch (err) {
                    serialDebugMsg("getTextArray: Error transposing character matrix");
                }
                try {
                    result = result.concat(output);
                } catch {
                    serialDebugMsg("getTextArray: failed to push char array");
                }
                //serialDebugMsg("getTextArray: pushed zeros");
            }
        }
        //serialDebugMsg("getTextArray: Centering Result");
        try {
            finalResult = result[0].map((_, columnIndex) => result.map(rows => rows[columnIndex]));
        } catch (err) {
            serialDebugMsg("getTextArray: Error transposing final matrix")
        }

        // Clear arrays to free memory (garbage collector can reclaim memory)
        result = null;
        binaryArray = null;
        output = null;
        charData = null;
        charMatrix = null;

        //serialDebugMsg("getTextArray: Successfully created text array");
        return finalResult;
    }

    // TODO make time class out if time stuff, ore else start organizing this mess
    function sleepUntil(targetTime: number): void {
        const currentTime = control.millis();
        const delay = targetTime - currentTime;

        if (delay <= 0) {
            // If the target time is in the past or now, call the callback immediately
        } else {
            basic.pause(delay);
        }
    }

    // Function to calculate the current time, needs to be run in the background
    function calculateCurrentTime(): void {
        // Calculate the next wake-up time
        let nextWakeUpTime = startTime + timeUpdateInterval * 1000 * timeUpdateIntervalCounter;

        // Sleep until the next wake-up time
        sleepUntil(nextWakeUpTime);
        if (!isUpdatingTime) { // Mutex to prevent updating time while it is being calculated
            isUpdatingTime = true;
            currentTimeSeconds = currentTimeSeconds + timeUpdateInterval + missedTimeUpdates;
            if (currentTimeSeconds >= 86400) {
                currentTimeSeconds = 0;
            }
            isUpdatingTime = false;
            missedTimeUpdates = 0;
        } else {
            missedTimeUpdates++;
            serialDebugMsg("calculateCurrentTime: Time is being updated, trying again later. Missed updates: " + missedTimeUpdates);
            return;
        }
        timeUpdateIntervalCounter++;
        // serialDebugMsg("calculateCurrentTime: currentTimeSeconds = " + currentTimeSeconds);
    }

    //% block="get current time as text"
    export function getCurrentTimeAsText(): string {
        let hours = Math.floor(currentTimeSeconds / 3600) % 24;
        let minutes = Math.floor((currentTimeSeconds % 3600) / 60);
        let seconds = currentTimeSeconds % 60;

        // // return the time as a 2D array of numbers
        // return [
        //     [hours],
        //     [minutes],
        //     [seconds]
        // ];
        return `${hours}:${minutes}:${seconds}`; // return the time as a string
    }

    // TODO Bug in block no slider for setting time, only works with variables
    //% block="set current time to $hours:$minutes:$seconds"
    //% hours.min=0 hours.max=23
    //% minutes.min = 0 minutes.max = 59
    //% seconds.min = 0 seconds.max = 59
    export function setCurrentTime(hours: number, minutes: number, seconds: number): void {
        // Validate the input time
        if (hours < 0 || hours > 23) {
            serialDebugMsg("Invalid hours. Must be between 0 and 23.");
        } else if (minutes < 0 || minutes > 59) {
            serialDebugMsg("Invalid minutes. Must be between 0 and 59.");
        } else if (seconds < 0 || seconds > 59) {
            serialDebugMsg("Invalid seconds. Must be between 0 and 59.");
        } else {
            if (!isUpdatingTime) { // Mutex to prevent updating time while it is being calculated
                // Calculate the start time in seconds
                isUpdatingTime = true;
                currentTimeSeconds = hours * 3600 + minutes * 60 + seconds;
                isUpdatingTime = false;
                serialDebugMsg(`setCurrentTime: Time set to ${hours}:${minutes}:${seconds}`);

            } else {
                serialDebugMsg("setCurrentTime: Time is being updated, please try again later.");
                return;
            }
        }
    }

    class ClockTable {
        public ONE: number[][] = [];
        public TWO: number[][] = [];
        public THREE: number[][] = [];
        public FOUR: number[][] = [];
        public HOUR_FIVE: number[][] = [];
        public MIN_FIVE: number[][] = [];
        public SIX: number[][] = [];
        public SEVEN: number[][] = [];
        public EIGHT: number[][] = [];
        public NINE: number[][] = [];
        public HOUR_TEN: number[][] = [];
        public MIN_TEN: number[][] = [];
        public ELEVEN: number[][] = [];
        public TWELVE: number[][] = [];
        public QUARTER: number[][] = [];
        public TWENTY: number[][] = [];
        public TWENTY_FIVE: number[][] = [];
        public HALF: number[][] = [];
        public PAST: number[][] = [];
        public TO: number[][] = [];
        public ZHAW: number[][] = [];
        public HOURS_MAPPING: { [key: number]: number[][] };
        public MINUTES_MAPPING: { [key: number]: number[][] | number };

        constructor(version: number = 1) {
            this.ONE.push([1, 7]);
            this.ONE.push([4, 7]);
            this.ONE.push([7, 7]);

            this.TWO.push([0, 6]);
            this.TWO.push([1, 6]);
            this.TWO.push([1, 7]);

            this.THREE.push([3, 5]);
            this.THREE.push([4, 5]);
            this.THREE.push([5, 5]);
            this.THREE.push([6, 5]);
            this.THREE.push([7, 5]);

            this.FOUR.push([0, 7]);
            this.FOUR.push([1, 7]);
            this.FOUR.push([2, 7]);
            this.FOUR.push([3, 7]);

            this.HOUR_FIVE.push([0, 4]);
            this.HOUR_FIVE.push([1, 4]);
            this.HOUR_FIVE.push([2, 4]);
            this.HOUR_FIVE.push([3, 4]);

            this.MIN_FIVE.push([4, 2]);
            this.MIN_FIVE.push([5, 2]);
            this.MIN_FIVE.push([6, 2]);
            this.MIN_FIVE.push([7, 2]);

            this.SIX.push([0, 5]);
            this.SIX.push([1, 5]);
            this.SIX.push([2, 5]);

            this.SEVEN.push([0, 5]);
            this.SEVEN.push([4, 6]);
            this.SEVEN.push([5, 6]);
            this.SEVEN.push([6, 6]);
            this.SEVEN.push([7, 6]);

            this.EIGHT.push([3, 4]);
            this.EIGHT.push([4, 4]);
            this.EIGHT.push([5, 4]);
            this.EIGHT.push([6, 4]);
            this.EIGHT.push([7, 4]);

            this.NINE.push([4, 7]);
            this.NINE.push([5, 7]);
            this.NINE.push([6, 7]);
            this.NINE.push([7, 7]);

            this.HOUR_TEN.push([7, 4]);
            this.HOUR_TEN.push([7, 5]);
            this.HOUR_TEN.push([7, 6]);

            this.MIN_TEN.push([2, 0]);
            this.MIN_TEN.push([4, 0]);
            this.MIN_TEN.push([5, 0]);

            this.ELEVEN.push([2, 6]);
            this.ELEVEN.push([3, 6]);
            this.ELEVEN.push([4, 6]);
            this.ELEVEN.push([5, 6]);
            this.ELEVEN.push([6, 6]);
            this.ELEVEN.push([7, 6]);

            this.TWELVE.push([0, 6]);
            this.TWELVE.push([1, 6]);
            this.TWELVE.push([2, 6]);
            this.TWELVE.push([3, 6]);
            this.TWELVE.push([5, 6]);
            this.TWELVE.push([6, 6]);

            this.QUARTER.push([1, 1]);
            this.QUARTER.push([2, 1]);
            this.QUARTER.push([3, 1]);
            this.QUARTER.push([4, 1]);
            this.QUARTER.push([5, 1]);
            this.QUARTER.push([6, 1]);
            this.QUARTER.push([7, 1]);

            this.TWENTY.push([2, 0]);
            this.TWENTY.push([3, 0]);
            this.TWENTY.push([4, 0]);
            this.TWENTY.push([5, 0]);
            this.TWENTY.push([6, 0]);
            this.TWENTY.push([7, 0]);

            this.TWENTY_FIVE.push([2, 0]);
            this.TWENTY_FIVE.push([3, 0]);
            this.TWENTY_FIVE.push([4, 0]);
            this.TWENTY_FIVE.push([5, 0]);
            this.TWENTY_FIVE.push([6, 0]);
            this.TWENTY_FIVE.push([7, 0]);
            this.TWENTY_FIVE.push([4, 2]);
            this.TWENTY_FIVE.push([5, 2]);
            this.TWENTY_FIVE.push([6, 2]);
            this.TWENTY_FIVE.push([7, 2]);

            if (version === 1) {
                this.HALF.push([0, 2]);
                this.HALF.push([1, 2]);
                this.HALF.push([2, 2]);
                this.HALF.push([3, 2]);

                this.PAST.push([1, 3]);
                this.PAST.push([2, 3]);
                this.PAST.push([3, 3]);
                this.PAST.push([4, 3]);

                this.TO.push([6, 3]);
                this.TO.push([7, 3]);

                this.ZHAW.push([0, 0]);
                this.ZHAW.push([0, 1]);
                this.ZHAW.push([1, 2]);
                this.ZHAW.push([0, 3]);
            } else if (version === 2) {
                this.HALF.push([1, 2]);
                this.HALF.push([2, 2]);
                this.HALF.push([3, 2]);
                this.HALF.push([4, 2]);

                this.PAST.push([2, 3]);
                this.PAST.push([3, 3]);
                this.PAST.push([4, 3]);
                this.PAST.push([5, 3]);

                this.TO.push([5, 3]);
                this.TO.push([6, 3]);

                this.ZHAW.push([0, 0]);
                this.ZHAW.push([0, 1]);
                this.ZHAW.push([0, 2]);
                this.ZHAW.push([0, 3]);
            }

            // Lookup dictionary for wordclock hours
            this.HOURS_MAPPING = {
                0: this.TWELVE,
                1: this.ONE,
                2: this.TWO,
                3: this.THREE,
                4: this.FOUR,
                5: this.HOUR_FIVE,
                6: this.SIX,
                7: this.SEVEN,
                8: this.EIGHT,
                9: this.NINE,
                10: this.HOUR_TEN,
                11: this.ELEVEN,
            };

            // Lookup dictionary for wordclock minutes
            this.MINUTES_MAPPING = {
                0: 0,
                5: this.MIN_FIVE,
                10: this.MIN_TEN,
                15: this.QUARTER,
                20: this.TWENTY,
                25: this.TWENTY_FIVE,
                30: this.HALF,
            };
        }
    }

    class WordClock {
        private _matrix: any;
        private _clocktable: any;

        public hourColor: number;
        public minuteColor: number;
        public wordColor: number;
        public brightness: number;

        constructor(version: number = 1, hourColor: number, minuteColor: number, wordColor: number) {
            this._clocktable = new ClockTable(version);
            basic.pause(100);
            this.hourColor = hourColor;
            this.minuteColor = minuteColor;
            this.wordColor = wordColor;
            this.brightness = currentBrightness;
            this._matrix = strip;

            if (!this._matrix || !this._clocktable) {
                serialDebugMsg("WordClock: Error - Matrix or ClockTable is not initialized");
                return;
            }

            this.displayTime();
            this.waitUntilRefresh();
            serialDebugMsg("WordClock: Word clock initialized");
        }

        private waitUntilRefresh(): void {
            const nextWakeUpTime = currentTimeSeconds + wordClockDisplayUpdateInterval;
            serialDebugMsg("WordClock: waitUntilRefresh: Refreshing display, currentTimeSeconds = " + currentTimeSeconds + ", nextWakeUpTime = " + nextWakeUpTime);
            sleepUntil(nextWakeUpTime * 1000);

        }

        private setClockPixels(pixels: [number, number][], color: number): void {
            for (let i = 0; i < pixels.length; i++) {
                const x = pixels[i][0];
                const y = pixels[i][1];
                setPixel(x, y, color);
                serialDebugMsg("WordClock: setClockPixels: Set pixel(" + x + "," + y + ") to color: " + color);
            }
        }

        public displayTime(): void {
            if (!this._matrix || !this._clocktable) {
                serialDebugMsg("WordClock: Error - Matrix or ClockTable is not initialized");
                return;
            }

            let hours = currentTimeSeconds / 3600;
            let minutes = currentTimeSeconds / 60;

            serialDebugMsg("WordClock: hours = " + hours + ", minutes = " + minutes);
            let modifier: [number, number][];

            if (minutes > 32) {
                hours += 1;
                minutes = 60 - minutes;
                modifier = this._clocktable.TO;
            } else {
                modifier = this._clocktable.PAST;
            }
            serialDebugMsg("WordClock: 1");

            minutes = 5 * Math.round(minutes / 5);
            hours = Math.floor(hours % 12);

            serialDebugMsg("WordClock: 2");

            this._matrix.clear();

            serialDebugMsg("WordClock: 3, hours = " + hours + ", minutes = " + minutes);

            // let ONE_TEST: [number, number][] // no work
            // let ONE_TEST: Array<[number, number]>; // no work
            //let ONE_TEST: any // no work
            // let ONE_TEST: [[number, number], [number, number], [number, number]]; // no work
            // ONE_TEST = [
            //     [1, 7],
            //     [4, 7],
            //     [7, 7],
            // ];

            // let ONE_TEST: Array<[number, number]> = [ // no work
            //     [1, 7],
            //     [4, 7],
            //     [7, 7],
            // ];

            // let ONE_TEST = [ // works WTF
            //     [1, 7],
            //     [4, 7],
            //     [7, 7],
            // ];

            // let ONE_TEST: Array<[number, number]> = []; // no work
            let ONE_TEST: number[][] = [] // works
            ONE_TEST.push([1, 7]);
            ONE_TEST.push([4, 7]);
            ONE_TEST.push([7, 7]);

            if (Array.isArray(ONE_TEST)) {
                serialDebugMsg("WordClock: ONE_TEST is an array");
                basic.pause(10);
                // Check the length of the array
                if (ONE_TEST.length > 0) {
                    serialDebugMsg("WordClock: ONE_TESTE length: " + ONE_TEST.length);
                    basic.pause(10);
                    // Access the first element safely
                    if (Array.isArray(ONE_TEST[0])) {
                        serialDebugMsg("WordClock: First element of ONE_TEST is an array with length " + ONE_TEST[0].length);
                        basic.pause(10);
                        if (ONE_TEST[0].length === 2) {
                            serialDebugMsg("x1 = " + ONE_TEST[0][0] + ", y1 = " + ONE_TEST[0][1]);
                        } else {
                            serialDebugMsg("WordClock: Error - First element of ONE_TEST is not a valid tuple");
                        }
                    } else {
                        serialDebugMsg("WordClock: Error - First element of ONE_TEST is not an array");
                    }
                } else {
                    serialDebugMsg("WordClock: Error - ONE_TEST is an empty array");
                }
            } else {
                serialDebugMsg("WordClock: Error - ONE_TEST is not an array");
            }

            serialDebugMsg("WordClock: ONE_TEST = " + JSON.stringify(ONE_TEST));
            serialDebugMsg("WordClock: ONE_TEST[0] = " + JSON.stringify(ONE_TEST[0]));
            serialDebugMsg("WordClock: ONE_TEST[0][0] = " + JSON.stringify(ONE_TEST[0][0]));

            // Debugging: Check if HOURS_MAPPING[hours] is an array of tuples
            const hoursMapping = this._clocktable.HOURS_MAPPING[hours];
            serialDebugMsg("WordClock: HOURS_MAPPING[hours] = " + JSON.stringify(hoursMapping));
            // basic.pause(1);
            // if (!Array.isArray(hoursMapping) || !hoursMapping.every((item: [number, number]) => Array.isArray(item) && item.length === 2)) {
            //     serialDebugMsg("WordClock: Error - HOURS_MAPPING[hours] is not a valid array of tuples");
            //     basic.pause(1)
            //     return;
            // }

            serialDebugMsg("WordClock: 3.1");
            basic.pause(10);
            if (!hoursMapping) {
                serialDebugMsg("WordClock: Error - HOURS_MAPPING[hours] is not a valid array of tuples");
            } else {
                serialDebugMsg("WordClock: HOURS_MAPPING[hours] is a valid");
            }
            serialDebugMsg("WordClock: 3.1.1");
            basic.pause(10);


            // serialDebugMsg("hoursMapping length" + hoursMapping.length); // doing this freezes code
            // serialDebugMsg("hoursMapping length" + this._clocktable.HOURS_MAPPING[hours].length); // doing this freezes code
            serialDebugMsg("WordClock: _clocktable.TWELVE = " + JSON.stringify(this._clocktable.TWELVE));
            // serialDebugMsg("hoursMapping length" + this._clocktable.TWELVE.length); // doing this freezes code
            // serialDebugMsg("x1 = " + this._clocktable.TWELVE[0][0] + ", y1 = " + this._clocktable.TWELVE[0][1]);
            serialDebugMsg("WordClock: 3.1.2");
            basic.pause(10);

            if (!this._clocktable || !this._clocktable.TWELVE) {
                serialDebugMsg("WordClock: Error - _clocktable or _clocktable.TWELVE is not defined");
                return;
            }

            serialDebugMsg("WordClock: _clocktable.TWELVE type: " + typeof this._clocktable.TWELVE);
            basic.pause(10);
            // if (!this._clocktable.TWELVE[0]) { // code crashes here
            //     serialDebugMsg("WordClock: Error - this._clocktable.TWELVE[0] not a valid array of tuples");
            // } else {
            //     serialDebugMsg("WordClock: this._clocktable.TWELVE[0] is a valid");
            // }
            // basic.pause(10);
            // serialDebugMsg("WordClock: _clocktable.TWELVE[0] type: " + typeof this._clocktable.TWELVE[0]); // code crashes here
            // basic.pause(10);
            // serialDebugMsg("WordClock: _clocktable.TWELVE[0][0] type: " + typeof this._clocktable.TWELVE[0][0]); // code crashes here
            // basic.pause(10);

            serialDebugMsg("WordClock: 3.1.2.1");
            basic.pause(10);

            // Check if this._clocktable.TWELVE is defined and not null
            if (this._clocktable.TWELVE !== undefined && this._clocktable.TWELVE !== null) {
                serialDebugMsg("WordClock: _clocktable.TWELVE is defined and not null");
                serialDebugMsg("WordClock: _clocktable.TWELVE type: " + typeof this._clocktable.TWELVE);
                serialDebugMsg("WordClock: _clocktable.TWELVE content: " + JSON.stringify(this._clocktable.TWELVE));
                basic.pause(10);

                // Check if this._clocktable.TWELVE is an array
                if (Array.isArray(this._clocktable.TWELVE)) {
                    serialDebugMsg("WordClock: _clocktable.TWELVE is an array");
                    basic.pause(10);
                    // Check the length of the array
                    if (this._clocktable.TWELVE.length > 0) { // code crashes here
                        serialDebugMsg("WordClock: _clocktable.TWELVE length: " + this._clocktable.TWELVE.length);
                        basic.pause(10);
                        // Access the first element safely
                        if (Array.isArray(this._clocktable.TWELVE[0])) {
                            serialDebugMsg("WordClock: First element of _clocktable.TWELVE is an array with length " + this._clocktable.TWELVE[0].length);
                            basic.pause(10);
                            if (this._clocktable.TWELVE[0].length === 2) {
                                serialDebugMsg("x1 = " + this._clocktable.TWELVE[0][0] + ", y1 = " + this._clocktable.TWELVE[0][1]);
                            } else {
                                serialDebugMsg("WordClock: Error - First element of _clocktable.TWELVE is not a valid tuple");
                            }
                        } else {
                            serialDebugMsg("WordClock: Error - First element of _clocktable.TWELVE is not an array");
                        }
                    } else {
                        serialDebugMsg("WordClock: Error - _clocktable.TWELVE is an empty array");
                    }
                } else {
                    serialDebugMsg("WordClock: Error - _clocktable.TWELVE is not an array");
                }
            } else {
                serialDebugMsg("WordClock: Error - _clocktable.TWELVE is undefined or null");
            }

            serialDebugMsg("WordClock: 3.1.3");
            basic.pause(10);

            for (let i = 0; i < 5; i++) {
                //serialDebugMsg("hoursMapping length" + hoursMapping.length);
                const x = hoursMapping[i][0];
                const y = hoursMapping[i][1];
                serialDebugMsg("WordClock: setClockPixels: Set pixel(" + x + "," + y + ") to color: " + this.hourColor);
                basic.pause(10);
                setPixel(x, y, this.hourColor);

            }


            // Set pixels for hours
            this.setClockPixels(hoursMapping, this.hourColor);

            serialDebugMsg("WordClock: 3.2");
            basic.pause(1);

            if (minutes !== 0) {
                // Set pixels for minutes
                const minutesMapping = this._clocktable.MINUTES_MAPPING[minutes];
                serialDebugMsg("WordClock: MINUTES_MAPPING[minutes] = " + JSON.stringify(minutesMapping));
                if (Array.isArray(minutesMapping) && minutesMapping.every((item: [number, number]) => Array.isArray(item) && item.length === 2)) {
                    this.setClockPixels(minutesMapping as [number, number][], this.minuteColor);
                } else {
                    serialDebugMsg("WordClock: Error - MINUTES_MAPPING[minutes] is not a valid array of tuples");
                }
                // Set pixels for modifier
                this.setClockPixels(modifier, this.wordColor);
            }

            this._matrix.setBrightness(this.brightness);
            this._matrix.show();

            serialDebugMsg("WordClock: 4");

            // Wait until the next full minute to refresh the display
            this.waitUntilRefresh();
            serialDebugMsg("WordClock: 5");
        }


    }

    // Not if this block is used with the control.inBackground block, it will not work #BUG
    //% block="create word clock, version $version, hour color $hourColor, minute color $minuteColor, word color $wordColor"
    //% version.defl=1
    //% hourColor.shadow="colorNumberPicker"
    //% minuteColor.shadow="colorNumberPicker"
    //% wordColor.shadow="colorNumberPicker"
    export function createWordClock(version: number = 1, hourColor: number, minuteColor: number, wordColor: number): void {
        // control.inBackground(() => {
        const wordClock = new WordClock(version, hourColor, minuteColor, wordColor);
        basic.pause(100);
        if (!wordClock) {
            serialDebugMsg("createWordClock: Error - WordClock object is not initialized");
        } else {
            serialDebugMsg("createWordClock: WordClock object initialized successfully");
        }

        while (true) {
            try {
                wordClock.displayTime();
                // TODO logic for joystick to change colors and time, currently waitUntilRefresh makes it impossible to change time
            }
            catch (e) {
                serialDebugMsg("createWordClock: Error in word clock");
            }

        }
        // });
    }

}
