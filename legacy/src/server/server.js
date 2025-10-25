import * as Http from "http";
import *  as Https from "https";
import * as fs from "fs";
import * as path from "path";

export const Server = class {
  // Accept a configuration object and a request handler (your future router)
  constructor(config, requestHandler) {
    this.config = {
      hostname: 'localhost',
      httpPort: 80,
      httpsPort: 443,
      certsPath: './public/certs',
      ...config // Allow user to override defaults
    };
    this.requestHandler = requestHandler || this.defaultHandler;

    this.httpServer = Http.createServer(this.requestHandler);

    try {
      const options = {
        key: fs.readFileSync(path.join(this.config.certsPath, 'localhost.key.pem')),
        cert: fs.readFileSync(path.join(this.config.certsPath, 'localhost.cert.pem'))
      };
      this.httpsServer = Https.createServer(options, this.requestHandler);
    } catch (error) {
      console.warn(`Could not create HTTPS server. Did you generate SSL certificates? Error: ${error.message}`);
      this.httpsServer = null;
    }
  }

  // A default handler if none is provided
  defaultHandler(req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("JS-AppML Server is running.\n");
  }

  start() {
    const { hostname, httpPort, httpsPort } = this.config;

    this.httpServer.listen(httpPort, hostname, () => { console.log(`Server running at http://${hostname}:${httpPort}/`)});

    if (this.httpsServer) {
      this.httpsServer.listen(httpsPort, hostname, () => { console.log(`Server running at https://${hostname}:${httpsPort}/`)});
    }
  }

}