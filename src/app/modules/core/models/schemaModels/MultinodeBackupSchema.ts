export let multinodeBackupSchema = {
    "type": "object",
    "properties": {
        "PackageName": {
            "type": "string",
            "minLength": 0,
            "maxLength": 50,
            "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
        }
    },
    "required": [
        "PackageName"
    ]
}