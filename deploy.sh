#!/usr/bin/env bash

APP_NAME=agame-app
REPOSITORY=/home/ubuntu/AGame_MVP/MVP_Final
FRONTEND=$REPOSITORY/mvp-agame-front
BACKEND=$REPOSITORY/MVP_AGame_SPRING

echo "> 1. React 빌드 시작"
cd $FRONTEND
npm install
npm run build

echo "> 2. React 빌드 결과 → Spring static 디렉토리로 복사"
rm -rf $BACKEND/src/main/resources/static/*
cp -r build/* $BACKEND/src/main/resources/static/

echo "> 3. Spring Boot JAR 빌드"
cd $BACKEND
chmod +x mvnw 
./mvnw package -DskipTests

echo "> 4. 기존 Docker 컨테이너 중지 및 삭제"
CONTAINER_ID=$(docker ps -aqf "name=$APP_NAME")
if [ -n "$CONTAINER_ID" ]; then
  echo "> 중단 및 삭제: $CONTAINER_ID"
  docker stop "$CONTAINER_ID"
  docker rm "$CONTAINER_ID"
fi

echo "> 5. 기존 Docker 이미지 삭제"
docker rmi $APP_NAME

echo "> 6. 새 Docker 이미지 빌드"
docker build -t $APP_NAME $BACKEND

echo "> 7. Docker 컨테이너 실행"
docker run -d -p 3000:8080 --name $APP_NAME $APP_NAME
