export let panelConfigurationSchema = {
  "type": "object",
  "properties": {
    "Id": {
      "type": "integer"
    },
    "PanelTypeId": {
      "type": "integer"
    },
    "PanelType": {
      "type": "string"
    },
    "SerialNumber": {
      "type": "string",
      "maxLength": 50
    },
    "WifiSsid": {
      "type": [
        "string",
        "null"
      ]
    },
    "HydraulicOutputs": {
      "type": "integer"
    },
    "InterfaceCardSlots": {
      "type": "integer"
    },
    "CustomerName": {
      "type": "string",
      "maxLength": 50
    },
    "FieldName": {
      "type": "string",
      "maxLength": 50
    },
    "UnitSystemId": {
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
      "type": "number"
    },
    "HPUPassiveModeEnabled": {
      "type": "boolean"
    },
    "HPUPassiveModeTimeout": {
      "type": "integer"
    },
    "EnableLinePrePressurization": {
      "type": "boolean"
    },
    "DurationInSecondsToHoldPressure": {
      "type": "integer"
    },
    "TimeIntervalInHoursToApplyPrePressurizationAgain": {
      "type": "integer"
    },
    "ToggleEnabled": {
      "type": "boolean"
    },
    "ToggleIntervalInSec": {
      "type": "integer",
      "minimum": 1.0,
      "maximum": 2147483647.0
    }
  },
  "required": [
    "PanelType",
    "SerialNumber",
    "CustomerName",
    "FieldName",
    "ToggleIntervalInSec"
  ]
}

