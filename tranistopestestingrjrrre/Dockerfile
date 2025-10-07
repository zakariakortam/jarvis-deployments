FROM nginx:alpine

# Copy application files
COPY . /usr/share/nginx/html/

# Copy nginx configuration
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
