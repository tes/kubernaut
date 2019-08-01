from node:12-alpine

ENV TZ=UTC
RUN apk --update add tzdata \
 && cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ENV HOME=/config
ENV NODE_ENV=production

RUN apk add -U --no-cache curl ca-certificates tcpdump python make g++ rsync

RUN npm config set color false
RUN npm config set registry https://registry.npmjs.org/

# First install the server dependencies (hopefully cached in previous image)
RUN mkdir -p /opt/kubernaut
WORKDIR /opt/kubernaut
COPY package.json .
COPY package-lock.json .
RUN NODE_ENV=development npm install --clean --force

# Then install the client dependencies (hopefully cached in previous image)
RUN mkdir -p /opt/kubernaut/client
WORKDIR /opt/kubernaut/client
COPY client/package.json .
COPY client/package-lock.json .
RUN NODE_ENV=development npm install --clean --force

# Now build the client (likely to cachebust)
COPY client .
RUN npm run build

# Now build the server (likely to cachebust)
WORKDIR /opt/kubernaut
COPY . .
RUN npm run build-server
RUN npm run lint

# Install the kubectl client
ADD https://storage.googleapis.com/kubernetes-release/release/v1.15.0/bin/linux/amd64/kubectl /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl
RUN kubectl version --client

ENTRYPOINT node .
