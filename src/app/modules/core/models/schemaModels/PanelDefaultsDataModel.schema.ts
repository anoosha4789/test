export let PanelDefaultModelSchema = {
  "type": "object",
  "properties": {
    "HydraulicOutputs": {
      "type": "number",
    },
    "TankLowLevel": {
      "type": "number",
    },
    "MinSupplyPressure": {
      "type": "number",
    },
    "MaxSupplyPressure": {
      "type": "number",
    },
    "MinPumpPressure": {
      "type": "number",
    },
    "MaxPumpPressure": {
      "type": "number",
    },
    "MaxTimeForVentAll": {
      "type": "number",
    },
    "DelayBeforeMeasuringReturns": {
      "type": "integer",
      "minimum": 0.0
    },
    "HPUPassiveModeEnabled": {
      "type": "boolean",
    },
    "HPUPassiveModeTimeout": {
      "type": "integer",
      "minimum": 0.0
    },
    "EnableLinePrePressurization": {
      "type": "boolean",
    },
    "DurationInSecondsToHoldPressure": {
      "type": "integer",
      "minimum": 0.0
    },
    "TimeIntervalInHoursToApplyPrePressurizationAgain": {
      "type": "integer",
      "minimum": 0.0
    },
    "FlowMeterTransmitterType": {
      "type": "number",
    },
  },
  "required": [
    "DelayBeforeMeasuringReturns",
    "HPUPassiveModeTimeout",
    "DurationInSecondsToHoldPressure",
    "TimeIntervalInHoursToApplyPrePressurizationAgain"
  ]
}

export let AlarmsAndLimitsModelSchema = {
  "type": "object",
  "properties": {
    "StartPumpPressure": {
      "type": "number",
    },
    "StopPumpPressure": {
      "type": "number",
    },
    "HighPumpPressure": {
      "type": "number",
    },
    "HighOutputXPressure": {
      "type": "number",
    },
    "HighSupplyPressure": {
      "type": "number",
    },
    "LowReservoirLevel": {
      "type": "number",
    },
  },
  "required": [
    "StartPumpPressure",
    "StopPumpPressure",
    "HighPumpPressure",
    "HighOutputXPressure",
    "HighSupplyPressure",
    "LowReservoirLevel",
  ]
}
