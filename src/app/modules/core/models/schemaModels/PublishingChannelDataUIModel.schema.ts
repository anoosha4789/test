export let publishingChannelSchema = {
  
    "type": "object",
    "properties": {
      "Channel": {
        "type": "object",
        "properties": {
          "ComPort": {
            "type": "integer"
          },
          "BaudRate": {
            "type": "integer"
          },
          "DataBits": {
            "type": "integer"
          },
          "StopBits": {
            "type": "integer"
          },
          "Parity": {
            "type": "integer"
          },
          "PortNamePath": {
            "type": "string"
          },
          "SupportSoftwareFlowControl": {
            "type": "boolean"
          },
          "FlowControlTimeIntervalInMs": {
            "type": "integer"
          },
          "Id": {
            "type": "integer"
          },
          "IdCommConfig": {
            "type": "integer"
          },
          "Description": {
            "type": "string"
          },
          "channelType": {
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
            "type": "integer"
          },
          "SinglePollRateMode": {
            "type": "boolean"
          },
          "Purpose": {
            "type": "integer"
          }
        },
        "required": [
          "ComPort",
          "BaudRate",
          "DataBits",
          "StopBits",
          "Parity",
          "IdCommConfig",
          "Description",
          "channelType",
          "TimeoutInMs",
          "Retries",
          "PollRateInMs",
          "Protocol",
          "SinglePollRateMode"
        ]
      },
      "ModbusConfigurations2": {
        "type": "object",
        "properties": {
          "Configurations": {
            "type": "object",
            "properties": {
              "1": {
                "type": "object",
                "properties": {
                  "SlaveId": {
                    "type": "integer"
                  },
                  "Channel": {
                    "type": "object",
                    "properties": {
                      "ComPort": {
                        "type": "integer"
                      },
                      "BaudRate": {
                        "type": "integer"
                      },
                      "DataBits": {
                        "type": "integer"
                      },
                      "StopBits": {
                        "type": "integer"
                      },
                      "Parity": {
                        "type": "integer"
                      },
                      "PortNamePath": {
                        "type": "string"
                      },
                      "SupportSoftwareFlowControl": {
                        "type": "boolean"
                      },
                      "FlowControlTimeIntervalInMs": {
                        "type": "integer"
                      },
                      "channelType": {
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
                        "type": "integer"
                      },
                      "SinglePollRateMode": {
                        "type": "boolean"
                      }
                    },
                    "required": [
                      "ComPort",
                      "BaudRate",
                      "DataBits",
                      "StopBits",
                      "Parity",
                      "PortNamePath",
                      "SupportSoftwareFlowControl",
                      "FlowControlTimeIntervalInMs",
                      "channelType",
                      "TimeoutInMs",
                      "Retries",
                      "PollRateInMs",
                      "Protocol",
                      "SinglePollRateMode"
                    ]
                  },
                  "Serial": {
                    "type": "null"
                  },
                  "Tcp": {
                    "type": "null"
                  },
                  "ModbusDeviceMap": {
                    "type": "array",
                    "items": {}
                  },
                  "UnitSystem": {
                    "type": "string"
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
                    "type": "string"
                  },
                  "ConnectionTo": {
                    "type": "string"
                  }
                },
                "required": [
                  "SlaveId",
                  "Channel",
                  "Serial",
                  "Tcp",
                  "ModbusDeviceMap",
                  "UnitSystem",
                  "IsForModbusMaster",
                  "Endianness",
                  "IsBytesSwapped",
                  "RegisteredModbusMapId",
                  "ModbusConfigurationId",
                  "MapType",
                  "ConnectionTo"
                ]
              }
            }
          }
        }
      }
    },
    "required": [
      "Channel",
      "ModbusConfigurations2"
    ]
  
}
