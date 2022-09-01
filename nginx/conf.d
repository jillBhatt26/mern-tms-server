server {
    listen 5000;

    location / {
        proxy_pass http://server:5000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # cookies
        proxy_cookie_path / "/; HTTPOnly;";
    }
}