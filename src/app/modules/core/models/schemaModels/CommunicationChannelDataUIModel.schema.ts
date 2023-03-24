export let commChannelSchema = {
  "type": "object",
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
    "IdCommConfig",
    "channelType",
    "TimeoutInMs",
    "Retries",
    "PollRateInMs",
    "Protocol",
    "SinglePollRateMode"
  ]
}
