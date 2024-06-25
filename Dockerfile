FROM node:22.3.0-alpine3.19 as builder

WORKDIR /home/node/groveify/backend
COPY backend/package*.json ./
RUN chown -R node:node /home/node/groveify
USER node
RUN npm install
COPY --chown=node:node backend/ .

USER root
WORKDIR /home/node/groveify/frontend
COPY frontend/package*.json ./
RUN chown -R node:node /home/node/groveify/ # account for frontend folder having incorrect perms
USER node
RUN npm install
COPY --chown=node:node frontend/ .
RUN npm run build 

ENV NODE_ENV=production
CMD "cd /home/node/groveify/backend && npm dev"

# run apache web server for frontend
FROM httpd:2.4.59-alpine
COPY --from=builder /home/node/groveify/frontend/dist /usr/local/apache2/htdocs/
