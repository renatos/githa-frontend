# Githa Frontend - Deployment Guide

## Overview
This guide explains how to deploy the Githa Vue.js frontend to OCI Always Free Tier using GitHub Actions.

## Prerequisites

1. **GitHub Secrets** (configure in repository settings):
   - `VM_HOST` - IP da VM OCI (ex: `163.176.144.196`)
   - `VM_SSH_PRIVATE_KEY` - Chave SSH privada para acesso à VM
   - `GOOGLE_CLIENT_ID` - ID do cliente Google OAuth

2. **VM Configuration**:
   - Nginx instalado
   - Certbot configurado para `githa.duckdns.org`
   - Porta 80 e 443 abertas no firewall e Security List

## Deployment Workflow

### Tag-Based Deployment
O deploy é automaticamente disparado ao criar uma tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Build Configuration
O frontend é compilado com as seguintes variáveis de ambiente:
- `VITE_API_BASE_URL=https://githa-backend.duckdns.org` - URL do backend
- `VITE_GOOGLE_CLIENT_ID` - Injetado via GitHub Secret

### Nginx Setup

1. **Copiar configuração para a VM**:
```bash
scp nginx.conf ubuntu@163.176.144.196:/tmp/githa-nginx.conf
```

2. **Instalar configuração**:
```bash
ssh ubuntu@163.176.144.196
sudo mv /tmp/githa-nginx.conf /etc/nginx/sites-available/githa
sudo ln -s /etc/nginx/sites-available/githa /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # (se existir)
sudo nginx -t
sudo systemctl reload nginx
```

3. **Configurar SSL com Certbot**:
```bash
sudo certbot --nginx -d githa.duckdns.org -d www.githa.duckdns.org
```

## Directory Structure

```
/var/www/githa/          # Frontend build output
    ├── index.html
    ├── assets/
    └── ...
```

## Troubleshooting

### Frontend não carrega
1. Verifique os logs do Nginx:
```bash
sudo tail -f /var/log/nginx/error.log
```

2. Verifique permissões:
```bash
ls -la /var/www/githa
```

### API calls failing
1. Teste o proxy do Nginx:
```bash
curl -I https://githa.duckdns.org/api/q/health
```

2. Verifique se o backend está rodando:
```bash
docker ps
docker logs githa-backend
```

### SSL Issues
1. Renovar certificado:
```bash
sudo certbot renew
```

2. Verificar status:
```bash
sudo certbot certificates
```

## Manual Deployment (Emergency)

Se o GitHub Actions falhar, você pode fazer deploy manualmente:

```bash
# 1. Build local
npm ci
npm run build

# 2. Upload para VM
scp -r dist/* ubuntu@163.176.144.196:/tmp/frontend-manual

# 3. Na VM
ssh ubuntu@163.176.144.196
sudo rm -rf /var/www/githa/*
sudo mv /tmp/frontend-manual/* /var/www/githa/
sudo chown -R www-data:www-data /var/www/githa
sudo systemctl reload nginx
```
