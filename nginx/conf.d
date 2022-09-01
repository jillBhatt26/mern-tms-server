user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {

    listen 5000;

    #upstream nginx {
    #    server server:5000;
    #    server server:5000;
    #    server server:5000;
    #    server server:5000;
    #    server server:5000;
    #}

    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    server { 
        location / {
            proxy_pass http://server:5000;
        }

        location /websocket {
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_pass "http://server";
        }
    }

    #gzip  on;

    #include /etc/nginx/conf.d/*.conf;
}