server {
    listen 5000;

    location / {
        proxy_pass http://server:5000;
    }
}