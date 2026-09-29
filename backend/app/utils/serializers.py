from bson import ObjectId

def clean(value):
    if isinstance(value, ObjectId): return str(value)
    if isinstance(value, dict): return {k: clean(v) for k, v in value.items()}
    if isinstance(value, list): return [clean(v) for v in value]
    return value
