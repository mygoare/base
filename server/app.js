const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');


const config = require('./config');

const { port } = config;

// redis client
const redisClient = require('./redis');

// session
// const session = require('express-session')
// const RedisStore = require('connect-redis')(session)

// csrf protection
const csrfProtection = csrf({ cookie: true });

// create express app
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(cookieParser(config.secret, {
  httpOnly: true,
}));

// redis session
// const redisOpts = {
//     client: redisClient,
//     // Redis session TTL (expiration) in seconds. Defaults to session.cookie.maxAge (if set), or one day.
//     // ttl: 60 * 60 * 12,
// }
// app.use(session({
//     name: config.name,
//     secret: config.secret,
//     resave: false,

//     cookie: {
//         secure: false, // https or not
//         httpOnly: true,
//         maxAge: 1000 * 60 * 60 * 12, // default one day
//     },

//     // deprecated
//     saveUninitialized: true,
//     // default express-session will use memoryStore
//     // store: new RedisStore(redisOpts),
// }))


// use middlewares
app.use(morgan('dev', {
  skip(req, res) { return res.statusCode < 400; },
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set views and view engine
app.set('views', path.resolve(config.baseDir, 'views'));
app.set('view engine', 'ejs');

// set static
app.use('/', express.static(path.resolve(config.baseDir, 'public')));


// routes
app.use('/', require('./routes/'));


// error handling
app.use((err, req, res, next) => {
  console.error('Error: ', err.stack);
  return res.sendStatus(500);
});

// 404
app.use((req, res, next) => res.sendStatus(404));


// mongoConnection.on('error', console.error.bind(console, 'mongodb connection error!!'));
// mongoConnection.once('open', () => {
//   // db connected
//   console.log('mongodb connected...');

//   // app start
//   app.listen(port, () => console.log(`app listen on port ${port}...`));
// });


// app start
app.listen(port, () => console.log(`app listen on port ${port}...`));


module.exports = app;