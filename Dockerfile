###################
# BUILD FOR LOCAL DEVELOPMENT
###################

ARG BUILD_PLATFORM=linux/amd64

FROM --platform=${BUILD_PLATFORM} node:19-slim AS development

# Install Nano (optional, only if you need it for debugging)
RUN apt-get update && apt-get install -y nano && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY --chown=node:node package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM --platform=${BUILD_PLATFORM} node:19-slim AS build

WORKDIR /usr/src/app

RUN npm install -g pnpm

# Copy over the node_modules directory and other necessary files from the development image
COPY --chown=node:node package*.json pnpm-lock.yaml ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN pnpm run build

ENV NODE_ENV=production

RUN pnpm install --frozen-lockfile --prod

USER node

###################
# PRODUCTION
###################

FROM --platform=${BUILD_PLATFORM} node:19-slim AS production

WORKDIR /usr/src/app

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install Google Chrome Stable and fonts for Puppeteer
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates --no-install-recommends && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /usr/share/keyrings/google-linux-keyring.gpg && \
    sh -c 'echo "deb [signed-by=/usr/share/keyrings/google-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list' && \
    apt-get update && apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy the node_modules and dist from the build stage
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Verify that Chrome is installed at the expected location
RUN ls -alh /usr/bin/google-chrome-stable && \
    /usr/bin/google-chrome-stable --version

RUN chown -R node:node /usr/src/app && chmod -R 775 /usr/src/app

USER node

EXPOSE 8080

CMD ["node", "dist/main.js"]

