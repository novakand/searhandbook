FROM node:lts-alpine as builder
COPY ./package.json ./
RUN npm set progress=false \
  && npm install -g @angular/cli \
  && npm config set depth 0 \
  && npm install \
  && mkdir /ng-app \
  && cp -R ./node_modules ./ng-app
WORKDIR /ng-app
COPY . .
ARG profile=test
RUN node --max_old_space_size=8192 $(npm bin)/ng build --prod --configuration=${profile}

FROM nginx:1.17.3-alpine
# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /ng-app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80
