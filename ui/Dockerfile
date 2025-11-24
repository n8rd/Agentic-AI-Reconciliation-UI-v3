FROM node:20

WORKDIR /ui

COPY package*.json ./
RUN npm install

COPY . .

# Add empty __init__.py (not used by Node but included for your requirement)
RUN touch __init__.py

RUN npm run build

RUN npm install -g serve

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "serve -s build -l ${PORT}"]

