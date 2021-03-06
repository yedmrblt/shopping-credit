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
      var sqlQuery = 'SELECT * FROM products';
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

router.get('/:productId', (req, res, next) => {
  const productId = req.params.productId;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'SELECT * FROM products WHERE product_id = ?';
      const inserts = [productId];
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

module.exports = router;