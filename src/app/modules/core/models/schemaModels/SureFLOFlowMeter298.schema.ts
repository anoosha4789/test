export let sureflo298ModelSchema = {
  "definitions": {
    "AdditionalParameters": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "Deviation": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 90.0
        },
        "FrictionFactor": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 5.0
        },
        "DeltaThreshold": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 110.0
        },
        "DHWaterCutPercent": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 100.0
        },
        "SurfaceWaterCutPercent": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 100.0
        },
        "ProducedGasGravity": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 4.0
        },
        "CD": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 2.0
        }
      },
      "required": [
        "Deviation",
        "FrictionFactor",
        "DeltaThreshold",
        "DHWaterCutPercent",
        "SurfaceWaterCutPercent",
        "ProducedGasGravity",
        "CD"
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
    "FlowMeterDimensions": {
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
        "ThroatDiameter": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "RemoteDiameter": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "StaticCorrection": {
          "type": "number",
          "minimum": -20.0,
          "maximum": 20.0
        },
        "LengthP1toP3": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 3.4028234663852886E+38
        },
        "RGCPosition": {
          "type": "integer"
        }
      },
      "required": [
        "InletDiameter",
        "ThroatDiameter",
        "RemoteDiameter",
        "StaticCorrection",
        "LengthP1toP3"
      ]
    },
    "FlowMeterPTMapping": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "InletPressureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "ThroatPressureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "RemotePressureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "TemperatureSource": {
          "$ref": "#/definitions/DataPointDefinitionModel"
        },
        "UseRemoteGauge": {
          "type": "boolean"
        }
      }
    },
    "FluidPVTData": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "OilFVF": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "OilDensity": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 100.0
        },
        "OilViscosity": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "WaterFVF": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "WaterDensity": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 100.0
        },
        "WaterViscosity": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 10.0
        },
        "SolutionGOR": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 3.4028234663852886E+38
        },
        "UseCustomWaterProperties": {
          "type": "boolean"
        },
        "WaterSpecificGravity": {
          "type": "number",
          "minimum": 0.0,
          "maximum": 4.0
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
        "WaterDensityCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "WaterViscosityCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        },
        "WaterVolumeFactorCalibration": {
          "$ref": "#/definitions/FlowMeterCalibrationFile"
        }
      },
      "required": [
        "OilFVF",
        "OilDensity",
        "OilViscosity",
        "WaterFVF",
        "WaterDensity",
        "WaterViscosity",
        "SolutionGOR",
        "WaterSpecificGravity"
      ]
    }
  },
  "type": "object",
  "properties": {
    "flowMeterPTMapping": {
      "$ref": "#/definitions/FlowMeterPTMapping"
    },
    "flowMeterDimensions": {
      "$ref": "#/definitions/FlowMeterDimensions"
    },
    "fluidPVTData": {
      "$ref": "#/definitions/FluidPVTData"
    },
    "additionalParameters": {
      "$ref": "#/definitions/AdditionalParameters"
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
