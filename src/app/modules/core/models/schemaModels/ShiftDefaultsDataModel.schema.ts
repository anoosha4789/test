export let ShiftDefaultModelSchema = {
  "definitions": {
    "ReturnsBasedShiftDefaultsModel": {
      "type": "object",
      "properties": {
        "ToleranceHigh": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.7976931348623157E+308
        },
        "ToleranceLow": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.7976931348623157E+308
        },
        "IntervalTime": {
          "type": "integer"
        },
        "IntervalCount": {
          "type": "integer"
        },
        "StablizationDeadband": {
          "type": "number"
        },
        "PressureLockTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "VentTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "MinShiftTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "MaxShiftTime": {
          "type": "integer",
          "minimum": 2.0,
          "maximum": 1.7976931348623157E+308
        },
        "IdShiftDefault": {
          "type": [
            "integer",
            "null"
          ]
        },
        "IsToleranceUnitInPercentage": {
          "type": "integer"
        },
        "MinimumReturnsFlowRateForStabilization": {
          "type": "number",
          "minimum": 0.01,
          "maximum": 1.7976931348623157E+308
        },
        "ReturnFlowStabilizationCheckingPeriodInSeconds": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 20.0
        },
        "MinimumResetTime": {
          "type": "integer",
          "minimum": 0.0,
          "maximum": 1.7976931348623157E+308
        }
      },
      "required": [
        "ToleranceHigh",
        "ToleranceLow",
        "PressureLockTime",
        "VentTime",
        "MinShiftTime",
        "MaxShiftTime",
        "IsToleranceUnitInPercentage",
        "MinimumReturnsFlowRateForStabilization",
        "ReturnFlowStabilizationCheckingPeriodInSeconds",
        "MinimumResetTime"
      ]
    },
    "TimeBasedShiftDefaultsModel": {
      "type": "object",
      "properties": {
        "PressureLockTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "VentTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "ShiftTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "IdShiftDefault": {
          "type": [
            "integer",
            "null"
          ]
        },
        "MinimumResetTime": {
          "type": "integer",
          "minimum": 0.0,
          "maximum": 1.7976931348623157E+308
        }
      },
      "required": [
        "PressureLockTime",
        "VentTime",
        "ShiftTime",
        "MinimumResetTime"
      ]
    }
  },
  "type": "object",
  "properties": {
    "ShiftMethod": {
      "type": "string"
    },
    "TimeBasedShiftDefaults": {
      "$ref": "#/definitions/TimeBasedShiftDefaultsModel"
    },
    "ReturnsBasedShiftDefaults": {
      "$ref": "#/definitions/ReturnsBasedShiftDefaultsModel"
    }
  },
  "required": [
    "ShiftMethod",
    "TimeBasedShiftDefaults",
    "ReturnsBasedShiftDefaults"
  ]
}
