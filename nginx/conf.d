upstream my-app {
    server http://localhost:5000 weight=1;
    server http://localhost:5000 weight=1;
}

server {
    location / {
        proxy_pass http://my-app;
    }
}