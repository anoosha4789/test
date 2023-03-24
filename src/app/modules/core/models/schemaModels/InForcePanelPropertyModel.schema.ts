{
  "type": "object",
  "properties": {
    "HydraulicOutputs": {
      "type": "integer"
    },
    "TankLowLevel": {
      "type": "number"
    },
    "MinSupplyPressure": {
      "type": "number"
    },
    "MaxSupplyPressure": {
      "type": "number"
    },
    "MinPumpPressure": {
      "type": "number"
    },
    "MaxPumpPressure": {
      "type": "number"
    },
    "MaxTimeForVentAll": {
      "type": "number"
    },
    "DelayBeforeMeasuringReturns": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.7976931348623157E+308
    },
    "HPUPassiveModeEnabled": {
      "type": "boolean"
    },
    "HPUPassiveModeTimeout": {
      "type": "integer",
      "minimum": 0.0,
      "maximum": 2147483647.0
    },
    "EnableLinePrePressurization": {
      "type": "boolean"
    },
    "DurationInSecondsToHoldPressure": {
      "type": "integer",
      "minimum": 0.0,
      "maximum": 2147483647.0
    },
    "TimeIntervalInHoursToApplyPrePressurizationAgain": {
      "type": "integer",
      "minimum": 0.0,
      "maximum": 2147483647.0
    }
  },
  "required": [
    "HydraulicOutputs",
    "TankLowLevel",
    "MinSupplyPressure",
    "MaxSupplyPressure",
    "MinPumpPressure",
    "MaxPumpPressure",
    "MaxTimeForVentAll",
    "DelayBeforeMeasuringReturns",
    "HPUPassiveModeEnabled",
    "HPUPassiveModeTimeout",
    "EnableLinePrePressurization",
    "DurationInSecondsToHoldPressure",
    "TimeIntervalInHoursToApplyPrePressurizationAgain"
  ]
}
