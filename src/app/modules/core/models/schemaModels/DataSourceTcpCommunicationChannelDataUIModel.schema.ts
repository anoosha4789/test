export let dataSourceTcpIpChannelSchema = {
  "type": "object",
  "properties": {
    "ComPort": {
      "type": "integer"
    },
    "IdCommConfig": {
      "type": "integer"
    },
    "IpAddress": {
      "title": "Ip Address",
      "type": "string"
    },
    "IpPortNumber": {
      "title": "Port Number",
      "type": "integer",
      "minimum": 1.0,
      "maximum": 65535.0
    },
    "BaudRate": {
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
      "type": "integer"
    },
    "TimeoutInMs": {
      "title": "Modbus Timeout",
      "type": "integer",
      "minimum": 0.0,
      "maximum": 10000.0
    },
    "Parity": {
      "title": "Parity",
      "type": "integer"
    },
    "Retries": {
      "type": "integer"
    },
    "PortNamePath": {
      "title": "PortName Path",
      "type": [
        "string",
        "null"
      ]
    },
    "PollRateInMs": {
      "title": "Poll Rate",
      "type": "integer",
      "minimum": 100.0,
      "maximum": 60000.0
    },
    "SupportSoftwareFlowControl": {
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
      "type": "integer"
    },
    "SinglePollRateMode": {
      "type": "boolean"
    },
    "Id": {
      "type": "integer"
    }
  },
  "required": [
    "IpAddress",
    "IpPortNumber",    
    "PollRateInMs",
    "Protocol",
    "SinglePollRateMode",
    "TimeoutInMs"
  ]
}
