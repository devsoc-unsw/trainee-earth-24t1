FROM node:22.3.0-alpine3.19
WORKDIR /home/node/groveify/
COPY package*.json ./
RUN chown -R node:node /home/node/groveify
USER node
RUN npm install
COPY --chown=node:node . .
ENV NODE_ENV=production
RUN npm run build
# ARG CLERK_KEY
# ENV VITE_CLERK_KEY=${CLERK_KEY}
EXPOSE 3000
CMD ["npm", "run", "production"]
