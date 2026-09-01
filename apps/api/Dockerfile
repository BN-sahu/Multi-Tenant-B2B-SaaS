FROM node:20-alpine

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies for the whole workspace
RUN npm ci

# Build only the API app and its dependencies
RUN npx turbo run build --filter=api

# Expose the API port
EXPOSE 3000

# Start the API
CMD ["npm", "run", "start:prod", "-w", "api"]
