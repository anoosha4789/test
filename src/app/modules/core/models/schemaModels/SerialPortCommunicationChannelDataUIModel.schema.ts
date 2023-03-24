export let serialPortChannelSchema = {
  "type": "object",
  "properties": {
    "ComPort": {
      "title": "COM Port",
      "description": "COM Port",
      "type": "integer"
    },
    "IdCommConfig": {
      "type": "integer"
    },
    "BaudRate": {
      "title": "Baud Rate",
      "description": "Baud Rate",
      "type": "integer"
    },
    "Description": {
      "type": [
        "string",
        "null"
      ]
    },
    "DataBits": {
      "title": "Data Bits",
      "description": "Data Bits",
      "type": "integer"
    },
    "channelType": {
      "type": "integer",
      "enum": [
        0,
        1
      ]
    },
    "StopBits": {
      "title": "Stop Bits",
      "description": "Stop Bits",
      "type": "integer"
    },
    "TimeoutInMs": {
      "title": "Modbus Timeout",
      "description": "Modbus Timeout (ms)",
      "type": "integer",
      "minimum": 0.0,
      "maximum": 10000.0
    },
    "Parity": {
      "title": "Parity",
      "description": "Parity",
      "type": "integer"
    },
    "Retries": {
      "type": "integer"
    },
    "PortNamePath": {
      "title": "PortName Path",
      "description": "PortName Path",
      "type": [
        "string",
        "null"
      ]
    },
    "PollRateInMs": {
      "title": "Poll Rate",
      "description": "Poll Rate (ms)",
      "type": "integer",
      "minimum": 100.0,
      "maximum": 60000.0
    },
    "SupportSoftwareFlowControl": {
      "title": "Support Software FlowControl",
      "description": "Support Software FlowControl",
      "type": "boolean"
    },
    "Protocol": {
      "type": "integer",
      "enum": [
        0,
        1,
        2
      ]
    },
    "FlowControlTimeIntervalInMs": {
      "title": "FlowControl TimeInterval InMs",
      "description": "FlowControl TimeInterval InMs",
      "type": "integer"
    },
    "SinglePollRateMode": {
      "type": "boolean"
    },
    "Id": {
      "type": "integer"
    },
    "Purpose": {
      "type": "integer",
      "enum": [
        1,
        2,
        3
      ]
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
    "SinglePollRateMode",
    "Purpose"
  ]
}


