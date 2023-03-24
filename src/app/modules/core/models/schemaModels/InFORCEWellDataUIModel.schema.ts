export let inforceWellSchema = {
  "definitions": {
    "InFORCEZoneDataUIModel": {
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
        "ValveType": {
          "type": "integer",
          "enum": [
            0,
            1,
            2,
            3
          ]
        },
        "NumberOfPositions": {
          "type": "integer"
        },
        "CurrentPosition": {
          "type": "integer"
        },
        "MeasuredDepth": {
          "type": "number",
          "minimum": 1.0,
          "maximum": 3.4028234663852886E+38
        },
        "TimeBasedShiftDefaults": {
          "$ref": "#/definitions/TimeBasedShiftDefaultsModel"
        },
        "ShiftMethod": {
          "type": ["string", "null"]
        },
        "LineToZoneMapping": {
          "$ref": "#/definitions/LineToZoneMappingModel"
        },
        "ValvePositionsAndReturns": {
          "type": [
            "array",
            "null"
          ],
          "items": {
            "$ref": "#/definitions/ValvePositionsAndReturnsModel"
          }
        },
        "WellId": {
          "type": "integer"
        },
        "ReturnsBasedShiftDefaults": {
          "$ref": "#/definitions/ReturnsBasedShiftDefaultsModel"
        },
        "HcmId": {
          "type": "integer"
        },
        "IsWellLevelShiftDefaultApplied": {
          "type": "boolean"
        },
        "CurrentPositionStateUnknownFlag": {
          "type": "boolean"
        }
      },
      "required": [
        "ZoneId",
        "ZoneName",
        "ValveType",
        "NumberOfPositions",
        "CurrentPosition",
        "MeasuredDepth",
        "WellId",
        "HcmId",
        "IsWellLevelShiftDefaultApplied",
        "CurrentPositionStateUnknownFlag"
      ]
    },
    "LineToZoneMappingModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "ZoneId": {
          "type": "integer"
        },
        "ZoneName": {
          "type": "string"
        },
        "OpenLine": {
          "type": "string"
        },
        "CloseLine": {
          "type": "string"
        },
        "ValveType": {
          "type": "integer",
          "enum": [
            0,
            1,
            2,
            3
          ]
        },
        "Priority": {
          "type": "integer"
        },
        "Enabled": {
          "type": "boolean"
        },
        "Id": {
          "type": "integer"
        }
      },
      "required": [
        "ZoneId",
        "ZoneName",
        "OpenLine",
        "CloseLine",
        "ValveType",
        "Id"
      ]
    },
    "PanelToLineMappingModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "WellId": {
          "type": "integer"
        },
        "PanelConnection": {
          "type": "string"
        },
        "DownholeLine": {
          "type": "string",
          "minLength": 0,
          "maxLength": 50,
          "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
        },
        "PanelToLineMappingsId": {
          "type": "integer"
        }
      },
      "required": [
        "WellId",
        "PanelConnection",
        "DownholeLine",
        "PanelToLineMappingsId"
      ]
    },
    "ReturnsBasedShiftDefaultsModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "ToleranceHigh": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.7976931348623157E+308
        },
        "ToleranceLow": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.7976931348623157E+308
        },
        "IntervalTime": {
          "type": "integer"
        },
        "IntervalCount": {
          "type": "integer"
        },
        "StablizationDeadband": {
          "type": "number"
        },
        "PressureLockTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "VentTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "MinShiftTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "MaxShiftTime": {
          "type": "integer",
          "minimum": 2.0,
          "maximum": 1.7976931348623157E+308
        },
        "IdShiftDefault": {
          "type": [
            "integer",
            "null"
          ]
        },
        "IsToleranceUnitInPercentage": {
          "type": "integer"
        },
        "MinimumReturnsFlowRateForStabilization": {
          "type": "number",
          "minimum": 0.01,
          "maximum": 1.7976931348623157E+308
        },
        "ReturnFlowStabilizationCheckingPeriodInSeconds": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 20.0
        },
        "MinimumResetTime": {
          "type": "integer",
          "minimum": 0.0,
          "maximum": 1.7976931348623157E+308
        }
      },
      "required": [
        "ToleranceHigh",
        "ToleranceLow",
        "PressureLockTime",
        "VentTime",
        "MinShiftTime",
        "MaxShiftTime",
        "IsToleranceUnitInPercentage",
        "MinimumReturnsFlowRateForStabilization",
        "ReturnFlowStabilizationCheckingPeriodInSeconds",
        "MinimumResetTime"
      ]
    },
    "TimeBasedShiftDefaultsModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "PressureLockTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "VentTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "ShiftTime": {
          "type": "integer",
          "minimum": 1.0,
          "maximum": 1.7976931348623157E+308
        },
        "IdShiftDefault": {
          "type": [
            "integer",
            "null"
          ]
        },
        "MinimumResetTime": {
          "type": "integer",
          "minimum": 0.0,
          "maximum": 1.7976931348623157E+308
        }
      },
      "required": [
        "PressureLockTime",
        "VentTime",
        "ShiftTime",
        "MinimumResetTime"
      ]
    },
    "ValvePositionsAndReturnsModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "FromPosition": {
          "type": "integer"
        },
        "ToPosition": {
          "type": "integer"
        },
        "Description": {
          "type": "string",
          "minLength": 0,
          "maxLength": 50
        },
        "ReturnVolume": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.7976931348623157E+308
        },
        "UserSelectable": {
          "type": "boolean"
        },
        "Id": {
          "type": "integer"
        }
      },
      "required": [
        "FromPosition",
        "ToPosition",
        "Description",
        "ReturnVolume",
        "UserSelectable",
        "Id"
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
    "WellDeviceId": {
      "type": "integer"
    },
    "ControlArchitectureId": {
      "type": "integer"
    },
    "NumberOfOutputs": {
      "type": "integer"
    },
    "TimeBasedShiftDefaults": {
      "$ref": "#/definitions/TimeBasedShiftDefaultsModel"
    },
    "ShiftMethod": {
      "type": "string"
    },
    "PanelToLineMappings": {
      "type": [
        "array",
        "null"
      ],
      "items": {
        "$ref": "#/definitions/PanelToLineMappingModel"
      }
    },
    "Zones": {
      "type": [
        "array",
        "null"
      ],
      "items": {
        "$ref": "#/definitions/InFORCEZoneDataUIModel"
      }
    },
    "LineToZoneMapping": {
      "type": [
        "array",
        "null"
      ],
      "items": {
        "$ref": "#/definitions/LineToZoneMappingModel"
      }
    },
    "ReturnsBasedShiftDefaults": {
      "$ref": "#/definitions/ReturnsBasedShiftDefaultsModel"
    },
    "IsPanelLevelShiftDefaultApplied": {
      "type": "boolean"
    }
  },
  "required": [
    "WellId",
    "WellName",
    "WellType",
    "ControlArchitectureId",
    "NumberOfOutputs"
  ]
}
