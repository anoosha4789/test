export let errorHandlingSettingsSchema = {
  "type": "object",
  "properties": {
    "BadDataValue": {
      "title": "Decimal Value",
      "description": "Decimal Value",
      "type": "number",
      "minimum": -999999,
      "maximum": 999999
    },
    "BadDataValueInteger": {
      "title": "Integer Value",
      "description": "Integer Value",
      "type": "integer",
      "minimum": -999999,
      "maximum": 999999
    },
    "BadDataValueUnsignedInteger": {
      "title": "Unsigned Integer",
      "description": "Unsigned Integer",
      "type": "integer",
      "minimum": 0.0,
      "maximum": 65535.0
    },
    "BadDataTimeout": {
      "title": "Absent Value Delay (s)",
      "description": "Absent Value Delay (s)",
      "type": "integer",
      "minimum": 0.0,
      "maximum": 3600.0
    }
  },
  "required": [
    "BadDataValue",
    "BadDataValueInteger",
    "BadDataValueUnsignedInteger",
    "BadDataTimeout"
  ]
}
