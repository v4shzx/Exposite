# Stage 1: Build the React Application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if exists) or package-lock.json
COPY package.json ./
# If using pnpm, uncomment below:
# RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
