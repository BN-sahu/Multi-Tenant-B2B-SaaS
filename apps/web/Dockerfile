FROM node:20-alpine

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies for the whole workspace
RUN npm ci

# Build only the Web app and its dependencies
RUN npx turbo run build --filter=web

# Expose the Web port
EXPOSE 3000

# Start the Web app
CMD ["npm", "run", "start", "-w", "web"]
