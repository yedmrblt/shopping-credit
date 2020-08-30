const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const creditRuleRoutes = require('./routes/credit-rule');
const creditRoutes = require('./routes/credit');
const shoppingHistoryRoutes = require('./routes/shopping-history');
const paymentRoutes = require('./routes/payment');

app.use('/public', express.static('public'))

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/credit-rule', creditRuleRoutes);
app.use('/credit', creditRoutes);
app.use('/shopping-history', shoppingHistoryRoutes);
app.use('/payment', paymentRoutes);

app.use((req, res, next) => {
  const error = new Error('Not Found!');
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;