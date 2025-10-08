# full-deploy.ps1
param(
    [string]$Server = "ubuntu@80.225.91.63",
    [string]$AppName = "gymshark-frontend",
    [string]$Port = "4202"
)

Write-Host "1. Building Angular app..." -ForegroundColor Green
npm run build 

Write-Host "2. Preparing deploy package..." -ForegroundColor Green
if (Test-Path "deploy-package") { Remove-Item -Recurse -Force "deploy-package" }
New-Item -ItemType Directory -Name "deploy-package"
Copy-Item -Recurse "dist\$AppName" "deploy-package\"

# Crea Dockerfile
@"
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY $AppName/ /usr/share/nginx/html/
RUN chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;
EXPOSE $Port
CMD ["nginx", "-g", "daemon off;"]
"@ | Out-File -FilePath "deploy-package\Dockerfile" -Encoding ASCII

# Crea nginx.conf
@"
server {
    listen $Port;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files `$uri `$uri/ /index.html;

        # Headers per iOS PWA
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header X-Content-Type-Options "nosniff";
    }

    # Service Worker - no cache
    location ~ (ngsw-worker\.js|ngsw\.json|safety-worker\.js|worker-basic\.min\.js)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Manifest - correct Content-Type
    location = /manifest.json {
        add_header Content-Type "application/manifest+json";
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    location ~* \.(json|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|js|css)`$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }


    gzip on;
    gzip_types text/css application/javascript application/json text/plain image/svg+xml;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
"@ | Out-File -FilePath "deploy-package\nginx.conf" -Encoding ASCII

# Crea deploy script per il server
@"
#!/bin/bash
docker build --no-cache -t $AppName`:latest .
docker stop $AppName-container 2>/dev/null || true
docker rm $AppName-container 2>/dev/null || true
docker run -d --name $AppName-container --network gmarra-net -p ${Port}:${Port} --restart unless-stopped $AppName`:latest
echo "Deploy completato!"
"@ | Out-File -FilePath "deploy-package\deploy.sh" -Encoding UTF8

Write-Host "3. Transferring to server..." -ForegroundColor Green
scp -r deploy-package/* ${Server}:/tmp/deploy-$AppName/

Write-Host "4. Deploying on server..." -ForegroundColor Green
ssh $Server "cd /tmp/deploy-$AppName && chmod +x deploy.sh && ./deploy.sh && cd / && rm -rf /tmp/deploy-$AppName"
#ssh $Server "cd /tmp/deploy-$AppName && chmod +x deploy.sh && ./deploy.sh && cd / "

Write-Host "5. Cleaning up locally..." -ForegroundColor Green
Remove-Item -Recurse -Force "deploy-package"

Write-Host "Deploy completato! App disponibile su http://gmarra.it:$Port" -ForegroundColor Green
