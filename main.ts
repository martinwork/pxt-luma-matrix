NeoPixelMatrix.sliderValueChangedThread(function () {
    basic.showNumber(NeoPixelMatrix.readSlider())
    serial.writeValue("slider", NeoPixelMatrix.readSlider())
    NeoPixelMatrix.setCurrentTime(h, m, s)
})
let s = 0
let m = 0
let h = 0
NeoPixelMatrix.debugEnable(true)
NeoPixelMatrix.initializeMatrix(DigitalPin.P0, 135)
NeoPixelMatrix.createWordClock(
1,
0x00ff00,
0x007fff,
0xff0000
)
h = 0
m = 22
s = 55
while (true) {
    basic.pause(5000)
    serial.writeLine(NeoPixelMatrix.getCurrentTimeAsText())
}
