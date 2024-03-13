# Use an official Node runtime as a parent image with a version that meets Next.js requirements
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --force

# Bundle app source
COPY . .

# Build your Next.js application
RUN npm run build

# Expose port 3000 to access the server
EXPOSE 3000

# Command to run your app
CMD ["npm","run", "start"]
