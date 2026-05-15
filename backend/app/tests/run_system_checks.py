import json
import sys

from app.main import app
from app.services.system_checks import run_system_checks


def main() -> int:
    result = run_system_checks(app)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
