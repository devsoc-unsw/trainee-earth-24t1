#!/bin/bash

cat .env | while read line
do
	fly secrets set "$line"
done
