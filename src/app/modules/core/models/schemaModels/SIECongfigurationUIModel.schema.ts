export let SIEConfigCommonSchema = {
  "type": "object",
  "properties": {
    "Name": {
      "title": "SIU Name",
      "description": "SIU Name",
      "type": "string",
      "maxLength": 50
    },
    "IpAddress": {
      "title": "SIU IP Address",
      "type": "string"
    },
    "PortNumber": {
      "title": "SIU Port Number",
      "type": "integer",
      "minimum": 1.0,
      "maximum": 65535.0
    },
    "MacAddress": {
      "title": "MSMP MAC Address",
      "type": "string"
    },
  },
  "required": [
    "Name",
    "PortNumber",
  ]
}

