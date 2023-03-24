export let sureflo298EXModelSchema = {
  "definitions": {
    "AdditionalParameters298Ex": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "MeasuredDepth": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 3.4028234663852886E+38
        },
        "TrueVerticalDepth": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 3.4028234663852886E+38
        },
        "SurfaceWaterCut": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 100.0
        },
        "WaterCutInversion": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 100.0
        },
        "EmulsificationStability": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "RoughnessFactor": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 1.0
        },
        "CoefficientExpansion": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "Deviation": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 90.0
        }
      },
      "required": [
        "MeasuredDepth",
        "TrueVerticalDepth",
        "SurfaceWaterCut",
        "EmulsificationStability",
        "RoughnessFactor",
        "CoefficientExpansion",
        "Deviation"
      ]
    },
    "DataPointDefinitionModel": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "DeviceId": {
          "type": "integer"
        },
        "DataPointIndex": {
          "type": "integer"
        },
        "UnitQuantityType": {
          "type": [
            "string",
            "null"
          ]
        },
        "UnitSymbol": {
          "type": [
            "string",
            "null"
          ]
        },
        "TagName": {
          "type": [
            "string",
            "null"
          ]
        },
        "DataType": {
          "type": "integer",
          "enum": [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10
          ]
        },
        "ReadOnly": {
          "type": "boolean"
        }
      }
    },
    "FilterParameters298Ex": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "PTBufferLeftWeight": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 50.0
        },
        "PTBufferRightWeight": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 50.0
        },
        "PTBufferOrder": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 50.0
        },
        "FlowBufferLeftWeight": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 50.0
        },
        "FlowBufferRightWeight": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 50.0
        },
        "FlowBufferOrder": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 50.0
        },
        "ThresholdLow": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 50.0
        },
        "ThresholdHigh": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 50.0
        }
      },
      "required": [
        "PTBufferLeftWeight",
        "PTBufferRightWeight",
        "PTBufferOrder",
        "FlowBufferLeftWeight",
        "FlowBufferRightWeight",
        "FlowBufferOrder",
        "ThresholdLow",
        "ThresholdHigh"
      ]
    },
    "FlowMeterCalibrationFile": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "UseFile": {
          "type": "boolean"
        },
        "FileName": {
          "type": [
            "string",
            "null"
          ]
        },
        "CalibrationData": {
          "type": [
            "array",
            "null"
          ],
          "items": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      }
    },
    "FlowMeterDimensions298Ex": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "InletDiameter": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "OutletDiameter": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "RemoteDiameter": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "InletTolerance": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 2.0
        },
        "OutletTolerance": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 2.0
        },
        "RemoteTolerance": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 2.0
        },
        "StaticCorrection": {
          "type": "number",
          "minimum": -20.0,
          "maximum": 20.0
        },
        "DensityStaticCorrection": {
          "type": "number",
          "minimum": -20.0,
          "maximum": 20.0
        },
        "ApplyStaticCorrection": {
          "type": "boolean"
        },
        "ApplyDensityStaticCorrection": {
          "type": "boolean"
        },
        "RemotePosition": {
          "type": [
            "string",
            "null"
          ]
        }
      },
      "required": [
        "InletDiameter",
        "OutletDiameter",
        "RemoteDiameter",
        "InletTolerance",
        "OutletTolerance",
        "RemoteTolerance",
        "StaticCorrection",
        "DensityStaticCorrection"
      ]
    },
    "FlowMeterPTMapping298Ex": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "InletPressureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "OutletPressureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "RemotePressureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "InletTemperatureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "OutletTemperatureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "RemoteTemperatureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "UseRemoteGauge": {
          "type": "boolean"
        }
      }
    },
    "FluidPVTData298Ex": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "SpecificGravityOil": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 4.0
        },
        "SpecificGravityGas": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 4.0
        },
        "SpecificGravityWater": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 4.0
        },
        "OilSurfaceViscosity": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "GasOilRatio": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 3.4028234663852886E+38
        },
        "UseCustomOilProperties": {
          "type": "boolean"
        },
        "UseCustomWaterProperties": {
          "type": "boolean"
        },
        "UseCustomGasProperties": {
          "type": "boolean"
        },
        "OilDensityCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "OilViscosityCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "OilVolumeFactorCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "GasOilRatioCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "GasDensityCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "GasViscosityCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "GasVolumeFactorCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "WaterDensityCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "WaterViscosityCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "WaterVolumeFactorCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "CalculateDensity": {
          "type": "boolean"
        },
        "CalculateViscosity": {
          "type": "boolean"
        }
      },
      "required": [
        "SpecificGravityOil",
        "SpecificGravityGas",
        "SpecificGravityWater",
        "OilSurfaceViscosity",
        "GasOilRatio"
      ]
    }
  },
  "type": "object",
  "properties": {
    "flowMeterPTMapping": {
      "$ref": "#/definitions/FlowMeterPTMapping298Ex"
    },
    "flowMeterDimensions": {
      "$ref": "#/definitions/FlowMeterDimensions298Ex"
    },
    "fluidPVTData": {
      "$ref": "#/definitions/FluidPVTData298Ex"
    },
    "additionalParameters": {
      "$ref": "#/definitions/AdditionalParameters298Ex"
    },
    "filterParameters": {
      "$ref": "#/definitions/FilterParameters298Ex"
    },
    "Active": {
      "type": "boolean"
    },
    "Serial": {
      "type": "string"
    },
    "DeviceId": {
      "type": "integer"
    },
    "WellId": {
      "type": "integer"
    },
    "FluidType": {
      "type": "integer",
      "enum": [
        1,
        2,
        3,
        4
      ]
    },
    "Technology": {
      "type": "integer",
      "enum": [
        1,
        2
      ]
    },
    "DeviceName": {
      "type": [
        "string",
        "null"
      ],
      "minLength": 0,
      "maxLength": 50,
      "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
    },
    "CalibrationFileName": {
      "type": "string"
    }
  },
  "required": [
    "Serial",
    "CalibrationFileName"
  ]
}
