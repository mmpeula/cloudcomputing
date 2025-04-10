#!/bin/bash

echo "Building frontend..."
cd client
npm install
npm run build

echo "Copying build to server/client/dist..."
cd ..
mkdir -p server/client
rm -rf server/client/dist
cp -r client/dist server/client/

echo "Deploying to Google Cloud..."
cd server
gcloud app deploy

