# One-shot builder: compiles the SPA and copies dist/ into a shared named
# volume (frontend_dist) that the root nginx service serves + proxies /api/
# to the api service. See docker-compose.yml at the repo root.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM alpine:3.20
COPY --from=build /app/dist /dist
CMD ["sh", "-c", "rm -rf /output/* && cp -r /dist/* /output/ && echo 'frontend build copied to shared volume'"]
