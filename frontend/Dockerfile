# Use an official Node runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 5173 for Vite
EXPOSE 5173

# Run the Vite dev server exposing all host bindings
CMD ["npm", "run", "dev", "--", "--host"]
