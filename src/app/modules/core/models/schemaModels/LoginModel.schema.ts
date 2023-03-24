export let userSchema = {
  "type": "object",
  "properties": {
    "Id": {
      "type": "integer"
    },
    "Name": {
      "title": "Username",
      "description": "Username",
      "type": "string",
      "minLength": 0,
      "maxLength": 50
    },
    "Password": {
      "title": "Password",
      "description": "Password",
      "type": "string"
    },
    "AccessLevel": {
      "type": "integer"
    }
  },
  "required": [
    "Name",
    "Password"
  ]
}

