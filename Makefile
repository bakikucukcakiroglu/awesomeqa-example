.PHONY: transform-data
transform-data:
	python3 transform_data.py


.PHONY: setup-environment
setup-environment: transform-data docker-build docker-run

.PHONY: docker-build
docker-build:
	docker-compose build

.PHONY: docker-run
docker-run:
	docker-compose up -d
