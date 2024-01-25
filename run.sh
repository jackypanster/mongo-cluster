# 获取当前日期作为标签，格式为YYYYMMDD
TAG=$(date +%Y%m%d)

docker build -t my-node-app:${TAG} .
docker run -d --name my-node-container --net mongo-cluster-network -p 3000:3000 my-node-app:${TAG}

docker ps -a