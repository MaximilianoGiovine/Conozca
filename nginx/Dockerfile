FROM nginx:alpine
# Copiamos la configuración del gateway dentro de la imagen
# Esto evita problemas de bind-mounts en Portainer/Docker Swarm
COPY default.conf /etc/nginx/conf.d/default.conf
