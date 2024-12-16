// a creation by ZHAW, 2024
// edited by vore and hesu

//% color=#3162a3 icon="\uf00a" block="InES Matrix"
namespace NeoPixelMatrix {

    enum Direction {
        //% block="right"
        Right = 0,
        //% block="left"
        Left = 1
    }


    /* GLOBAL VARIABLES */
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
    let pollingInterval = 10 // 10ms Interval for polling LED Matrix Interface. Adjust the polling interval as needed.
    let wordClockDisplayUpdateInterval = 60; // in seconds
    let pinSlider: DigitalPin = DigitalPin.P1;
    let pinCenterButton: DigitalPin = DigitalPin.P2;
    let pinUpButton: DigitalPin = DigitalPin.P9;
    let pinDownButton: DigitalPin = DigitalPin.P16;
    let pinRightButton: DigitalPin = DigitalPin.P8;
    let pinLeftButton: DigitalPin = DigitalPin.P12;
    let counter = 0;
    let lastSliderValue = readSlider(); // used for sliderValueChanged
    let lastJoystickDirection: JoystickDirection = JoystickDirection.NotPressed; // used for joystickDirectionChanged
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

    /* Simple 8x8 font */
    /* TODO: Text Font need to be reworked. */
    let textFont: { [char: string]: number[] } = {
        /* Uppercase letters map */
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
        /* Lowercase letters map */
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
        /* Number map */
        '0': [0b00000000, 0b00111100, 0b01000010, 0b01000110, 0b01001010, 0b01010010, 0b00111100, 0b00000000],
        '1': [0b00000000, 0b00011000, 0b00101000, 0b00001000, 0b00001000, 0b00001000, 0b01111110, 0b00000000],
        '2': [0b00000000, 0b00111100, 0b01000010, 0b00000010, 0b00011100, 0b00100000, 0b01111110, 0b00000000],
        '3': [0b00000000, 0b00111100, 0b01000010, 0b00001100, 0b00000010, 0b01000010, 0b00111100, 0b00000000],
        '4': [0b00000000, 0b00000100, 0b00001100, 0b00010100, 0b00100100, 0b01111110, 0b00000100, 0b00000000],
        '5': [0b00000000, 0b01111110, 0b01000000, 0b01111100, 0b00000010, 0b01000010, 0b00111100, 0b00000000],
        '6': [0b00000000, 0b00111100, 0b01000000, 0b01111100, 0b01000010, 0b01000010, 0b00111100, 0b00000000],
        '7': [0b00000000, 0b01111110, 0b00000010, 0b00000100, 0b00001000, 0b00010000, 0b00100000, 0b00000000],
        '8': [0b00000000, 0b00111100, 0b01000010, 0b00111100, 0b01000010, 0b01000010, 0b00111100, 0b00000000],
        '9': [0b00000000, 0b00111100, 0b01000010, 0b00111110, 0b00000010, 0b01000010, 0b00111100, 0b00000000],
        /* Symbols map */
        '(': [0b00000000, 0b00001100, 0b00010000, 0b00100000, 0b00100000, 0b00010000, 0b00001100, 0b00000000],
        ')': [0b00000000, 0b00110000, 0b00001000, 0b00000100, 0b00000100, 0b00001000, 0b00110000, 0b00000000],
        ':': [0b00000000, 0b00000000, 0b00011000, 0b00011000, 0b00000000, 0b00011000, 0b00011000, 0b00000000],
        ';': [0b00000000, 0b00000000, 0b00011000, 0b00011000, 0b00000000, 0b00011000, 0b00001000, 0b00010000],
        '.': [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00011000, 0b00011000, 0b00000000],
        ',': [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00011000, 0b00001000, 0b00010000],
        '!': [0b00000000, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00000000, 0b00011000, 0b00000000],
        '?': [0b00000000, 0b00111100, 0b01000010, 0b00000100, 0b00001000, 0b00000000, 0b00001000, 0b00000000],
    };

    /* WORD CLOCK */
    let wordClockMappings: { [key: string]: number[][] } = {
        'ONE': [
            [1, 7],
            [4, 7],
            [7, 7]
        ],
        'TWO': [
            [0, 6],
            [1, 6],
            [1, 7]
        ],
        'THREE': [
            [3, 5],
            [4, 5],
            [5, 5],
            [6, 5],
            [7, 5]
        ],
        'FOUR': [
            [0, 7],
            [1, 7],
            [2, 7],
            [3, 7]
        ],
        'HOUR_FIVE': [
            [0, 4],
            [1, 4],
            [2, 4],
            [3, 4]
        ],
        'MIN_FIVE': [
            [4, 2],
            [5, 2],
            [6, 2],
            [7, 2]
        ],
        'SIX': [
            [0, 5],
            [1, 5],
            [2, 5]
        ],
        'SEVEN': [
            [0, 5],
            [4, 6],
            [5, 6],
            [6, 6],
            [7, 6]
        ],
        'EIGHT': [
            [3, 4],
            [4, 4],
            [5, 4],
            [6, 4],
            [7, 4]
        ],
        'NINE': [
            [4, 7],
            [5, 7],
            [6, 7],
            [7, 7]
        ],
        'HOUR_TEN': [
            [7, 4],
            [7, 5],
            [7, 6]
        ],
        'MIN_TEN': [
            [2, 0],
            [4, 0],
            [5, 0]
        ],
        'ELEVEN': [
            [2, 6],
            [3, 6],
            [4, 6],
            [5, 6],
            [6, 6],
            [7, 6]
        ],
        'TWELVE': [
            [0, 6],
            [1, 6],
            [2, 6],
            [3, 6],
            [5, 6],
            [6, 6]
        ],
        'QUARTER': [
            [1, 1],
            [2, 1],
            [3, 1],
            [4, 1],
            [5, 1],
            [6, 1],
            [7, 1]
        ],
        'TWENTY': [
            [2, 0],
            [3, 0],
            [4, 0],
            [5, 0],
            [6, 0],
            [7, 0]
        ],
        'TWENTY_FIVE': [ // currently not used
            [2, 0],
            [3, 0],
            [4, 0],
            [5, 0],
            [6, 0],
            [7, 0],
            [4, 2],
            [5, 2]
            // [6, 2], // Not enough memory to display this word
            // [7, 2]
        ],
        'HALF': [
            [1, 2],
            [2, 2],
            [3, 2],
            [4, 2]
        ],
        'PAST': [
            [2, 3],
            [3, 3],
            [4, 3],
            [5, 3]
        ],
        'TO': [
            [5, 3],
            [6, 3]
        ],
        'ZHAW': [
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3]
        ]
    };

    /* FUNCTIONS */

    function isValidString(input: string): string {
        const allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?():;".split(''); // TODO if problems use let instead of const
        let result = '';

        for (let i = 0; i < input.length; i++) {
            if (allowedChars.indexOf(input[i]) !== -1) {
                result += input[i];
            } else {
                result += ' ';
            }
        }

        return result;
    }

    //% block="set serial debugging prints to $enable"
    //% enable.shadow="toggleOnOff"
    //% advanced=true
    export function debugEnable(enable: boolean): void {
        debugEnabled = enable;
    }

    function serialDebugMsg(message: string): void {
        if (debugEnabled) {
            serial.writeLine(message);
        }
    }

    function getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function linearizeInt(input: number, minInput: number, maxInput: number, lowerOutputRangeLimit: number, upperOutputRangeLimit: number): number {
        /* Calculate the factor of the input value to the allowed range. */
        let factor = (input - minInput) / (maxInput - minInput);
        /* Calculate the scaled value */
        return lowerOutputRangeLimit + factor * (upperOutputRangeLimit - lowerOutputRangeLimit);
    }

    //% blockId="Matrix_Init"
    //% block="initialize NeoPixel matrix with pin $pin and brightness $brightness"
    //% brightness.defl=127 brightness.min=0 brightness.max=255
    //% group="Pixels" weight=120
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

    //% blockId="Matrix_Init_Expert"
    //% block="initialize LED Matrix Interface (Expert). \nSlider pin $pinSliderTemp \nCenter button pin $pinCenterButtonTemp \nUp button pin $pinUpButtonTemp \nDown button pin $pinDownButtonTemp \nRight button pin $pinRightButtonTemp \nLeft button pin $pinLeftButtonTemp"
    //% advanced=true
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

    //% blockId="Matrix_Clear"
    //% block="clear NeoPixel matrix"
    //% group="Pixels" weight=110
    export function clear(): void {
        if (strip) {
            strip.clear();
            strip.show();
        }
    }

    //% blockId="Matrix_Brightness"
    //% block="set Brightness $brightness"
    //% brightness.defl=127 brightness.min=0 brightness.max=255
    //% group="Pixels" weight=109
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

    //% blockId="Matrix_SetPixelColor"
    //% block="set one pixel at x $x y $y to color $color"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% color.shadow="colorNumberPicker"
    //% group="Pixels" weight=108
    export function setOnePixel(x: number, y: number, color: number): void {
        setPixel(x, y, color);
        strip.show();
        serialDebugMsg("setOnePixel: Pixel: " + x + "," + y + " is set to color: " + color);
    }

    //% blockId="Matrix_SetPixelRGB"
    //% block="set one pixel at | x: $x y: $y to RGB colors | R: $R G: $G B: $B"
    //% x.min=0 x.max=7 y.min=0 y.max=7
    //% R.min=0 R.max=255 G.min=0 G.max=255 B.min=0 B.max=255
    //% group="Pixels" weight=107
    //% blockExternalInputs=true
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
    //% group="Input"
    export function readGPIO(pin: DigitalPin): number { // Function not really needed, just for debugging
        let value = pins.analogReadPin(pin);
        serialDebugMsg("readGPIO: GPIO: " + pin + " Value: " + value);
        return value;
    }

    //% block="read slider value"
    //% group="Input"
    export function readSlider(): number {
        return pins.digitalReadPin(pinSlider);
    }

    /* Creates thread to poll slider value and execute callback when value changes. */
    //% block="when slider value changed"
    //% group="Input"
    export function sliderValueChangedThread(callback: () => void): void {
        control.inBackground(() => {
            let currentSliderValue = 0;
            while (true) {
                currentSliderValue = pins.digitalReadPin(pinSlider);
                if (currentSliderValue !== lastSliderValue) {
                    lastSliderValue = currentSliderValue;
                    callback();
                }
                basic.pause(pollingInterval);
            }
        });
    }

    //% block="read joystick direction"
    //% group="Input"
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
    //% group="Input"
    export function readJoystickText(): string {
        if (pins.digitalReadPin(pinCenterButton) == 0) {
            return "Center\n";
        } else if (pins.digitalReadPin(pinUpButton) == 0) {
            return "Up\n";
        } else if (pins.digitalReadPin(pinDownButton) == 0) {
            return "Down\n";
        } else if (pins.digitalReadPin(pinRightButton) == 0) {
            return "Right\n";
        } else if (pins.digitalReadPin(pinLeftButton) == 0) {
            return "Left\n";
        } else {
            return "NotPressed\n";
        }
    }


    /* Creates thread to poll joystick direction and execute callback when direction changes. */
    //% block="when joystick changed"
    //% group="Input"
    export function joystickChangedThread(callback: () => void): void {
        control.inBackground(() => {
            let currentJoystickDirection: JoystickDirection = 0;
            while (true) {
                currentJoystickDirection = readJoystick();
                if (lastJoystickDirection !== currentJoystickDirection) {
                    lastJoystickDirection = currentJoystickDirection;
                    serialDebugMsg("joystickChangedThread: Joystick direction changed to: " + currentJoystickDirection);
                    callback();
                }
                basic.pause(pollingInterval);
            }
        });
    }

    /* Creates thread to poll joystick direction and execute callback when direction changes. */
    /* TODO #BUG when using multiple joystickDirectionThread blocks and the callback function do not finish before executing the other joystickDirectionThread block, microbit crashes. */
    //% block="when joystick direction: %joydirection"
    //% joydirection.defl=JoystickDirection.Center
    //% directionNumber.shadow="text"
    //% group="Input"
    export function joystickDirectionThread(direction: JoystickDirection, callback: () => void): void { //TODO: Check function and remove commented code
        // let direction: JoystickDirection;
        // if (directionString === "notPressed") {
        //     direction = JoystickDirection.NotPressed;
        // } else if (directionString === "center") {
        //     direction = JoystickDirection.Center;
        // } else if (directionString === "up") {
        //     direction = JoystickDirection.Up;
        // } else if (directionString === "down") {
        //     direction = JoystickDirection.Down;
        // } else if (directionString === "right") {
        //     direction = JoystickDirection.Right;
        // } else if (directionString === "left") {
        //     direction = JoystickDirection.Left;
        // } else {
        //     direction = JoystickDirection.Center;
        //     serialDebugMsg("joystickDirectionThread: Error directionString: " + directionString + " is not valid. Setting to Center");
        // }
        serialDebugMsg("joystickDirectionThread: Selected trigger direction: " + direction);
        basic.pause(getRandomInt(1, 100)); // Wait 1 to 100ms to asynchron threads
        control.inBackground(() => {
            let lastJoystickDirectionLocal: JoystickDirection = JoystickDirection.NotPressed; // Local state variable
            let currentJoystickDirection: JoystickDirection = 0;
            while (true) {
                currentJoystickDirection = readJoystick();
                if (lastJoystickDirectionLocal !== currentJoystickDirection && direction === currentJoystickDirection) {
                    serialDebugMsg("joystickDirectionThread: Joystick direction: " + currentJoystickDirection);
                    callback();
                } else {
                    lastJoystickDirectionLocal = currentJoystickDirection;
                }
                basic.pause(pollingInterval);
            }
        });
    }

    /**
     */
    //% blockId="Image_8x8"
    //% block="Image 8x8"
    //% imageLiteral=1
    //% imageLiteralColumns=8
    //% imageLiteralRows=8
    //% shim=images::createImage
    //% group="Pixels" weight=90
    export function matrix8x8(i: string): Image {
        im = <Image><any>i;
        return im
    }

    //% blockId="Image_Show"
    //% block="show image on NeoPixel matrix $image with color $color"
    //% image.shadow="Image_8x8"
    //% color.shadow="colorNumberPicker"
    //% group="Pixels"
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

    //% blockId="Image_ShowMoving"
    //% block="show moving image on NeoPixel matrix $image with color $color and speed $speed in direction $direction"
    //% image.shadow="Image_8x8"
    //% color.shadow="colorNumberPicker"
    //% speed.defl=10 speed.min=1 speed.max=100
    //% direction.defl=Direction.Right
    //% group="Pixels"
    export function movingImage(image: Image, color: number, speed: number, direction: Direction): void {
        /* Due to a bug the block is always generated with speed of 0. In this case we set it to the slowest speed. */
        if (speed < 1) {
            speed = 1; // slowest speed
        } else if (speed > 100) {
            speed = 100; // fastest speed
        } else {
            speed = 100 - speed; // make 100 the fastest speed
        }
        speed = linearizeInt(speed, 1, 100, 1, 1000) // Convert speed to ms

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


    //% block="scroll text $text with color $color and speed $speed"
    //% color.shadow="colorNumberPicker"
    //% speed.defl=10 speed.min=1 speed.max=100
    //% group="Pixels"
    export function scrollText(text: string, color: number, speed: number): void {
        /* Due to a bug the block is always generated with speed of 0. In this case we set it to the slowest speed. */
        if (speed < 1) {
            speed = 1; // slowest speed
        } else if (speed > 100) {
            speed = 100; // fastest speed
        } else {
            speed = 100 - speed; // make 100 the fastest speed
        }
        speed = linearizeInt(speed, 1, 100, 1, 1000) // Convert speed to ms

        if (text.length > 255) {
            text = text.substr(0, 255);
            serialDebugMsg("scrollText: Text is to long, anything longer than 255 is cut off. \n");
        }
        text = isValidString(text); // validate text to only contains allowed symbols
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

        /* Create binary array of each */
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
            } else {
                serialDebugMsg("getTextArray: Error getting char Data");
                finalResult = [[0], [0]];
            }
        }
        //serialDebugMsg("getTextArray: Centering Result");
        try {
            finalResult = result[0].map((_, columnIndex) => result.map(rows => rows[columnIndex]));
        } catch (err) {
            serialDebugMsg("getTextArray: Error transposing final matrix")
        }

        /* Clear arrays to free memory (garbage collector can reclaim memory) */
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

        // serialDebugMsg("sleepUntil: Current time: " + currentTime + " ms Target time: " + targetTime + " ms Delay: " + delay + " ms");

        if (delay <= 0) {
            /* If the target time is in the past or now, call the callback immediately. */
        } else {
            basic.pause(delay);
        }
    }

    /* Function to calculate the current time, needs to be run in the background. */
    function calculateCurrentTime(): void {
        /* Calculate the next wake-up time. */
        let nextWakeUpTime = startTime + timeUpdateInterval * 1000 * timeUpdateIntervalCounter;

        /* Sleep until the next wake-up time. */
        sleepUntil(nextWakeUpTime);
        if (!isUpdatingTime) { // Mutex to prevent updating time while it is being calculated
            isUpdatingTime = true;
            currentTimeSeconds = currentTimeSeconds + timeUpdateInterval + missedTimeUpdates;
            if (currentTimeSeconds >= 86400) {
                currentTimeSeconds = 0;
            }
            // serialDebugMsg("calculateCurrentTime: currentTimeSeconds = " + currentTimeSeconds);
            isUpdatingTime = false;
            missedTimeUpdates = 0;
        } else {
            missedTimeUpdates++;
            serialDebugMsg("calculateCurrentTime: Time is being updated, trying again later. Missed updates: " + missedTimeUpdates);
            return;
        }
        timeUpdateIntervalCounter++;
    }

    //% block="get current time"
    //% group="Clock"
    export function getCurrentTime(): number {
        let currentTimeSecondsLocal = 0;
        if (!isUpdatingTime) { // Mutex to prevent reading time while it is being calculated
            isUpdatingTime = true;
            currentTimeSecondsLocal = currentTimeSeconds;
            isUpdatingTime = false;
        } else {
            serialDebugMsg("getCurrentTime: Time is being updated, please try again later.");
        }
        return currentTimeSecondsLocal;
    }

    //% block="get current time as text"
    //% group="Clock"
    export function getCurrentTimeAsText(): string {
        let currentTimeSecondsLocal = 0;
        if (!isUpdatingTime) { // Mutex to prevent reading time while it is being calculated
            isUpdatingTime = true;
            currentTimeSecondsLocal = currentTimeSeconds;
            isUpdatingTime = false;
        } else {
            serialDebugMsg("getCurrentTimeAsText: Time is being updated, please try again later.");
        }
        let hours = Math.floor(currentTimeSecondsLocal / 3600) % 24;
        let minutes = Math.floor((currentTimeSecondsLocal % 3600) / 60);
        let seconds = currentTimeSecondsLocal % 60;

        /* return the time as a 2D array of numbers. */
        // return [
        //     [hours],
        //     [minutes],
        //     [seconds]
        // ];
        return `${hours}:${minutes}:${seconds}`; // return the time as a string
    }

    /* TODO Bug in block no slider for setting time, only works with variables. */
    //% block="set current time to $hours:$minutes:$seconds"
    //% hours.min=0 hours.max=23
    //% minutes.min = 0 minutes.max = 59
    //% seconds.min = 0 seconds.max = 59
    //% group="Clock"
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
                /* Calculate the curet time in seconds. */
                // serialDebugMsg(`setCurrentTime: Current time is ${currentTimeSeconds}`);
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

    class WordClock {
        private _matrix: any;
        public hourColor: number;
        public minuteColor: number;
        public wordColor: number;
        public brightness: number;

        constructor(version: number = 1, hourColor: number, minuteColor: number, wordColor: number) {
            basic.pause(10);
            this.hourColor = hourColor;
            this.minuteColor = minuteColor;
            this.wordColor = wordColor;
            this.brightness = currentBrightness;
            this._matrix = strip;

            if (!this._matrix) {
                serialDebugMsg("WordClock: Error - Matrix (Strip) not initialized");
                return;
            }

            /* DEBUG */
            // serialDebugMsg("WordClock: wordClockMappings = " + JSON.stringify(wordClockMappings));

            this.displayTime();
            serialDebugMsg("WordClock: Word clock initialized");
        }

        private getHourMapping(hour: number): number[][] {
            switch (hour) {
                case 0: return wordClockMappings.TWELVE;
                case 1: return wordClockMappings.ONE;
                case 2: return wordClockMappings.TWO;
                case 3: return wordClockMappings.THREE;
                case 4: return wordClockMappings.FOUR;
                case 5: return wordClockMappings.HOUR_FIVE;
                case 6: return wordClockMappings.SIX;
                case 7: return wordClockMappings.SEVEN;
                case 8: return wordClockMappings.EIGHT;
                case 9: return wordClockMappings.NINE;
                case 10: return wordClockMappings.HOUR_TEN;
                case 11: return wordClockMappings.ELEVEN;
                default:
                    serialDebugMsg("WordClock getHourMapping: Error - Invalid hour");
                    return [];
            }
        }

        private getMinuteMapping(minute: number): number[][] {
            switch (minute) {
                case 0: return [];
                case 5: return wordClockMappings.MIN_FIVE;
                case 10: return wordClockMappings.MIN_TEN;
                case 15: return wordClockMappings.QUARTER;
                case 20: return wordClockMappings.TWENTY;
                case 25: return wordClockMappings.TWENTY.concat(wordClockMappings.MIN_FIVE); // Instead of TWENTY_FIVE we use TWENTY and MIN_FIVE to fix memory issues
                case 30: return wordClockMappings.HALF;
                default:
                    serialDebugMsg("WordClock getMinuteMapping: Error - Invalid minute");
                    return [];
            }
        }

        private setClockPixels(pixels: number[][], color: number): void {
            for (let i = 0; i < pixels.length; i++) {
                const x = pixels[i][0];
                const y = pixels[i][1];
                setPixel(x, y, color);
                //serialDebugMsg("WordClock: setClockPixels: Set pixel(" + x + "," + y + ") to color: " + color);
            }
        }

        public displayTime(): void {
            this._matrix.clear();
            const currentTimeSecondsLocal = getCurrentTime();
            let hours = Math.floor((currentTimeSecondsLocal / 3600) % 12);  // ensure hours are between 0 and 11 and are whole numbers
            let minutes = Math.floor((currentTimeSecondsLocal / 60) % 60); // ensure minutes are between 0 and 59 and are whole numbers
            serialDebugMsg("WordClock: hours = " + hours + ", minutes = " + minutes);

            /* Adjust hours and minutes if minutes are more than 60 or less than 0 */
            if (minutes >= 60) {
                minutes -= 60;
                hours = Math.floor((hours + 1) % 12);
            } else if (minutes < 0) {
                minutes += 60;
                hours = Math.floor((hours + 11) % 12);
            }

            // /* for testing the word clock jumping the time, set wordclock update interval to 1 second */
            // if (minutes + 2 >= 60) {
            //     setCurrentTime((hours + 0.02) % 24, minutes % 60, 0);
            // } else {
            //     setCurrentTime(hours % 24, (minutes + 2) % 60, 0);
            // }

            /* Calculate the modifier (past/to) and adjust the hours and minutes accordingly. */
            let modifierMapping: number[][];
            if (minutes > 32) {
                hours = Math.floor((hours + 1) % 12);
                minutes = 60 - minutes;
                modifierMapping = wordClockMappings.TO;
            } else {
                modifierMapping = wordClockMappings.PAST;
            }
            minutes = 5 * Math.round(minutes / 5); // we only display minutes with a resolution of 5 minute
            // serialDebugMsg("WordClock: after conversion, hours = " + hours + ", minutes = " + minutes);

            let hoursMapping = this.getHourMapping(hours);
            if (!Array.isArray(hoursMapping) || !hoursMapping.every((item: [number, number]) => Array.isArray(item) && item.length === 2)) {
                serialDebugMsg("WordClock: Error - mapping hours returned not a valid array of tuples");
                serialDebugMsg("WordClock: Mapped hours = " + JSON.stringify(hoursMapping));
            } else {
                /* Set pixels for hours */
                this.setClockPixels(hoursMapping, this.hourColor);
            }

            /* Set pixels for hours */
            this.setClockPixels(hoursMapping, this.hourColor);
            hoursMapping = null; // free memory

            if (minutes !== 0) {
                /* Set pixels for minutes */
                let minutesMapping = this.getMinuteMapping(minutes);
                if (Array.isArray(minutesMapping) && minutesMapping.every((item: [number, number]) => Array.isArray(item) && item.length === 2)) {
                    this.setClockPixels(minutesMapping as number[][], this.minuteColor);
                } else {
                    serialDebugMsg("WordClock: Error - mapping minutes returned not a valid array of tuples");
                    serialDebugMsg("WordClock: Mapped minutes = " + JSON.stringify(minutesMapping));
                }
                minutesMapping = null; // free memory

                /* Set pixels for modifier */
                if (Array.isArray(modifierMapping) && modifierMapping.every((item: [number, number]) => Array.isArray(item) && item.length === 2)) {
                    this.setClockPixels(modifierMapping, this.wordColor);
                } else {
                    serialDebugMsg("WordClock: Error - mapping modifier returned not a valid array of tuples");
                    serialDebugMsg("WordClock: Mapped modifier = " + JSON.stringify(modifierMapping));
                }
                modifierMapping = null; // free memory
            }
            this._matrix.setBrightness(this.brightness);
            this._matrix.show();
        }

        public setTime(): void {
            const joystickDirection: JoystickDirection = readJoystick();
            /* If the joystick is not pressed, do nothing */
            if (joystickDirection == JoystickDirection.NotPressed) {
                return;
            }
            const currentTimeSecondsLocal = getCurrentTime();
            const hours = Math.floor((currentTimeSecondsLocal / 3600) % 12);  // ensure hours are between 0 and 11 and are whole numbers
            const minutes = Math.floor((currentTimeSecondsLocal / 60) % 60);  // ensure minutes are between 0 and 59 and are whole numbers
            switch (joystickDirection) {
                case JoystickDirection.Up:
                    /* Increase hours by 1 */
                    setCurrentTime((hours + 1) % 12, minutes, 0);
                    break;
                case JoystickDirection.Down:
                    /* Decrease hours by 1 */
                    setCurrentTime((hours + 11) % 12, minutes, 0);
                    break;
                case JoystickDirection.Right:
                    /* Increase minutes by 5 */
                    setCurrentTime(hours, (minutes + 5) % 60, 0);
                    break;
                case JoystickDirection.Left:
                    /* Decrease minutes by 5 */
                    setCurrentTime(hours, (minutes + 55) % 60, 0);
                    break;
                default:
                    break;
            }

            /* Display the new time */
            this.displayTime();
        }
    }

    /* Not if this block is used with the control.inBackground block, it will not work #BUG */
    //% block="create word clock version $version hour color $hourColor minute color $minuteColor word color $wordColor"
    //% version.defl=eMatrixVersion.V1
    //% hourColor.shadow="colorNumberPicker"
    //% minuteColor.shadow="colorNumberPicker"
    //% wordColor.shadow="colorNumberPicker"
    //% group="Clock"
    export function createWordClock(version: eMatrixVersion, hourColor: number, minuteColor: number, wordColor: number): void {
        const wordClock = new WordClock(version, hourColor, minuteColor, wordColor);
        basic.pause(100);
        if (!wordClock) {
            serialDebugMsg("createWordClock: Error - WordClock object is not initialized");
        } else {
            serialDebugMsg("createWordClock: WordClock object initialized successfully");
        }

        /* Mutex to prevent multiple threads from running at the same time */
        let lock = false;

        control.inBackground(() => {
            while (true) {
                if (!lock) {
                    lock = true;
                    try {
                        wordClock.displayTime();
                    } catch (e) {
                        serialDebugMsg("createWordClock: Error in word clock");
                    } finally {
                        lock = false;
                    }
                    /* Wait to refresh the display */
                    basic.pause(wordClockDisplayUpdateInterval * 1000);
                }
                basic.pause(10); // Small delay to prevent tight loop
            }
        });

        control.inBackground(() => {
            while (true) {
                if (!lock) {
                    lock = true;
                    try {
                        wordClock.setTime();
                    } catch (e) {
                        serialDebugMsg("createWordClock: Error in setTime");
                    } finally {
                        lock = false;
                    }
                    /* Poll the joystick every 100ms */
                    basic.pause(1000);
                }
                basic.pause(10); // Small delay to prevent tight loop
            }
        });
    }

    //% block="Test LED matrix hardware"
    //% advanced=true
    export function testLedMatrixHW(): void {
        let oldBrightness: number = currentBrightness

        /* Test LED Matrix */
        basic.showString("LED TEST");
        // scrollText("LED TEST", neopixel.colors(NeoPixelColors.White), 90);
        serialDebugMsg("testLedMatrix: Start testing LED matrix pixels");
        let colorRed = neopixel.rgb(255, 0, 0);
        let colorGreen = neopixel.rgb(0, 255, 0);
        let colorBlue = neopixel.rgb(0, 0, 255);
        setBrightness(255);
        clear();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                setPixel(x, y, colorGreen);
            }
        }
        strip.show();
        basic.pause(2000);
        clear();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                setPixel(x, y, colorRed);
            }
        }
        strip.show();
        basic.pause(2000);
        clear();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                setPixel(x, y, colorBlue);
            }
        }
        strip.show();
        basic.pause(2000);
        clear();
        setBrightness(oldBrightness);
        serialDebugMsg("testLedMatrix: Finished testing LED matrix pixels");

        /* Test Slider */
        basic.showString("MOVE SLIDER");
        // scrollText("MOVE SLIDER", neopixel.colors(NeoPixelColors.White), 90);
        serialDebugMsg("testLedMatrix: Start testing LED matrix slider");
        /* Set the first pixel to blue during the test. */
        setPixel(0, 0, colorBlue);
        strip.show();
        while (0 !== readSlider()) {
            basic.pause(pollingInterval);
        }
        while (1 !== readSlider()) {
            basic.pause(pollingInterval);
        }
        while (0 !== readSlider()) {
            basic.pause(pollingInterval);
        }
        /* Set the first pixel to green when the test passed. */
        setPixel(0, 0, colorGreen);
        strip.show();
        serialDebugMsg("testLedMatrix: Slider Works");
        // basic.showString("SLIDER OK");
        // scrollText("SLIDER OK", neopixel.colors(NeoPixelColors.White), 90);

        /* Test Joystick */
        basic.showString("MOVE JOYSTICK");
        // scrollText("MOVE JOYSTICK", neopixel.colors(NeoPixelColors.White), 90);
        serialDebugMsg("testLedMatrix: Start testing LED matrix joystick");
        /* Set the first pixel to blue during the test. */
        setPixel(0, 0, colorBlue);
        strip.show();
        while (0 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick NotPressed works");
        while (1 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Center works");
        while (2 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Up works");
        while (3 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Down works");
        while (4 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Right works");
        while (5 !== readJoystick()) {
            basic.pause(pollingInterval);
        }
        serialDebugMsg("testLedMatrix: Joystick Left works");
        /* Set the first pixel to green when the test passed. */
        setPixel(0, 0, colorGreen);
        strip.show();
        // basic.showString("JOYSTICK OK");
        // scrollText("JOYSTICK OK", neopixel.colors(NeoPixelColors.White), 90);

        serialDebugMsg("testLedMatrix: Finished testing LED matrix");
        basic.showString("ALL OK");
        clear();
        scrollText("ALL OK", neopixel.colors(NeoPixelColors.White), 90);
    }

    class SnakeGame {
        private _matrix: any;
        private snake: number[][] = [[3, 3]]; // Initial position of the snake
        private direction: JoystickDirection = JoystickDirection.Right;
        private food: number[] = [2, 2]; // Initial position of the food
        private gameInterval: number = 500; // Game update interval in milliseconds
        private isGameOver: boolean = false;
        private score: number = 0; // Score

        constructor() {
            this._matrix = strip;
            this.initializeMatrix();
            this.generateFood();
            this.drawSnake();
            this.drawFood();
            this._matrix.show();
            this.startGameLoop();
            this.handleUserInput();
        }

        private initializeMatrix(): void {
            this._matrix.setBrightness(currentBrightness);
            this._matrix.clear();
            this._matrix.show();
        }

        private setPixel(x: number, y: number, color: number): void {
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                this._matrix.setPixelColor(y * 8 + x, color);
            }
        }

        private drawSnake(): void {
            for (let segment of this.snake) {
                this.setPixel(segment[0], segment[1], neopixel.colors(NeoPixelColors.Green));
            }
        }

        private drawFood(): void {
            this.setPixel(this.food[0], this.food[1], neopixel.colors(NeoPixelColors.Red));
        }

        private generateFood(): void {
            let x: number;
            let y: number;
            do {
                x = Math.randomRange(0, 7);
                y = Math.randomRange(0, 7);
            } while (this.snake.some(segment => segment[0] === x && segment[1] === y));
            this.food = [x, y];
        }

        private updateSnake(): void {
            let head = this.snake[0].slice();
            switch (this.direction) {
                case JoystickDirection.Up:
                    head[1]++;
                    break;
                case JoystickDirection.Down:
                    head[1]--;
                    break;
                case JoystickDirection.Left:
                    head[0]--;
                    break;
                case JoystickDirection.Right:
                    head[0]++;
                    break;
            }

            /* Check for collisions with walls */
            if (head[0] < 0 || head[0] >= 8 || head[1] < 0 || head[1] >= 8) {
                this.gameOver();
                return;
            }

            /* Check for collisions with itself */
            if (this.snake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
                this.gameOver();
                return;
            }

            /* Check for food */
            if (head[0] === this.food[0] && head[1] === this.food[1]) {
                this.snake.unshift(head); // Grow the snake
                this.generateFood();
                this.score++; // Increment the score
                serialDebugMsg("SnakeGame: Score: " + this.score);
            } else {
                this.snake.pop(); // Move the snake
                this.snake.unshift(head);
            }
        }

        private gameOver(): void {
            this.isGameOver = true;
            if (63 >= this.score) {
                //basic.showString("Game Over");
                scrollText("Game Over", neopixel.colors(NeoPixelColors.White), 90);
                scrollText("" + this.score, neopixel.colors(NeoPixelColors.Blue), 85);
            } else {
                scrollText("You Won the Game", neopixel.colors(NeoPixelColors.White), 90);
                movingImage(
                    matrix8x8(`
                        . . . . . . . .
                        # # # # # # # #
                        . # # # # # # .
                        . . # # # # . .
                        . . . # # . . .
                        . . . # # . . .
                        . . . # # . . .
                        . . # # # # . .
                        `),
                    0xffff00,
                    10,
                    Direction.Right
                )
            }
            control.reset();
        }

        private updateGame(): void {
            if (this.isGameOver) return;
            this._matrix.clear();
            this.updateSnake();
            this.drawSnake();
            this.drawFood();
            this._matrix.show();
        }

        private changeDirection(newDirection: JoystickDirection): void {
            if ((this.direction === JoystickDirection.Up && newDirection !== JoystickDirection.Down) ||
                (this.direction === JoystickDirection.Down && newDirection !== JoystickDirection.Up) ||
                (this.direction === JoystickDirection.Left && newDirection !== JoystickDirection.Right) ||
                (this.direction === JoystickDirection.Right && newDirection !== JoystickDirection.Left)) {
                this.direction = newDirection;
            }
        }

        private startGameLoop(): void {
            control.inBackground(() => {
                while (true) {
                    this.updateGame();
                    basic.pause(this.gameInterval);
                }
            });
        }

        private handleUserInput(): void {
            control.inBackground(() => {
                while (true) {
                    const joystickDirection = readJoystick();
                    switch (joystickDirection) {
                        case JoystickDirection.Up:
                        case JoystickDirection.Down:
                        case JoystickDirection.Left:
                        case JoystickDirection.Right:
                            this.changeDirection(joystickDirection);
                            break;
                    }
                    basic.pause(pollingInterval); // Polling interval for joystick input
                }
            });
        }
    }

    //% block="snake game"
    //% subcategory="Games"
    export function snake(): void {
        control.inBackground(() => {
            const snakeGame = new SnakeGame();
            basic.pause(100);
            if (!snakeGame) {
                serialDebugMsg("snake: Error - snakeGame object is not initialized");
            } else {
                serialDebugMsg("snake: snakeGame object initialized successfully");
            }
        });
    }
}
