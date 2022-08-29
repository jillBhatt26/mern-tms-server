server {
    listen 5000;

    location /api {
        proxy_pass http://server:5000/api;
    }
}