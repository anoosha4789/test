export let zoneSchema =  {
  "definitions": {
    "AbstractToolDataModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "ToolId": {
          "type": "integer"
        },
        "ToolType": {
          "type": "integer",
          "enum": [
            0,
            1,
            2
          ]
        }
      },
      "required": [
        "ToolId",
        "ToolType"
      ]
    }
  },
  "type": "object",
  "properties": {
    "ZoneId": {
      "type": "integer"
    },
    "ZoneName": {
      "type": "string",
      "minLength": 0,
      "maxLength": 50,
      "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
    },
    "MeasuredDepth": {
      "type": "number",
      "minimum": 1.0,
      "maximum": 3.4028234663852886E+38
    }
    
  },
  "required": [
   
    "ZoneName",
    "MeasuredDepth"
  ]
}
