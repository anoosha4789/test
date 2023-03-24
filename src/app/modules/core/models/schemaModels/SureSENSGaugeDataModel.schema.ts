export let gaugeSchema = {
  "type": "object",
  "properties": {
    "DeviceId": {
      "type": "integer"
    },
    "Active": {
      "type": "boolean"
    },
    "GaugeType": {
      "type": "integer",
      "enum": [
        0,
        1,
        2,
        5
      ]
    },
    "EspGaugeType": {
      "type": "integer",
      "enum": [
        0,
        1
      ]
    },
    "ToolAddress": {
      "type": "integer"
    },
    "PressureCoefficientFileContent": {
      "type": [
        "array",
        "null"
      ],
      "items": {
        "type": [
          "string",
          "null"
        ]
      }
    },
    "TemperatureCoefficientFileContent": {
      "type": [
        "array",
        "null"
      ],
      "items": {
        "type": [
          "string",
          "null"
        ]
      }
    },
    "Description": {
      "title": "Tool Name",
      "description": "Tool Name",
      "type": [
        "string"
      ],
      "maxLength": 50,
      "pattern": "^[a-zA-Z0-9-_# ]*$"
    },
    "SerialNumber": {
      "title": "Serial Number",
      "description": "Serial Number",
      "type": [
        "string"
      ],
      "maxLength": 50,
      "pattern": "^[a-zA-Z0-9]*$"
    }
  },
  "required": [
    "Description",
    "SerialNumber"
  ]
}
