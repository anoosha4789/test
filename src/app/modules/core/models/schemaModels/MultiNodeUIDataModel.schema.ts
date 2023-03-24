export let timebasedActuateModelSchema = {
    "type": "object",
    "properties": {
      "SIUID": {
        "type": "string"
      },
      "WellId": {
        "type": "string"
      },
      "eFCVId": {
        "type": "string"
      },
      "CurrentPosition": {
        "type": "string"
      },
      "IsTowardsHome": {
        "type": "boolean",
        "default": true
      },
      "ActuationTime": {
        "type": "integer",
        "minimum": 1.0,
        "maximum": 65535000.0
      },
    },
    "required": [
      "SIUID",
      "WellId",
      "eFCVId",
      "CurrentPosition",
      "IsTowardsHome",
      "ActuationTime"
    ]
  }