FROM python:3.12-slim

ENV INSTALL_PATH /api
RUN mkdir -p INSTALL_PATH 

WORKDIR $INSTALL_PATH

# COPY . .
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
