flags := --remove-orphans --detach
ifdef FLAGS
	flags += $(FLAGS)
endif

compose := docker-compose -f docker-compose.yml
ifdef PROD
	compose := docker-compose -f docker-compose.yml -f docker-compose.prod.yml
endif

all: down build up logs

up:
	$(compose) up $(flags)

logs:
	$(compose) logs -f

down:
	$(compose) down

build:
	$(compose) build

clean-volumes:
	$(compose) down -v

rebuild: down build up
scratch: clean-volumes build up