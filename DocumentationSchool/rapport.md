# GraphApp

## Comment on run?

Depuis ./src/main/docker
```shell
docker compose -f services.yml up -d
```

Depuis ./
```
npm install
./mvnw
```
Sur linux (et, on espère, MacOS), prioriser :
```
chmod +x ./mvnw
```

Dans adminer :
server: postgresql
username: graphapp
password: admin
db: graphapp

System: Postgresql

## Prompts
![img.png](media/img.png)

> Provided the final contents for the `postgresql.yml` file
