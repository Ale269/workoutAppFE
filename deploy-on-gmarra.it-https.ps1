# deploy-on-gmarra.it-https-fixed.ps1
param(
    [string]$Server = "ubuntu@80.225.91.63",
    [string]$AppName = "gymshark-frontend",
    [string]$HttpPort = "4200",
    [string]$HttpsPort = "4443",
    [string]$Domain = "gmarra.it",
    [string]$Email = "gabriele.marraccini95@gmail.com"
)

Write-Host "1. Building Angular app..." -ForegroundColor Green
npm build

Write-Host "2. Preparing deploy package..." -ForegroundColor Green
if (Test-Path "deploy-package") { Remove-Item -Recurse -Force "deploy-package" }
New-Item -ItemType Directory -Name "deploy-package"
Copy-Item -Recurse "dist\$AppName" "deploy-package\"

# Crea Dockerfile con Let's Encrypt + dos2unix per fix encoding
@"
FROM nginx:alpine

# Installa certbot e dos2unix per correggere encoding Windows
RUN apk add --no-cache certbot certbot-nginx openssl dos2unix

# Copia files
COPY nginx-initial.conf /etc/nginx/conf.d/default.conf
COPY nginx-ssl.conf /etc/nginx/ssl.conf.template
COPY $AppName/ /usr/share/nginx/html/
COPY entrypoint.sh /entrypoint.sh

# Fix encoding Windows->Linux e permessi
RUN dos2unix /entrypoint.sh && \
    chmod +x /entrypoint.sh && \
    chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    mkdir -p /etc/letsencrypt

EXPOSE $HttpPort $HttpsPort
ENTRYPOINT ["/entrypoint.sh"]
"@ | Out-File -FilePath "deploy-package\Dockerfile" -Encoding ASCII

# Script entrypoint con correzioni per variabili PowerShell
$entrypointScript = @"
#!/bin/sh
DOMAIN="$Domain"
EMAIL="$Email"
HTTP_PORT=$HttpPort
HTTPS_PORT=$HttpsPort

echo "=== Avvio container con Let's Encrypt ==="

# Avvia nginx in background per challenge HTTP-01
nginx &
NGINX_PID=`$!

# Aspetta che nginx sia pronto
sleep 5

# Se non esistono certificati, li ottiene
if [ ! -f "/etc/letsencrypt/live/`$DOMAIN/fullchain.pem" ]; then
    echo "Ottenendo certificato Let's Encrypt per `$DOMAIN..."
    certbot certonly \
        --webroot \
        --webroot-path=/usr/share/nginx/html \
        --email `$EMAIL \
        --agree-tos \
        --non-interactive \
        --domains `$DOMAIN
        
    if [ `$? -eq 0 ]; then
        echo "Certificato ottenuto con successo!"
    else
        echo "ERRORE: Impossibile ottenere certificato. Usando self-signed..."
        mkdir -p /etc/nginx/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/nginx/ssl/nginx.key \
            -out /etc/nginx/ssl/nginx.crt \
            -subj "/C=IT/ST=Italy/L=Rome/O=GymTracker/CN=`$DOMAIN"
        
        # Usa template self-signed
        sed "s/DOMAIN/`$DOMAIN/g; s/HTTP_PORT/`$HTTP_PORT/g; s/HTTPS_PORT/`$HTTPS_PORT/g" \
            /etc/nginx/ssl.conf.template > /etc/nginx/conf.d/default.conf
        sed -i 's|/etc/letsencrypt/live/DOMAIN|/etc/nginx/ssl|g' /etc/nginx/conf.d/default.conf
        sed -i 's|fullchain.pem|nginx.crt|g' /etc/nginx/conf.d/default.conf
        sed -i 's|privkey.pem|nginx.key|g' /etc/nginx/conf.d/default.conf
        
        # Ricarica nginx con config self-signed
        kill `$NGINX_PID
        sleep 2
        echo "Avviando nginx con certificato self-signed..."
        nginx -g "daemon off;"
        exit 0
    fi
else
    echo "Certificato Let's Encrypt esistente trovato."
fi

# Se abbiamo certificati Let's Encrypt, configura nginx SSL
if [ -f "/etc/letsencrypt/live/`$DOMAIN/fullchain.pem" ]; then
    echo "Configurando nginx con certificati Let's Encrypt..."
    sed "s/DOMAIN/`$DOMAIN/g; s/HTTP_PORT/`$HTTP_PORT/g; s/HTTPS_PORT/`$HTTPS_PORT/g" \
        /etc/nginx/ssl.conf.template > /etc/nginx/conf.d/default.conf
fi

# Ricarica nginx con configurazione SSL
kill `$NGINX_PID
sleep 2

# Setup auto-renewal (controlla ogni 12 ore)
(
    while true; do
        sleep 43200  # 12 ore
        certbot renew --quiet --post-hook "nginx -s reload"
    done
) &

# Avvia nginx in foreground
echo "Avviando nginx con SSL..."
nginx -g "daemon off;"
"@

# Salva entrypoint.sh con line endings Unix corretti
$entrypointScript -replace "`r`n", "`n" | Set-Content -Path "deploy-package\entrypoint.sh" -Encoding UTF8 -NoNewline

# Configurazione nginx iniziale (per challenge)
@"
server {
    listen $HttpPort;
    server_name $Domain;
    root /usr/share/nginx/html;
    index index.html;

    # Per Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }

    location / {
        try_files `$uri `$uri/ /index.html;
    }

    location ~* \.(json|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|js|css)`$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json text/plain image/svg+xml;
}
"@ | Out-File -FilePath "deploy-package\nginx-initial.conf" -Encoding ASCII

# Template nginx con SSL
@"
# Redirect HTTP to HTTPS
server {
    listen HTTP_PORT;
    server_name DOMAIN;
    
    # Per Let's Encrypt renewal
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }
    
    location / {
        return 301 https://`$server_name:HTTPS_PORT`$request_uri;
    }
}

# HTTPS server
server {
    listen HTTPS_PORT ssl http2;
    server_name DOMAIN;
    root /usr/share/nginx/html;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        try_files `$uri `$uri/ /index.html;
    }

    location ~* \.(json|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|js|css)`$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json text/plain image/svg+xml;
}
"@ | Out-File -FilePath "deploy-package\nginx-ssl.conf" -Encoding ASCII

# Deploy script
@"
#!/bin/bash
docker build -t $AppName-ssl:latest .
docker stop $AppName-ssl-container 2>/dev/null || true
docker rm $AppName-ssl-container 2>/dev/null || true

# Volume per persistere certificati
docker volume create ${AppName}-letsencrypt 2>/dev/null || true

docker run -d \
  --name $AppName-ssl-container \
  -p ${HttpPort}:${HttpPort} \
  -p ${HttpsPort}:${HttpsPort} \
  -v ${AppName}-letsencrypt:/etc/letsencrypt \
  --restart unless-stopped \
  $AppName-ssl:latest

echo "Deploy completato!"
echo "Il container otterra automaticamente il certificato Let's Encrypt..."
echo "HTTP:  http://`$Domain:`$HttpPort"
echo "HTTPS: https://`$Domain:`$HttpsPort (disponibile dopo ~30 secondi)"
"@ | Out-File -FilePath "deploy-package\deploy.sh" -Encoding UTF8

Write-Host "3. Transferring to server..." -ForegroundColor Green
scp -r deploy-package/* ${Server}:/tmp/deploy-$AppName/

Write-Host "4. Deploying on server..." -ForegroundColor Green
ssh $Server "cd /tmp/deploy-$AppName && chmod +x deploy.sh entrypoint.sh && ./deploy.sh && cd / && rm -rf /tmp/deploy-$AppName"

Write-Host "5. Cleaning up locally..." -ForegroundColor Green
Remove-Item -Recurse -Force "deploy-package"

Write-Host "Deploy completato!" -ForegroundColor Green
Write-Host "Il container otterra il certificato Let's Encrypt automaticamente..." -ForegroundColor Yellow
Write-Host "Controlla i logs: docker logs -f $AppName-ssl-container" -ForegroundColor Cyan