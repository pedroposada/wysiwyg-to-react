## DYNAMODB - LOCAL

### Start db server at http://localhost:8000/
```
docker-compose up --build
```

### Create table
```
aws dynamodb create-table --cli-input-json file://offline/migrations/docs.json --endpoint-url http://localhost:8000 --region localhost
```

### Delete table
```
aws dynamodb delete-table --table-name "tiny-cms-backend-local" --endpoint-url http://localhost:8000 --region localhost
```

### List tables
```
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region localhost
```

### View db console
http://localhost:8000/shell


## SERVERLESS OFFLINE

### Start lambdas
```
yarn sls offline
```

