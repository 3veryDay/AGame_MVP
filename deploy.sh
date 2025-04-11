#!/usr/bin/env bash

APP_NAME=agame-app
REPOSITORY=/home/ubuntu/AGame_MVP/MVP_Final
FRONTEND=$REPOSITORY/mvp-agame-front
BACKEND=$REPOSITORY/MVP_AGame_SPRING

echo "> 1. React 빌드 결과 → Spring static 디렉토리로 복사"
rm -rf $BACKEND/src/main/resources/static/*
cp -r $FRONTEND/build/* $BACKEND/src/main/resources/static/

echo "> 2. Spring Boot JAR 빌드"
cd $BACKEND
chmod +x mvnw 
./mvnw package -DskipTests

echo "> 3. 기존 Docker 컨테이너 중지 및 삭제"
CONTAINER_ID=$(docker ps -aqf "name=$APP_NAME")
if [ -n "$CONTAINER_ID" ]; then
  echo "> 중단 및 삭제: $CONTAINER_ID"
  docker stop "$CONTAINER_ID"
  docker rm "$CONTAINER_ID"
fi

echo "> 4. 기존 Docker 이미지 삭제"
docker rmi -f $APP_NAME 2>/dev/null || echo "> 삭제할 이미지 없음"

echo "> 5. 새 Docker 이미지 빌드"
docker build -t $APP_NAME $BACKEND

echo "> 6. Docker 컨테이너 실행"
docker run -d -p 3000:8080 --name $APP_NAME $APP_NAME

echo "> 7. 컨테이너 로그 확인 (실시간 출력)"
docker logs -f $APP_NAME
