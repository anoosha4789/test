{
  "type": "object",
  "properties": {
    "InputDeviceId": {
      "type": "integer"
    },
    "InputDataPointIndex": {
      "type": "integer"
    },
    "OutputDeviceId": {
      "type": "integer"
    },
    "OutputDataPointIndex": {
      "type": "integer"
    },
    "RawValuePoint1": {
      "type": "number"
    },
    "RawValuePoint2": {
      "type": "number"
    },
    "ScaledValuePoint1": {
      "type": "number"
    },
    "ScaledValuePoint2": {
      "type": "number"
    }
  },
  "required": [
    "RawValuePoint1",
    "RawValuePoint2",
    "ScaledValuePoint1",
    "ScaledValuePoint2"
  ]
}
