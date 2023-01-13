# ------------------------------------------------------------------------------
# Base
# ------------------------------------------------------------------------------
FROM node:16-alpine as base

ENV APP_HOME /srv/app
ENV DEPS_HOME /deps
ENV TEST_HOME /srv/test

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

# ------------------------------------------------------------------------------
# Dependencies
# ------------------------------------------------------------------------------
FROM base AS dependencies

RUN mkdir -p ${DEPS_HOME}
WORKDIR $DEPS_HOME

COPY package.json $DEPS_HOME/package.json
COPY package-lock.json $DEPS_HOME/package-lock.json

RUN npm ci

# ------------------------------------------------------------------------------
# Web
# ------------------------------------------------------------------------------
FROM base AS web

COPY --from=dependencies ${DEPS_HOME}/package.json ${APP_HOME}/package.json
COPY --from=dependencies ${DEPS_HOME}/package-lock.json ${APP_HOME}/package-lock.json
COPY --from=dependencies ${DEPS_HOME}/node_modules ${APP_HOME}/node_modules

ARG current_sha
ARG time_of_build

ENV CURRENT_SHA=$current_sha
ENV TIME_OF_BUILD=$time_of_build

RUN mkdir -p ${APP_HOME}
WORKDIR ${APP_HOME}

COPY . ${APP_HOME}

RUN if [ "$NODE_ENV" = "production" ]; then \
  npm run build:assets:prod && \
  npm run build; \
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
FROM base AS test

RUN mkdir -p ${TEST_HOME}
WORKDIR ${TEST_HOME}

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

COPY --from=dependencies ${DEPS_HOME}/package.json ${TEST_HOME}/package.json
COPY --from=dependencies ${DEPS_HOME}/package-lock.json ${TEST_HOME}/package-lock.json
COPY --from=dependencies ${DEPS_HOME}/node_modules ${TEST_HOME}/node_modules
COPY --from=dependencies /root/.cache/Cypress /root/.cache/Cypress

COPY --from=web ${APP_HOME} ${TEST_HOME}
