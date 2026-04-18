SHELL := /bin/bash

COMPOSE := docker compose -f docker-compose.yml
SERVICE := oracle
DB_USER := AGROGEMINI
DB_PASSWORD := AgroGemini123
DB_CONNECT := $(DB_USER)/$(DB_PASSWORD)@//localhost:1521/FREEPDB1

.PHONY: up down down-volume reset wait migrate sqlplus logs ps

up:
	$(COMPOSE) up -d
	$(MAKE) wait

down:
	$(COMPOSE) down

down-volume:
	$(COMPOSE) down -v --remove-orphans

reset: down-volume up migrate

wait:
	@echo "Aguardando Oracle aceitar conexoes no schema $(DB_USER)..."
	@until $(COMPOSE) exec -T $(SERVICE) bash -lc "echo 'SELECT 1 FROM dual;' | sqlplus -s $(DB_CONNECT) | grep -q 1"; do \
		echo "Banco ainda nao pronto. Tentando novamente em 5s..."; \
		sleep 5; \
	done
	@echo "Oracle pronto."

migrate: wait
	@echo "Executando migrations (99_run_all.sql)..."
	$(COMPOSE) exec -T $(SERVICE) bash -lc "cd /opt/oracle/scripts/migrations && sqlplus -s $(DB_CONNECT) @99_run_all.sql"
	@echo "Migrations executadas."

sqlplus: wait
	$(COMPOSE) exec $(SERVICE) bash -lc "sqlplus $(DB_CONNECT)"

logs:
	$(COMPOSE) logs -f $(SERVICE)

ps:
	$(COMPOSE) ps
