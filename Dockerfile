# Base image

FROM phusion/passenger-customizable:0.9.17

# Environment

CMD ["/sbin/my_init"]

EXPOSE 80

#ENV HOME /root
#ENV SERVICE_NAME yatzy
#ENV SERVICE_CHECK_HTTP /
#ENV SERVICE_CHECK_INTERVAL 15s
#ENV SERVICE_TAGS "haproxy-lb-http,public"

RUN export LANGUAGE=en_US.UTF-8 \
    && export LANG=en_US.UTF-8 \
	&& export LC_ALL=en_US.UTF-8 \
	&& locale-gen en_US.UTF-8 \
	&& DEBIAN_FRONTEND=noninteractive dpkg-reconfigure locales

ENV TERM=linux TZ=Etc/UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Refresh

ENV REFRESHED_AT 2015-09-30 10:40:00

# Tools

RUN apt-mark hold initscripts \
    && add-apt-repository -y ppa:mc3man/trusty-media \
    && apt-get -qq update \
    && DEBIAN_FRONTEND=noninteractive apt-get -qq -y upgrade \
    && curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash - \
    && DEBIAN_FRONTEND=noninteractive /pd_build/nodejs.sh \
    && DEBIAN_FRONTEND=noninteractive /pd_build/python.sh \
    && DEBIAN_FRONTEND=noninteractive apt-get -qq -y install nginx findutils \
    && DEBIAN_FRONTEND=noninteractive apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install service
# See https://github.com/phusion/passenger-docker#the-app-user
# See https://github.com/phusion/passenger-docker#using-nginx-and-passenger

ENV APP_ROOT /opt/yatzy
ENV DATA_ROOT ${APP_ROOT}/data

RUN adduser --uid 1000 --disabled-password --gecos "yatzy" yatzy \
    && rm -f /etc/service/nginx/down \
    && rm -f /etc/nginx/sites-enabled/default \
    && mkdir -p ${DATA_ROOT}/projects \
    && chown -R yatzy ${DATA_ROOT}

ADD docker/docker-nginx.conf /etc/nginx/sites-enabled/yatzy.conf
ADD docker/docker-nginx-env.conf /etc/nginx/main.d/yatzy-env.conf

COPY public ${APP_ROOT}/public
COPY src ${APP_ROOT}/src
COPY package.json ${APP_ROOT}/
COPY app.js ${APP_ROOT}/
COPY config.js ${APP_ROOT}/

RUN cd ${APP_ROOT} && npm install && npm update

VOLUME ${DATA_ROOT}