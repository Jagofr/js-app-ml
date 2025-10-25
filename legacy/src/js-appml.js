import { Server } from "./server/server.js";
import { Router } from "./server/router.js";
import * as fs from "fs";


export const JSAppML = class {
  constructor() {
    const router = new Router();

    // --- Define Your Application Routes Here ---

    router.get('/', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Welcome to the homepage!');
    });

    router.get('/about', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ project: 'JS-App-ML', version: '1.0.0' }));
    });

    router.get('/test', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync('./src/client/test.html'));
    });

    // Pass the router's handler to the server.
    this.server = new Server({}, router.handleRequest.bind(router));
    this.start();
  }
  start() {
    this.server.start();
  }
}