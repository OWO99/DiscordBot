# Use the Node.js 18 image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy your Node.js application files into the container
COPY package*.json ./
RUN npm install
RUN apt-get -y update && apt-get -y upgrade && apt-get install -y ffmpeg

COPY . .
# Install Node.js dependencies


CMD [ "node", "./src/index.js" ]