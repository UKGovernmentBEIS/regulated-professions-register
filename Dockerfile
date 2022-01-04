# ------------------------------------------------------------------------------
# Base
# ------------------------------------------------------------------------------
FROM node:16 as base

ENV APP_HOME /srv/app
ENV DEPS_HOME /deps

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

FROM base AS dependencies

RUN mkdir -p ${DEPS_HOME}
WORKDIR $DEPS_HOME

COPY package.json $DEPS_HOME/package.json
COPY package-lock.json $DEPS_HOME/package-lock.json

RUN npm ci

# ------------------------------------------------------------------------------
# Web
# ------------------------------------------------------------------------------
FROM dependencies AS web

RUN mkdir -p ${APP_HOME}
WORKDIR ${APP_HOME}

COPY . ${APP_HOME}

RUN cp -R $DEPS_HOME/node_modules $APP_HOME/node_modules

RUN if [ "$NODE_ENV" = "production" ]; then \
  npm run build:assets:prod && \
  npm run build; \
  npm run seed:production; \
  else \
  npm run build:assets && \
  npm run build; \
  fi

EXPOSE 3000

ENTRYPOINT [ "./docker-entrypoint.sh" ]

CMD ["node", "dist/main"]

# ------------------------------------------------------------------------------
# Test
# ------------------------------------------------------------------------------
FROM web AS test


RUN apt-get update && apt-get install -y --fix-missing --no-install-recommends \
  libgtk2.0-0 \
  libgtk-3-0 \
  libgbm-dev \
  libnotify-dev \
  libgconf-2-4 \
  libnss3 \
  libxss1 \
  libasound2 \
  libxtst6 \
  xauth \
  xvfb
