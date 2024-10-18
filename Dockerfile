FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including devDependencies
RUN npm install 

# Copy the rest of the application files
COPY . .

# Copy the environment variables
COPY .env .env

# Build the TypeScript project
RUN npm run build

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["node", "dist/index.js"]
