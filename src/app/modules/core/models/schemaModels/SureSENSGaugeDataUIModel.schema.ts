{
  "type": "object",
  "properties": {
    "PressureCoefficientFileName": {
      "type": [
        "string",
        "null"
      ]
    },
    "DeviceId": {
      "type": "integer"
    },
    "TemperatureCoefficientFileName": {
      "type": [
        "string",
        "null"
      ]
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
        -1,
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
      "type": [
        "string",
        "null"
      ]
    },
    "SerialNumber": {
      "type": [
        "string",
        "null"
      ]
    }
  }
}
