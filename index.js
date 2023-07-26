const express = require('express');
const berandaRouter = require('./router/beranda');
const userRouter = require('./router/users');
const skriningRouter = require('./router/skrining');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const flash   = require('express-flash');
const session = require('express-session');

app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/assets', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(session({ 
  cookie: { 
    maxAge: 1800000
  },
  store: new session.MemoryStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}));

app.use(flash());

app.use(berandaRouter); 
app.use(userRouter);
app.use(skriningRouter);
 
app.listen(port, () => {
  console.log(`Skrining app listening on port ${port}`);
});