# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files separately to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add a user for security (optional, but good practice if not running as root is required, 
# though nginx:alpine runs master as root and workers as nginx user by default)
# We stick to default nginx user behavior for standard compatibility.

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
