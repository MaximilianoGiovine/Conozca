#!/bin/bash
# ==============================================================================
# ☁️ CLOUDFLARE UFW WHITELIST SCRIPT
# Protege tu VPS de Helsinki permitiendo tráfico web (Ports 80/443)
# de forma EXCLUSIVA a los nodos de Cloudflare.
# Bloqueará a cualquier hacker que intente entrar esquivando la red Cloudflare.
# ==============================================================================

if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: Ejecuta este script como root o con sudo."
  exit 1
fi

echo "Cargando IPs oficiales de Cloudflare (IPv4 e IPv6)..."

# Borrar reglas viejas globales para los puertos 80 y 443 
# (Asumimos que habías abierto ufw allow 80/tcp y ufw allow 443/tcp)
ufw delete allow 80/tcp
ufw delete allow 443/tcp

# Bucle para IPv4
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  ufw allow proto tcp from $ip to any port 80
  ufw allow proto tcp from $ip to any port 443
done

# Bucle para IPv6
for ip in $(curl -s https://www.cloudflare.com/ips-v6); do
  ufw allow proto tcp from $ip to any port 80
  ufw allow proto tcp from $ip to any port 443
done

ufw reload
echo "✅ ÉXITO: Tu servidor ahora rechaza tráfico público. Sólo Cloudflare puede servirse de tu App."
