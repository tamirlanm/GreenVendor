FROM mcr.microsoft.com/mssql/server:2025-latest

USER root

RUN apt-get update \
    && apt-get install -y curl gnupg apt-transport-https \
    && curl -sSL https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl -sSL https://packages.microsoft.com/config/ubuntu/24.04/prod.list \
       -o /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y mssql-tools18 unixodbc-dev \
    && ln -s /opt/mssql-tools18/bin/sqlcmd /usr/local/bin/sqlcmd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER mssql