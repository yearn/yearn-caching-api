flags := --remove-orphans --detach
ifdef FLAGS
	flags += $(FLAGS)
endif

COMPOSE := docker-compose

up:
	$(COMPOSE) up $(flags)

logs:
	$(COMPOSE) logs -f

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build --no-cache

clean-volumes:
	$(COMPOSE) down -v

rebuild: down build up
scratch: clean-volumes build up