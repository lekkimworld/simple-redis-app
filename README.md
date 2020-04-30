# simple-redis-heroku-app
Super simple demo counter-app using Redis for state for Heroku.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/lekkimworld/simple-redis-heroku-app)

## Configuration ##
Create the following environment variables:
* `REDIS_URL` redis:// like URL to connect to Redis instance

(usually used with Heroku)

*or* 

* `REDIS_HOSTNAME` Hostname for Redis instance
* `REDIS_PORT` Port for Redis instance
* `REDIS_PASSWORD` Password for Redis instance

(usually used with Azure)