const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

const sessionData = require('./middleware/session-data');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(sessionData);

app.use(authRoutes);
app.use(shopRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('shop/error', { message: 'Page not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('shop/error', { message: 'Unexpected server error' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Fashion store running on http://localhost:${port}`);
});
