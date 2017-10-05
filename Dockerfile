from node:8-alpine

ENV HOME=/config
ENV NODE_ENV=production

RUN apk add -U --no-cache curl ca-certificates tcpdump

RUN npm config set color false

# First install the server dependencies (hopefully cached in previous image)
RUN mkdir -p /opt/kubernaut
WORKDIR /opt/kubernaut
COPY package.json .
COPY package-lock.json .

RUN NODE_ENV=development npm install --clean --force

COPY . .
RUN NODE_ENV=development npm run test-server -- --ci --bail --no-colors --verbose
RUN npm run build-server
RUN npm run lint

ADD https://storage.googleapis.com/kubernetes-release/release/v1.8.0/bin/linux/amd64/kubectl /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl
RUN kubectl version --client

ENTRYPOINT node .
