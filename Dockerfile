# Development
FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

# Build production
FROM node:18-alpine As builder

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

COPY --chown=node:node . .

RUN npm run build

# Production
FROM node:18-alpine As production

ENV NODE_ENV production

USER node

WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]