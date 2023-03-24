export let suresensWellSchema = {
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
          3
        ]
      },
      "WellDeviceId": {
        "type": "integer"
      },
      "ControlArchitectureId": {
        "type": "integer"
      },
      "NumberOfOutputs": {
        "type": "integer"
      }
    },
    "required": [
      "WellId",
      "WellName",
      "WellType"
    ]
  }
  