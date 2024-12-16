/* ------------------------------------------------------------------
 * --  _____       ______  _____                                    -
 * -- |_   _|     |  ____|/ ____|                                   -
 * --   | |  _ __ | |__  | (___    Institute of Embedded Systems    -
 * --   | | | '_ \|  __|  \___ \   Zurich University of             -
 * --  _| |_| | | | |____ ____) |  Applied Sciences                 -
 * -- |_____|_| |_|______|_____/   8401 Winterthur, Switzerland     -
 * ------------------------------------------------------------------
 * --
 * -- File:	    enums.ts
 * -- Project:  micro:bit InES Matrix
 * -- Date:	    16.12.2024
 * -- Author:   ebep
 * --
 * ------------------------------------------------------------------
 */

enum eMatrixVersion {
    //% block="V1"
    V1 = 1,
    //% block="V2"
    V2 = 2,
}

enum eJoystickDirection {
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

enum eDirection {
    //% block="right"
    Right = 0,
    //% block="left"
    Left = 1
}
