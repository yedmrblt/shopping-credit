const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const pool = require('../dbconfig');

router.get('/', (req, res, next) => {
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'SELECT shopping_history.user_id, product_name, merchant_name FROM shopping_history INNER JOIN products ON products.product_id = shopping_history.product_id INNER JOIN credits ON credits.credit_id = shopping_history.credit_id';
      conn.query(sqlQuery, (error, result, fields) => {
        if (error) {
          res.status(500).json({
            error: error
          });
        } else {
          res.status(200).json({
            message: result
          });
        }
        conn.release();
      });
    }
  });
});

router.get('/:shoppingId', (req, res, next) => {
  const shoppingId = req.params.shoppingId;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'SELECT shopping_history.user_id, product_name, merchant_name FROM shopping_history INNER JOIN products ON products.product_id = shopping_history.product_id INNER JOIN credits ON credits.credit_id = shopping_history.credit_id WHERE shopping_history_id = ?';
      const inserts = [shoppingId];
      sqlQuery = mysql.format(sqlQuery, inserts);
      conn.query(sqlQuery, (error, result, fields) => {
        if (error) {
          res.status(500).json({
            error: error
          });
        } else {
          if (result.length === 1) {
            res.status(200).json({
              message: result
            });
          } else {
            res.status(409).json({
              message: 'Please check the given inputs!'
            });
          }
        }
        conn.release();
      });
    }
  });
});

router.get('/user/:userId', (req, res, next) => {
  const userId = req.params.userId;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'SELECT product_name, merchant_name FROM shopping_history INNER JOIN products ON products.product_id = shopping_history.product_id INNER JOIN credits ON credits.credit_id = shopping_history.credit_id WHERE shopping_history.user_id = ?';
      const inserts = [userId];
      sqlQuery = mysql.format(sqlQuery, inserts);
      conn.query(sqlQuery, (error, result, fields) => {
        if (error) {
          res.status(500).json({
            error: error
          });
        } else {
          res.status(200).json({
            message: result
          });
        }
        conn.release();
      });
    }
  });
});

router.post('/create', (req, res, next) => {
  const userId = req.body.userId;
  const creditId = req.body.creditId;
  const productId = req.body.productId;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'INSERT INTO shopping_history (user_id, credit_id, product_id) VALUES (?,?,?)';
      const inserts = [userId, creditId, productId];
      sqlQuery = mysql.format(sqlQuery, inserts);
      conn.query(sqlQuery, (error, result, fields) => {
        if (error) {
          res.status(500).json({
            error: error
          });
        } else {
          if (result.affectedRows === 1) {
            res.status(201).json({
              message: 'Shopping history created!'
            });
          } else {
            res.status(409).json({
              message: 'Please check the given inputs!'
            });
          }
        }
        conn.release();
      });
    }
  });
});

module.exports = router;