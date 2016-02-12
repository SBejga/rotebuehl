# https://github.com/nodejs/docker-node/blob/master/5.3/Dockerfile
FROM sbejga/debian-ruby-node

# Either copy Dist
COPY ./dist /usr/nodejsapp/
# or copy dev
# COPY . /usr/nodejsapp/

# When dist
RUN npm install

# When dev
# CMD [ "node", "server/app.js" ]
# When dist
CMD [ "node", "app.js" ]
