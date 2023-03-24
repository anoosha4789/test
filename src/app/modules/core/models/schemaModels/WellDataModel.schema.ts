export let wellSchema =  {
  "definitions": {
 
    "AbstractZoneDataModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "ZoneId": {
          "type": "integer"
        },
        "ZoneName": {
          "type": "string",
          "minLength": 0,
          "maxLength": 50
        },
        "MeasuredDepth": {
          "type": "number",
          "minimum": 1.0,
          "maximum": 3.4028234663852886E+38
        }
      },
      "required": [
        "ZoneId",
        "ZoneName",
        "MeasuredDepth",
        
      ]
    }
  },
  "type": "object",
  "properties": {
    "WellId": {
      "type": "integer"
    },
    "WellName": {
      "type": "string",
      "minLength": 0,
      "maxLength": 50,
      "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
    },
    "WellType": {
      "type": "integer",
      "enum": [
        1,
        2,
        3
      ]
    },
    "Zones": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/AbstractZoneDataModel"
      }
    }
  },
  "required": [
  
    "WellName",
    "WellType"
  ]
}
