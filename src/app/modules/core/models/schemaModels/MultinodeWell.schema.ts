export let multinodeWellSchema = {
  "definitions": {
    "efcvDataUIModel": {
      "type": "object",
      "properties": {
        "eFCVName": {
          "type": [
            "string",
            "null"
          ],
          "title": "eFCV Name",
          "maxLength": 50,
          "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
        },
        "eFCVAddress": {
          "title": "eFCV Address",
          "type": "integer"
        },
        "SerialNumber": {
          "title": "Serial Number",
          "type": "integer",
          "maxLength": 50,
          "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
        },
        "MeasuredDepth": {
          "title": "Measured Depth (ft)",
          "type": "number",
          "minimum": 1.0,
          "maximum": 3.4028234663852886E+38
        },
        "UniqueAddress": {
          "title": "Unique Address",
          "type": "integer",
          "maxLength": 50,
          "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
        },
        "MaxVoltage": {
          "title": "Max Voltage (V)",
          "type": "integer",
          "default": 150,
          "minValue": 0,
          "maxValue": 165
        },
        "MaxCurrent": {
          "title": "Max Current (mA)",
          "type": "integer",
          "default": 500,
          "minValue": 0,
          "maxValue": 600
        },
        "TargetVoltage": {
          "title": "Target Voltage (V)",
          "type": "integer",
          "default": 90,
          "minValue": 0,
          "maxValue": 165
        },
        "OverCurrentThreshold": {
          "title": "Over Current Threshold (mA)",
          "type": "integer",
          "default": 0,
          "minValue": 0,
          "maxValue": 700
        },
        "OverCurrentOverride": {
          "title": "Over Current Override",
          "type": "integer",
          "default": 1,
          "minValue": "N/A",
          "maxValue": 'N/A'
        },
        "DutyCycle": {
          "title": "Duty Cycle (%)",
          "type": "integer",
          "default": 0,
          "minValue": 0,
          "maxValue": 100
        },
      },
      "required": [
        "eFCVName",
        "eFCVAddress",
        "SerialNumber",
        "UniqueAddress",
        "MeasuredDepth",
        "MaxVoltage",
        "MaxCurrent",
        "TargetVoltage",
        "OverCurrentThreshold",
        "OverCurrentOverride",
        "DutyCycle"
      ]
    },
  },
  "type": "object",
  "properties": {
    "WellId": {
      "type": "integer"
    },
    "WellName": {
      "type": "string",
      "minLength": 0,
      "maxLength": 50,
      "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
    },
    "WellType": {
      "type": "integer",
      "enum": [
        1,
        2,
        3,
        4
      ]
    },
    "WellDeviceId": {
      "type": "integer"
    },   
  },
  "required": [
      "WellId",
      "WellName",
      "WellType"
  ]
}