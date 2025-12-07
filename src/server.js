const app = require('./app');
const config = require('./config');

const port = config.server.port;

app.listen(port, () => {
  console.log(`Document extraction service listening on port ${port}`);
});
