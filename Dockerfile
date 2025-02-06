FROM nginx:1.27.4-alpine
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/mime-types.conf /etc/nginx/mime-types.conf
COPY nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html
