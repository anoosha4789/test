export let publishingDataModelSchema = {
  "definitions": {
    "CommunicationChannelDataModel": {
      "type": [
        "object",
        "null"
      ],
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
    "CommunicationChannelDataUIModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "IdCommConfig": {
          "type": "integer"
        },
        "Description": {
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
        "TimeoutInMs": {
          "title": "Modbus Timeout (ms)",
          "description": "Modbus Timeout (ms)",
          "type": "integer",
          "minimum": 0.0,
          "maximum": 10000.0
        },
        "Retries": {
          "type": "integer"
        },
        "PollRateInMs": {
          "title": "Poll Rate (ms)",
          "description": "Poll Rate (ms)",
          "type": "integer",
          "minimum": 100.0,
          "maximum": 60000.0
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
        },
        "Purpose": {
          "type": "integer",
          "enum": [
            0,
            1,
            2,
            3
          ]
        }
      },
      "required": [
        "IdCommConfig",
        "channelType",
        "TimeoutInMs",
        "Retries",
        "PollRateInMs",
        "Protocol",
        "SinglePollRateMode",
        "Purpose"
      ]
    },
    "DataPointModbusRegisterConfigurationModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "StartRegisterAddress": {
          "type": "integer"
        },
        "DeviceId": {
          "type": "integer"
        },
        "DataPointIndex": {
          "type": "integer"
        },
        "SlaveDataType": {
          "type": "integer",
          "enum": [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10
          ]
        },
        "ConversionFormat": {
          "type": "integer",
          "enum": [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18
          ]
        },
        "UnitSymbol": {
          "type": [
            "string",
            "null"
          ]
        },
        "TagName": {
          "type": [
            "string",
            "null"
          ]
        },
        "ReadWriteFlag": {
          "type": "integer",
          "enum": [
            1,
            2,
            3
          ]
        }
      }
    },
    "ModbusConfigurationModelsUI": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "Configurations": {
          "type": [
            "object",
            "null"
          ],
          "additionalProperties": {
            "$ref": "#/definitions/ModbusConfigurationModelUI2"
          }
        }
      }
    },
    "ModbusConfigurationModelUI2": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "SlaveId": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 254.0
        },
        "Channel": {
          "$ref": "#/definitions/CommunicationChannelDataModel"
        },
        "Serial": {
          "$ref": "#/definitions/SerialPortCommunicationChannelDataModel"
        },
        "Tcp": {
          "$ref": "#/definitions/TcpIpCommunicationChannelDataModel"
        },
        "ModbusDeviceMap": {
          "type": [
            "object",
            "null"
          ],
          "additionalProperties": {
            "$ref": "#/definitions/ModbusDeviceConfigurationModel"
          }
        },
        "UnitSystem": {
          "type": [
            "string",
            "null"
          ]
        },
        "IsForModbusMaster": {
          "type": "boolean"
        },
        "Endianness": {
          "type": "integer"
        },
        "IsBytesSwapped": {
          "type": "integer"
        },
        "RegisteredModbusMapId": {
          "type": "integer"
        },
        "ModbusConfigurationId": {
          "type": "integer"
        },
        "MapType": {
          "type": [
            "string",
            "null"
          ]
        },
        "ConnectionTo": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "ModbusDeviceConfigurationModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "SlaveId": {
          "type": "integer"
        },
        "ModbusSlaveRegisterMap": {
          "type": [
            "object",
            "null"
          ],
          "additionalProperties": {
            "type": [
              "array",
              "null"
            ],
            "items": {
              "$ref": "#/definitions/DataPointModbusRegisterConfigurationModel"
            }
          }
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
      },
      "required": [
        "ComPort",
        "IdCommConfig",
        "BaudRate",
        "DataBits",
        "channelType",
        "StopBits",
        "TimeoutInMs",
        "Parity",
        "Retries",
        "PollRateInMs",
        "Protocol",
        "SinglePollRateMode"
      ]
    },
    "TcpIpCommunicationChannelDataModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "IpAddress": {
          "type": "string"
        },
        "channelType": {
          "type": "integer",
          "enum": [
            0,
            1
          ]
        },
        "IpPortNumber": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 65535.0
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
      },
      "required": [
        "IpAddress",
        "IpPortNumber"
      ]
    }
  },
  "type": "object",
  "properties": {
    "Channel": {
      "$ref": "#/definitions/CommunicationChannelDataUIModel"
    },
    "ModbusConfigurations2": {
      "$ref": "#/definitions/ModbusConfigurationModelsUI"
    }
  }
}
