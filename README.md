# Simple Redis App #
Super simple demo counter-app using Redis for state used to demonstrate deployment to Heroku and Azure.

## Configuration ##
Create the following environment variables:
* `REDIS_URL` redis:// like URL to connect to Redis instance

(usually used with Heroku)

*or* 

* `REDIS_HOSTNAME` Hostname for Redis instance
* `REDIS_PORT` Port for Redis instance
* `REDIS_PASSWORD` Password for Redis instance

(usually used with Azure)

## Deployment to Heroku ##
By far the easiest approach to deploying on Heroku is simply using the below button. If will create the app on Heroku and deploy the source directly from Github.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/lekkimworld/simple-redis-app)

#### Provision compute and push app ####
```
export HEROKU_APP_NAME=my-redis-demo-$(date +%s)
export HEROKU_REDIS_SKU=hobby-dev

# create app - if the local directory is a git repo we automatically set a remote
heroku apps:create --region eu $HEROKU_APP_NAME
heroku addons:create --app $HEROKU_APP_NAME heroku-redis:$HEROKU_REDIS_SKU --wait
git push heroku master
heroku open
```

#### Destroy app on Heroku ####
```
heroku apps:destroy --app $HEROKU_APP_NAME --confirm $HEROKU_APP_NAME
```

## Deployment to Azure ##
The below steps deploys the source directly from Github. If you need an example of how to deploy the source from a local git repository see my [simple-postgres-app](https://github.com/lekkimworld/simple-redis-app) repo on Github.

#### Provision compute on Azure #####
```
export AZ_APP_PREFIX=my-redis-demo-$(date +%s)
export AZ_LOCATION=northeurope
export AZ_REDIS_SKU=Basic
export AZ_REDIS_VM_SIZE=c0
export AZ_APPSERVICE_SKU=B1

# create a resource group to logically contain everything
az group create --location "$AZ_LOCATION" --name "$AZ_APP_PREFIX-resourcegroup"

# create a redis instance
az redis create --location "$AZ_LOCATION" --resource-group "$AZ_APP_PREFIX-resourcegroup" --name "$AZ_APP_PREFIX-redis" --sku $AZ_REDIS_SKU --vm-size $AZ_REDIS_VM_SIZE --minimum-tls-version 1.2

# create an app service plan (the compute) and the app service (webapp) in the plan
az appservice plan create --name "$AZ_APP_PREFIX-appplan" --resource-group "$AZ_APP_PREFIX-resourcegroup" --is-linux --location "$AZ_LOCATION" --sku $AZ_APPSERVICE_SKU --number-of-workers 1
az webapp create --name "$AZ_APP_PREFIX-appservice" --resource-group "$AZ_APP_PREFIX-resourcegroup" --plan "$AZ_APP_PREFIX-appplan" --runtime "node|10.14"

# get access key for Redis and set into web app
export AZ_REDIS_PRIMKEY=`az redis list-keys --name "$AZ_APP_PREFIX-redis" --resource-group "$AZ_APP_PREFIX-resourcegroup" | jq ".primaryKey" -r`
echo "Azure Redis Primary Key: $AZ_REDIS_PRIMKEY"
az webapp config appsettings set --name "$AZ_APP_PREFIX-appservice" --resource-group "$AZ_APP_PREFIX-resourcegroup" --settings REDIS_HOSTNAME="$AZ_APP_PREFIX-redis.redis.cache.windows.net" REDIS_PORT=6380 REDIS_PASSWORD="$AZ_REDIS_PRIMKEY"

# optionally wait for Redis to provision (can take quite a while)
while [ $(az redis show --resource-group "$AZ_APP_PREFIX-resourcegroup" --name "$AZ_APP_PREFIX-redis" | jq ".provisioningState" -r) = "Creating" ]; do echo "Waiting - Redis instance still in 'Creating' state..."; sleep 10s; done
```

#### Deploy source to Azure from Github ####
```
# deploy source
az webapp deployment source config --name "$AZ_APP_PREFIX-appservice" --resource-group "$AZ_APP_PREFIX-resourcegroup" --repo-url https://github.com/lekkimworld/simple-redis-app.git --branch master
```

#### Open app on Azure ####
```
# get hostname and open
export AZ_HOSTNAME=`az webapp show --name "$AZ_APP_PREFIX-appservice" --resource-group "$AZ_APP_PREFIX-resourcegroup"  | jq ".hostNames[0]" -r`
open "https://$AZ_HOSTNAME"
```

#### Scale out/in on Azure ####
```
az appservice plan update --name "$AZ_APP_PREFIX-appplan" --resource-group "$AZ_APP_PREFIX-resourcegroup" --number-of-workers 1
```

#### Delete services on Azure ####
```
az group delete --name "$AZ_APP_PREFIX-resourcegroup"
```