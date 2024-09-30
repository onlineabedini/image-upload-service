# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port that your app will run on
EXPOSE 3000

# Specify the command to run your app
CMD ["npm", "run", "start"]
