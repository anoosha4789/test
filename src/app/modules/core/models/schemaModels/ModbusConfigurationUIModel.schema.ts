export let modbusConfigurationSchema = {
    "type": "object",
    "properties": {

        "SlaveId": {
            "type": "integer",
            "minimum": 1.0,
             "maximum": 254.0
        },
        "Channel": {
            "type": "object"
        },
        "Serial": {
            "type": "null"
        },
        "Tcp": {
            "type": "null"
        },
        "ModbusDeviceMap": {
            "type": "array",
            "items": {}
        },
        "UnitSystem": {
            "type": "string"
        },
        "IsForModbusMaster": {
            "type": "boolean"
        },
        "Endianness": {
            "type": "integer"
        },
        "IsBytesSwapped": {
            "type": "integer"
        },
        "RegisteredModbusMapId": {
            "type": "integer"
        },
        "ModbusConfigurationId": {
            "type": "integer"
        },
        "MapType": {
            "type": "string"
        },
        "ConnectionTo": {
            "type": "string"
        },
        "WordOrder": {
            "type": "string"
        },
        "ByteOrder": {
            "type": "string"
        }

    },
    "required": [

        "SlaveId"
    ]

};
