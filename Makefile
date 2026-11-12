.PHONY: setup data train backtest test run build

setup:
	python -m pip install -r requirements.txt
	cd frontend && npm install

data:
	python scripts/fetch_history.py

train:
	python scripts/train_model.py

backtest:
	python scripts/run_backtest.py

test:
	pytest backend/tests -v

run:
	uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

build:
	cd frontend && npm run build

