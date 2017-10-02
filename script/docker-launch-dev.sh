CONTAINER_WEB="challenge-web"
CONTAINER_DB="challenge-db"

if [ $(docker ps -a | grep $CONTAINER_DB | wc -l) == "0" ]; then
	docker run --name $CONTAINER_DB -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -p 3306:3306 -d mysql:5.7
fi

if [ $(docker ps -a | grep $CONTAINER_WEB | wc -l) == "1" ]; then
    docker rm -f $CONTAINER_WEB
fi

docker run --name $CONTAINER_WEB \
		   --link $CONTAINER_DB:$CONTAINER_DB \
           -p 8080:8080 \
           -e IS_DOCKER=1 \
           -e LANG=C \
           -e NODE_ENV=development \
           -v ~/challenge:/usr/src/app:ro \
		   -dt n-le/challenge
