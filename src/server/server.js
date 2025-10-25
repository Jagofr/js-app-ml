import * as Http from "http";
import *  as Https from "https";
import * as fs from "fs";
//import { Api } from "../api/api";

export const Server = class {
  constructor() {

    const http = Http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello World\n");
    });

    var options = {
      key: fs.readFileSync('./public/certs/localhost.key.pem'),
      cert: fs.readFileSync('./public/certs/localhost.cert.pem')
    }
    const https = Https.createServer(options, (req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello World\n");
    });
    
    this.init(http, https);
  }

  init(http, https) {
    //const port = 8080;
    const port = 80;
    const portSecure = 443;
    //const portSecure = 8443;


    http.listen(port, 'localhost', () => { console.log(`Server running at http://localhost:${port}/`)});
    https.listen(portSecure, 'localhost', () => { console.log(`Server running at https://localhost:${portSecure}/`)});
  }

}