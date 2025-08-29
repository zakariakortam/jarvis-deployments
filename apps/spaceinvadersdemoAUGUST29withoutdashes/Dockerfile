# Static website using Nginx
FROM nginx:alpine

# Copy static files to nginx html directory
COPY . /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
