{
  "definitions": {
    "CommunicationChannelDataModel": {
      "type": "object",
      "properties": {
        "channelType": {
          "type": "integer",
          "enum": [
            0,
            1
          ]
        },
        "TimeoutInMs": {
          "type": "integer"
        },
        "Retries": {
          "type": "integer"
        },
        "PollRateInMs": {
          "type": "integer"
        },
        "Protocol": {
          "type": "integer",
          "enum": [
            0,
            1,
            2
          ]
        },
        "SinglePollRateMode": {
          "type": "boolean"
        }
      }
    },
    "SerialPortCommunicationChannelDataModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "ComPort": {
          "type": "integer"
        },
        "channelType": {
          "type": "integer",
          "enum": [
            0,
            1
          ]
        },
        "BaudRate": {
          "type": "integer"
        },
        "TimeoutInMs": {
          "type": "integer"
        },
        "DataBits": {
          "type": "integer"
        },
        "Retries": {
          "type": "integer"
        },
        "StopBits": {
          "type": "integer"
        },
        "PollRateInMs": {
          "type": "integer"
        },
        "Parity": {
          "type": "integer"
        },
        "Protocol": {
          "type": "integer",
          "enum": [
            0,
            1,
            2
          ]
        },
        "PortNamePath": {
          "type": [
            "string",
            "null"
          ]
        },
        "SinglePollRateMode": {
          "type": "boolean"
        },
        "SupportSoftwareFlowControl": {
          "type": "boolean"
        },
        "FlowControlTimeIntervalInMs": {
          "type": "integer"
        }
      }
    },
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
          ],
          "maxLength": 50,
          "pattern": "^[a-zA-Z0-9-_# ]*$"
        },
        "SerialNumber": {
          "type": [
            "string",
            "null"
          ],
          "maxLength": 50,
          "pattern": "^[a-zA-Z0-9]*$"
        }
      }
    },
    "TcpIpCommunicationChannelDataModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "IpAddress": {
          "type": [
            "string",
            "null"
          ]
        },
        "channelType": {
          "type": "integer",
          "enum": [
            0,
            1
          ]
        },
        "IpPortNumber": {
          "type": "integer"
        },
        "TimeoutInMs": {
          "type": "integer"
        },
        "Retries": {
          "type": "integer"
        },
        "PollRateInMs": {
          "type": "integer"
        },
        "Protocol": {
          "type": "integer",
          "enum": [
            0,
            1,
            2
          ]
        },
        "SinglePollRateMode": {
          "type": "boolean"
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
      "type": "integer",
      "minimum": 1.0,
      "maximum": 247.0
    },
    "Channel": {
      "$ref": "#/definitions/CommunicationChannelDataModel"
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
      "type": "string",
      "maxLength": 50,
      "pattern": "^[a-zA-Z0-9-_# ]*$"
    },
    "Serial": {
      "$ref": "#/definitions/SerialPortCommunicationChannelDataModel"
    },
    "Tcp": {
      "$ref": "#/definitions/TcpIpCommunicationChannelDataModel"
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
    "Channel",
    "Description"
  ]
}
