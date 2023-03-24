export let multinodeTecPowerSupplySchema = {
    "type": "object",
    "properties": {
      "MaxVoltage": {
        "type": "integer",
        "default": 150,
        "minValue": 0,
        "maxValue": 165
      },
      "RampRate": {
        "type": "integer",
        "default": 25,
        "minValue": 0,
        "maxValue": 30
      },
      "MaxCurrent": {
        "type": "integer",
        "default": 250,
        "minValue": 0,
        "maxValue": 600
      },
      "SettleVoltage": {
        "type": "integer",
        "default": 90,
        "minValue": 0,
        "maxValue": 165
      },
      "TargetVoltage": {
        "type": "integer",
        "default": 125,
        "minValue": 0,
        "maxValue": 165
      },
      "SettleRampRate": {
        "type": "integer",
        "default": -10,
        "minValue": -50,
        "maxValue": 0
      },
    },
    "required": [
      "MaxVoltage",
      "RampRate",
      "MaxCurrent",
      "SettleVoltage",
      "TargetVoltage",
      "SettleRampRate"
    ]
  }