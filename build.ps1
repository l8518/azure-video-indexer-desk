docker-compose -f ./azfunc/docker-compose.production-build.yml build
$id=$(docker create azfunc_prod:latest)
docker cp --archive ${id}:/home/site/wwwroot ./azfunc/bin/azfunc
tar -cvf ./azfunc/bin/azfunc.tar ./azfunc/bin/azfunc 
docker rm -v $id