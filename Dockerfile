FROM node:latest

WORKDIR /home/node/groveify/backend
COPY backend/package*.json ./
RUN chown -R node:node /home/node/groveify
USER node
RUN npm install
COPY --chown=node:node backend/ .
# expose
# run with cmd

WORKDIR /home/node/groveify/frontend
COPY frontend/package*.json ./
RUN chown -R node:node /home/node/groveify/ # account for frontend folder having incorrect perms
USER node
RUN npm install
COPY --chown=node:node frontend/ .
RUN npm build

FROM pierrezemb/gostatic
COPY /home/node/groveify/frontend/dist /srv/http/
