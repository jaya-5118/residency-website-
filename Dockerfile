# Build the React frontend
FROM node:18 AS build-stage
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build the Node.js backend
FROM node:18
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/
COPY --from=build-stage /app/client/dist ./client/dist

# Set environment variables
ENV PORT=7860
EXPOSE 7860

# Create uploads directory
RUN mkdir -p server/uploads

# Start the application
CMD ["node", "server/index.js"]
