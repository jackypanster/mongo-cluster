#!/bin/bash

# 定义副本集参数
REPLICA_SET_NAME="rs0"
NETWORK_NAME="mongo-cluster-network"
VOLUME_PREFIX="$(pwd)/mongo_data"  # 使用当前工作目录

# 创建Docker网络
echo "创建Docker网络：$NETWORK_NAME"
docker network create $NETWORK_NAME

# 启动MongoDB实例
for i in 1 2 3; do
    echo "启动MongoDB节点：mongo-node$i"
    docker run -d \
        --name "mongo-node$i" \
        --net $NETWORK_NAME \
        -v "$VOLUME_PREFIX/node$i:/data/db" \
        mongo \
        --replSet $REPLICA_SET_NAME
done

# 等待MongoDB实例启动
echo "等待MongoDB节点启动..."
sleep 10

# 初始化副本集
echo "初始化MongoDB副本集：$REPLICA_SET_NAME"
docker exec mongo-node1 /usr/bin/mongosh --eval "
rs.initiate({
  _id: '$REPLICA_SET_NAME',
  members: [
    { _id: 0, host: 'mongo-node1:27017' },
    { _id: 1, host: 'mongo-node2:27017' },
    { _id: 2, host: 'mongo-node3:27017' }
  ]
});
"

echo "MongoDB副本集配置完成。"

