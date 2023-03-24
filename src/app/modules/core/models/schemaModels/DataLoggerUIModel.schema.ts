export let dataLoggerSchema = {
    "type": "object",
    "properties": {
      "Name": {
        "type": [
          "string",
          "null"
        ],
        "title": "Data Logger Name",
        "maxLength": 50,
        "pattern": "^[A-Za-z0-9-_# ]+[A-Za-z0-9-_# ]*$"
      },
      "DataLoggerType": {
        "title": "Data Logger Format",
        "type": "integer"
      },
      "ScanRate": {
        "type": "integer"
      },
      "WellId": {
        "type": "integer"
      },
    },
    "required": [
      "Name",
      "DataLoggerType"
    ]
  }