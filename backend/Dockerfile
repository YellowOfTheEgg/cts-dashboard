FROM python:3.10

RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./setup.py /usr/src/app/setup.py
RUN pip install -e .

COPY  ./app /usr/src/app/app
COPY ./run.sh /usr/src/app/run.sh

CMD ["sh","/usr/src/app/run.sh"]