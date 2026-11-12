"""CLI script to train the BreatheWise PM2.5 forecast model."""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.model.train import train_and_evaluate

if __name__ == "__main__":
    train_and_evaluate()

