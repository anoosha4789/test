export let suresensPanelConfigSchema = {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer"
      },
      "PanelTypeId": {
        "type": "integer"
      },
      "SerialNumber": {
        "title": "Serial Number",
        "description": "Serial Number",
        "type": "string",
        "maxLength": 50
      },
      "CustomerName": {
        "title": "Customer Name",
        "description": "Customer Name",
        "type": "string",
        "maxLength": 50
      },
      "FieldName": {
        "title": "Field Name",
        "description": "Field Name",
        "type": "string",
        "maxLength": 50
      },
      "ToggleEnabled": {
        "type": "boolean"
      },
      "ToggleIntervalInSec": {
        "title": "Toggle Interval",
        "type": "integer",
        "minimum": 1.0,
        "maximum": 2147483647.0
      }
    },
    "required": [
      "SerialNumber",
      "CustomerName",
      "FieldName",
      "ToggleIntervalInSec"
    ]
  }
  