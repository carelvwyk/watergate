#!/bin/bash
# Builds and deploys the watergate aws lambda function

export GOPATH=`pwd`
export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0

go build main.go

rm main.zip
zip -j main.zip main

DIR=`pwd`

echo "Updating lambda function on AWS"
aws lambda update-function-code --profile watergate --function-name gateController --zip-file fileb://$DIR/main.zip