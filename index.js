const express = require('express');
const connectDb = require("./config/db");
require("dotenv").config();
const session = require('express-session')

const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const notFound = require("./middleware/notFound");
const logger = require('./middleware/logger');
// const RateLimit = require('express-rate-limit');
// const limiter = new RateLimit({
//   windowMs: 15*60*1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   delayMs: 0 // disable delaying — full speed until the max limit is  reached
// });

const app = express();
const port = process.env.NODE_HOST || 3001;
app.use(cors());
app.use(logger);
// app.use(auth.jwt);
// app.use(auth.errorHandler);
connectDb();

// apply to all requests
// app.use(limiter);
app.use(helmet());
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 's3Cur3',
  name: 'sessionId',
  cookie: { httpOnly: true, secure: true }
}));

app.use(express.json());
app.use('/api', routes);
app.use(notFound);

// https.createServer({
//   key: fs.readFileSync(process.env.CERT_KEY),
//   cert: fs.readFileSync(process.env.CERT)
// }, app).listen(port, () => console.log('Listening to port ' + port));

app.listen(port, () => console.log('Listening to port ' + port))