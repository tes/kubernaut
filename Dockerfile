from node:8-alpine

ENV NODE_ENV=production
RUN apk add -U --no-cache tcpdump curl

RUN npm config set color false

# First install the server dependencies (hopefully cached in previous image)
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json .
COPY package-lock.json .

RUN NODE_ENV=development npm install --clean --force

# Now build the server (likely to cachebust)
WORKDIR /opt/app
COPY . .
RUN NODE_ENV=development npm run test-server -- --ci --bail --no-colors --verbose
RUN npm run build-server
RUN npm run lint
