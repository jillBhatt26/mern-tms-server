http {
    upstream apiServers {
        server localhost:5001;
        server localhost:5002;
        server localhost:5003;
    }

    server {
        listen 5000;

        location / {
            proxy_pass http://apiServers;

            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;

            # cookies
            proxy_cookie_path / "/; HTTPOnly;";
        }
    }

    events {}
}
