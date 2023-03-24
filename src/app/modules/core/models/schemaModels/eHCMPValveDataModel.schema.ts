{
  "definitions": {
    "eHCMPValvePositionDataModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "Index": {
          "type": "integer"
        },
        "Description": {
          "type": "string"
        },
        "ShiftVolume": {
          "type": "number"
        },
        "OpenPercent": {
          "type": "number"
        },
        "InitialPosition": {
          "type": "boolean"
        }
      },
      "required": [
        "Index",
        "Description",
        "ShiftVolume",
        "OpenPercent",
        "InitialPosition"
      ]
    }
  },
  "type": "object",
  "properties": {
    "ValveSize": {
      "type": "integer",
      "enum": [
        0,
        1
      ]
    },
    "Positions": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/eHCMPValvePositionDataModel"
      }
    },
    "FullStokeLength": {
      "type": "number",
      "minimum": 1.0,
      "maximum": 3.4028234663852886E+38
    },
    "DefaultFullShiftVolume": {
      "type": "number",
      "minimum": 1.0,
      "maximum": 3.4028234663852886E+38
    },
    "FullShiftVolume": {
      "type": "number",
      "minimum": 1.0,
      "maximum": 3.4028234663852886E+38
    },
    "ToolId": {
      "type": "integer"
    },
    "ToolType": {
      "type": "integer",
      "enum": [
        0,
        1,
        2
      ]
    }
  },
  "required": [
    "ValveSize",
    "Positions",
    "FullStokeLength",
    "DefaultFullShiftVolume",
    "FullShiftVolume",
    "ToolId",
    "ToolType"
  ]
}
