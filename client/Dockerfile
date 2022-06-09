FROM node:latest as builder
WORKDIR /app
COPY *.json /app/
RUN npm ci --timeout=1000000
COPY . .
RUN npm run build

FROM nginx
EXPOSE 8080
COPY deployment/defalut.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
