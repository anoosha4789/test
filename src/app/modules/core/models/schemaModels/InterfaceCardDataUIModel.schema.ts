export let interfaceCardSchema = {
  "definitions": {
    "SureSENSGaugeDataUIModel": {
      "type": [
        "object",
        "null"
      ],
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
          "title": "Tool Name",
          "description": "Tool Name",
          "type": [
            "string",
            "null"
          ],
          "maxLength": 50,
          "pattern": "^[a-zA-Z0-9-_# ]*$"
        },
        "SerialNumber": {
          "title": "Serial Number",
          "description": "Serial Number",
          "type": [
            "string",
            "null"
          ],
          "maxLength": 50,
          "pattern": "^[a-zA-Z0-9]*$"
        }
      }
    }
  },
  "type": "object",
  "properties": {
    "DeviceId": {
      "type": "integer"
    },
    "Active": {
      "type": "boolean"
    },
    "CardAddress": {
      "title": "Card Address",
      "description": "Card Address",
      "type": "integer",
      "minimum": 1.0,
      "maximum": 254.0
    },
    "CommConfigId": {
      "type": "integer"
    },
    "Gauges": {
      "type": [
        "array",
        "null"
      ],
      "items": {
        "$ref": "#/definitions/SureSENSGaugeDataUIModel"
      }
    },
    "CardType": {
      "type": "integer",
      "enum": [
        0,
        1,
        2
      ]
    },
    "Description": {
      "title": "Card Name",
      "description": "Card Name",
      "type": "string",
      "maxLength": 50,
      "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
    },
    "SupportInChargePowerSupplyModule": {
      "type": "boolean"
    },
    "EnableDownlink": {
      "type": "boolean"
    }
  },
  "required": [
    "DeviceId",
    "CardAddress",
    "CommConfigId",
    "CardType",
    "Description"
  ]
}

