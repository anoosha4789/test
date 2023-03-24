import { Injectable } from '@angular/core';
import { InchargeModule } from '../incharge.module';

@Injectable({
  providedIn: InchargeModule
})
export class InchargeService {

  constructor() { }

  public ProcessDownlinkStatusWord(status: number): string {
    // DL_ERR_CODE_SUCCESS 0x0001 // successful downlink command execution
    // DL_ERR_CODE_BUSY 0x0010 // downlink command execution in progress
    // DL_ERR_CODE_ACK_PKT_TIMEOUT 0x8000 // no ack / nack response from FE board
    // DL_ERR_CODE_INVALID_PKT_TYPE_RCVD 0x8001 // Preamble mismatch, instead of ack packet, regular packet received
    // DL_ERR_CODE_ACK_PKT_TOOL_ID_PARITY_MISMATCH 0x8002 // Tool Id Parity Mismatch
    // DL_ERR_CODE_ACK_PKT_CMD_ID_PARITY_MISMATCH 0x8003 // Cmd Id Parity mismatch
    // DL_ERR_CODE_ACK_PKT_ERR_CODE_PARITY_MISMATCH 0x8004 // Error code parity mismatch
    // DL_ERR_CODE_ACK_PKT_INVALID_TOOL_ID 0x8005 // not the tool id which is expected
    // DL_ERR_CODE_ACK_PKT_INVALID_CMD_ID 0x8006 // not the cmd id which is expected
    // DL_ERR_CODE_ACK_PKT_FE_BOARD_PARSE_ERROR 0x8007 // FE board couldn't properly decode packet
    // DL_ERR_CODE_TOO_MANY_PULSES_RCVD 0x8008 //It means regular packet response rcvd, instead of downlink packet
    // DL_ERR_CODE_TOOL_ID_MISMATCH 0x8009 // this usually happens when word 1 and word 3 have different tool ids in downlink command received from
    let retVal = null;
    switch(status) {
      case 1:
        retVal = "Successful downlink command execution";
        break;

      case 16:
        retVal = "Downlink command execution in progress";
        break;

      case 32768:
        retVal = "No acknowledge response from FE board";
        break;

      case 32769:
        retVal = "Preamble mismatch, instead of ack packet, regular packet received";
        break;

      case 32770:
        retVal = "Tool Id Parity Mismatch";
        break;

      case 32771:
        retVal = "Cmd Id Parity mismatch";
        break;

      case 32772:
        retVal = "Error code parity mismatch";
        break;

      case 32773:
        retVal = "Not the tool id which is expected";
        break;

      case 32774:
        retVal = "Not the cmd id which is expected";
        break;

      case 32775:
        retVal = "FE board couldn't properly decode packet";
        break;

      case 32776:
        retVal = "Regular packet response rcvd, instead of downlink packet";
        break;

      case 32777:
        retVal = "Word 1 and Word 3 have different tool ids in downlink command received from surface software";
        break;
    }

    return retVal;
  }
 
  public ProcessPSUErrorCode(errorCode: number): string {
    // #define ERR_CODE_MB_INVALID_ADDR (0x0001) // Invalid Modbus Slave Address
    // #define ERR_CODE_MB_INVALID_PKT_LEN (0x0002) // Invalid Modbus Packet Length
    // #define ERR_CODE_MB_INVALID_CRC (0x0004) // Invalid Modbus Packet CRC
    // #define ERR_CODE_RESERVED_0 (0x0008) // Reserved Code

    // #define ERR_CODE_AD5259_COMM_ERROR (0x0010) //when no ack received from slave in addressing it
    // #define ERR_CODE_RESERVED_2 (0x0020) // Reserved Code
    // #define ERR_CODE_RESERVED_3 (0x0040) // Reserved Code
    // #define ERR_CODE_RESERVED_4 (0x0080) // Reserved Code

    // #define ERR_PS_RAIL_COMM_ERROR (0x0100) //when no ack received from slave in addressing it
    // #define ERR_PS_RAIL_OVER_VOLTAGE (0x0200) // Voltage greater than max voltage ( 20 to 80)
    // #define ERR_PS_RAIL_UNDER_VOLTAGE (0x0400) // Voltage under XXX
    // #define ERR_PS_RAIL_OVER_CURRENT (0x0800) // Current over XXX

    // #define ERR_PS_OUTPUT_OVER_VOLTAGE (0x1000) // Voltage greater than max voltage (35 to 200)
    // #define ERR_PS_OUTPUT_OVER_CURRENT (0x2000) // Current over XXX
    let retVal = "";
    if ((errorCode & 0x0001) > 0) {
      retVal = "Invalid Modbus Slave Address";
    }
    if ((errorCode & 0x0002) > 0) {
      retVal = retVal + "\n Invalid Modbus Packet Length";
    }
    if ((errorCode & 0x0004) > 0) {
      retVal = retVal + "\n Invalid Modbus Packet CRC";
    }
    /*Reserved WORD 
    if ((errorCode & 0x0008) > 0) {
      retVal = retVal + "";
    } */
    if ((errorCode & 0x0010) > 0) {
      retVal = retVal + "\n COM Error: No acknowledgement received from slave";
    }
    /*Reserved WORD if ((errorCode & 0x0020) > 0) {
      retVal = retVal + "";
    }
    if ((errorCode & 0x0040) > 0) {
      retVal = retVal + "";
    }
    if ((errorCode & 0x0080) > 0) {
      retVal = retVal + "";
    }*/
    if ((errorCode & 0x0100) > 0) {
      retVal = retVal + "\n PS RAIL COM Error: No acknowledgement received from slave";
    }
    if ((errorCode & 0x0200) > 0) {
      retVal = retVal + "\n PS RAIL OVER VOLTAGE: Voltage over max limit";
    }
    if ((errorCode & 0x0400) > 0) {
      retVal = retVal + "\n PS RAIL UNDER VOLTAGE: Voltage under min limit";
    }
    if ((errorCode & 0x0800) > 0) {
      retVal = retVal + "\n PS RAIL OVER CURRENT: Current over max limit";
    }
    if ((errorCode & 0x1000) > 0) {
      retVal = retVal + "\n PS_OUTPUT_OVER_VOLTAGE: Voltage over max limit";
    }
    if ((errorCode & 0x2000) > 0) {
      retVal = retVal + "\n PS_OUTPUT_OVER_CURRENT: Current over max limit";
    }

    return retVal;
  }

  public ProcessMotorStausduringActuation(status: number): string {
    return status + `: ` + InChargeToolMotorState[status]?.toString();
  }

  public ProcessMotorStatusEventMessage(eventWord: number): string {
    let retVal = null;
    if ((eventWord & 0b0000000000000001) > 0) {
      retVal = 'Event 1: Total Revs> one - time operation target rev';
    }
    if ((eventWord & 0b0000000000000010) > 0) {
      retVal = retVal + '\n Event 2: Current > LIMI, PWM reduced';
    }
    if ((eventWord & 0b0000000000000100) > 0) {
      retVal = retVal + '\n Event 3: Abs Differential Pressure > PRESS';
    }
    if ((eventWord & 0b0000000000001000) > 0) {
      retVal = retVal + '\n Event 4: Total Milliliters >= MAXML';
    }
    if ((eventWord & 0b0000000000010000) > 0) {
      retVal = retVal + '\n Event 5: Motor Fault';
    }
    if ((eventWord & 0b0000000000100000) > 0) {
      retVal = retVal + '\n Event 6: Serial Command STOP';
    }
    if ((eventWord & 0b0000000001000000) > 0) {
      retVal = retVal + '\n Event 7: Motor Stall, Current> REGI + 200mA, while RPM < Stall RPM';
    }
    if ((eventWord & 0b0000000010000000) > 0) {
      retVal = retVal + '\n Event 8: Wind - down Complete';
    }
    if ((eventWord & 0b0000001000000000) > 0) {
      retVal = retVal + '\n Event 10: Serial Abort Command';
    }
    if ((eventWord & 0b0000010000000000) > 0) {
      retVal = retVal + '\n Event 11: Motor Idle, ready for new command';
    }
    if ((eventWord & 0b0000100000000000) > 0) {
      retVal = retVal + '\n Event 12: Start of a new OPEN process';
    }
    if ((eventWord & 0b0001000000000000) > 0) {
      retVal = retVal + '\n Event 13: Start of a new CLOSE process';
    }
    if ((eventWord & 0b0010000000000000) > 0) {
      retVal = retVal + '\n Event 14: Motor Start Process Complete';
    }
    return retVal;
  }

  public ProcessMotorStatusErrorMessage(errorWord: number): string {
    let retVal = null;
    if ((errorWord & 0b0000000000000001) > 0) {
      retVal = 'Error 1: AD Converter Error';
    }
    if ((errorWord & 0b0000000000000010) > 0) {
      retVal = retVal + '\n Error 2: Motor Fault';
    }
    if ((errorWord & 0b0000000000000100) > 0) {
      retVal = retVal + '\n Error 3: Check Sum Error in FRAM Config Variables';
    }
    if ((errorWord & 0b0000000000001000) > 0) {
      retVal = retVal + '\n Error 4: Motor Start Error';
    }
    if ((errorWord & 0b0000000000010000) > 0) {
      retVal = retVal + '\n Error 5: Serial Port Error';
    }
    if ((errorWord & 0b0000000000100000) > 0) {
      retVal = retVal + '\n Error 6: Unrecognized Command';
    }
    if ((errorWord & 0b0000000001000000) > 0) {
      retVal = retVal + '\n Error 7: TempT Read Error';
    }
    if ((errorWord & 0b0000000010000000) > 0) {
      retVal = retVal + '\n Error 8: Rotation Error';
    }
    if ((errorWord & 0b0000000100000000) > 0) {
      retVal = retVal + '\n Error 9: Limit error';
    }
    return retVal;
  }
}

enum InChargeToolMotorState {
  IDLE = 0,
  OPEN = 1,
  CLOSE = 2,
  WIND_DOWN = 3
}
