export let multinodePanelConfigSchema = {
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
      }     
    },
    "required": [
      "SerialNumber",
      "CustomerName",
      "FieldName",
    ]
  }
  