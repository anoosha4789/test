export let multinodeEfcvPositionSchema = {
  "type": "object",
  "properties": {
    "OPEN": {
      "type": "string",
      "title": "OPEN",
    },
    "STAGE_1": {
      "type": "string",
      "title": "STAGE_1",
    },
    "STAGE_2": {
      "type": "string",
      "title": "STAGE_2",
    },
    "STAGE_3": {
      "type": "string",
      "title": "STAGE_3",
    },
    "STAGE_4": {
      "type": "string",
      "title": "STAGE_4",
    },
    "CLOSED": {
      "type": "string",
      "title": "CLOSED",
    },
  },
  "required": [
    "OPEN",
    "STAGE_1",
    "STAGE_2",
    "STAGE_3",
    "STAGE_4",
    "CLOSED"
  ]
}