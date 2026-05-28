const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Initialize Next.js app in production (dev = false or dynamic depending on NODE_ENV)
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling request:", req.url, err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    })
      .once("error", (err) => {
        console.error("Server Startup Error:", err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Next.js Server ready on port ${port}`);
      });
  })
  .catch((err) => {
    console.error("Next.js Initialization Error:", err);
    process.exit(1);
  });
