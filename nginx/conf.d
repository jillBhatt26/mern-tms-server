server {
    listen 8080;

    location / {
        proxy_pass http://server:5000;
    }
}