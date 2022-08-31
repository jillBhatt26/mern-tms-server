upstream my-app {
    server 172.17.0.1:5000 weight=1;
    server 172.17.0.1:5000 weight=1;
}

server {
    location / {
        proxy_pass http://my-app;
    }
}