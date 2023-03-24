export let tcpChannelSchema = {
  "type": "object",
  "properties": {
    "ComPort": {
      "type": "integer"
    },
    "IdCommConfig": {
      "type": "integer"
    },
    "IpAddress": {
      "type": "string"
    },
    "IpPortNumber": {
      "type": "integer"
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
      "type": "integer"
    },
    "TimeoutInMs": {
      "type": "integer",
      "minimum": 0.0,
      "maximum": 10000.0
    },
    "Parity": {
      "type": "integer"
    },
    "Retries": {
      "type": "integer"
    },
    "PortNamePath": {
      "type": [
        "string",
        "null"
      ]
    },
    "PollRateInMs": {
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
    "IpPortNumber"
  ]
}
