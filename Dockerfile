###################
# BUILD FOR LOCAL DEVELOPMENT
###################

# Set a consistent platform for the build
ARG BUILD_PLATFORM=linux/amd64

FROM --platform=${BUILD_PLATFORM} node:19 AS development

# Install Nano (optional, only if you need it for debugging)
RUN apt-get update && \
    apt-get install -y nano && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy application dependency manifests to the container image.
COPY --chown=node:node package*.json pnpm-lock.yaml ./

# Install app dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Bundle app source with appropriate ownership
COPY --chown=node:node . .

# Switch to 'node' user
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM --platform=${BUILD_PLATFORM} node:19 AS build

WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy over the node_modules directory and other necessary files from the development image
COPY --chown=node:node package*.json pnpm-lock.yaml ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN pnpm run build

# Set NODE_ENV environment variable
ENV NODE_ENV=production

# Clean install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Switch to 'node' user
USER node

###################
# PRODUCTION
###################

FROM --platform=${BUILD_PLATFORM} node:19 AS production

# Create app directory and set it as the working directory
WORKDIR /usr/src/app

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Change ownership and set write permission for the /usr/src/app directory
RUN chown -R node:node /usr/src/app && chmod -R 775 /usr/src/app

# Switch to 'node' user
USER node

# Start the server using the production build
CMD ["node", "dist/main.js"]
