# Step 1: Build the React application
FROM node:21-alpine3.18
RUN apk add --no-cache python3 make g++
# Set environment variable for Python
ENV PYTHON /usr/bin/python3
WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine

COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]