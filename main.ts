NeoPixelMatrix.sliderValueChanged(function () {
    basic.showNumber(NeoPixelMatrix.readSlider())
    serial.writeValue("slider", NeoPixelMatrix.readSlider())
    NeoPixelMatrix.setCurrentTime(h, m, s)
    serial.writeValue("jostick", NeoPixelMatrix.readJoystick())
    serial.writeString(NeoPixelMatrix.readJoystickText())
})
let s = 0
let m = 0
let h = 0
NeoPixelMatrix.debugEnable(true)
NeoPixelMatrix.initializeMatrix(DigitalPin.P0, 135)
h = 0
m = 0
s = 0
while (true) {
    basic.pause(5000)
    serial.writeLine(NeoPixelMatrix.getCurrentTimeAsText())
}
