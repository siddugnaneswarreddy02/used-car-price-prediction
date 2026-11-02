# Alias to support both 'uvicorn main:app' and 'uvicorn app:app'
from main import app

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    reload = os.environ.get("ENVIRONMENT", "").lower() == "development"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)
