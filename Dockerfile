FROM node:12-alpine AS build

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
RUN NODE_ENV=development npm ci

# Then install the client dependencies (hopefully cached in previous image)
RUN mkdir -p /opt/kubernaut/client
WORKDIR /opt/kubernaut/client
COPY client/package.json .
COPY client/package-lock.json .
RUN NODE_ENV=development npm ci

# Now build the client (likely to cachebust)
COPY client .
RUN npm run build

# Now build the server (likely to cachebust)
WORKDIR /opt/kubernaut
COPY . .
RUN npm run build-server
RUN npm run lint

FROM node:12-alpine

CMD ["node", "."]
WORKDIR /opt/kubernaut

ENV TZ=UTC
RUN apk -U --no-cache add tzdata ca-certificates \
    && cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ENV HOME=/config
ENV NODE_ENV=production

# Copy prebuilt application
COPY --from=build /opt/kubernaut/ /opt/kubernaut/
