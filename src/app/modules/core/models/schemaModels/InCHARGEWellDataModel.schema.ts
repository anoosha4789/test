export let inchargeWellSchema = {
    "definitions": {
      "BaseToolDataModel": {
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
      },
      "BaseZoneDataModel": {
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
            "maxLength": 50,
            "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
          },
          "MeasuredDepth": {
            "type": "number",
            "minimum": 1.0,
            "maximum": 3.4028234663852886E+38
          },
          "ZoneType": {
            "type": "integer",
            "enum": [
              1,
              2
            ]
          },
          "Tools": {
            "type": [
              "array",
              "null"
            ],
            "items": {
              "$ref": "#/definitions/BaseToolDataModel"
            }
          },
          "ZoneDeviceId": {
            "type": "integer"
          }
        },
        "required": [
          "ZoneId",
          "ZoneName",
          "MeasuredDepth",
          "ZoneType",
          "Tools",
          "ZoneDeviceId"
        ]
      }
    },
    "type": "object",
    "properties": {
      "Zones": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/BaseZoneDataModel"
        }
      },
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
      "WellDeviceId": {
        "type": "integer"
      }
    },
    "required": [
      "WellId",
      "WellName",
      "WellType",
      "WellDeviceId"
    ]
  }
  