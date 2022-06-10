FROM node:latest as builder
ENV REACT_APP_API_SERVER="https://api.kloud.prvt.dev"
WORKDIR /app
COPY *.json /app/
RUN npm ci --timeout=1000000
COPY . .
RUN npm run build

FROM nginx
EXPOSE 8080
COPY /deployment/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
