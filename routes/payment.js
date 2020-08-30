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
      var sqlQuery = 'SELECT * FROM payments';
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

router.get('/:paymentId', (req, res, next) => {
  const paymentId = req.params.paymentId;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'SELECT * FROM payments WHERE payment_id = ?';
      const inserts = [paymentId];
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

router.post('/credit/:creditId', (req, res, next) => {
  const creditId = req.params.creditId;
  const userId = req.body.userId;
  const paymentAmount = req.body.paymentAmount;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      conn.beginTransaction((err) => {
        if (err) {
          res.status(500).json({
            error: err
          });
        } else {
          var debtQuery = 'UPDATE credits SET total_debt_amount = total_debt_amount - ? WHERE credit_id = ?';
          const debtInserts = [paymentAmount, creditId];
          debtQuery = mysql.format(debtQuery, debtInserts);
          conn.query(debtQuery, (error, result, fields) => {
            if (error) {
              res.status(500).json({
                error: error
              });
            } else {
              var sqlQuery = 'INSERT INTO payments (user_id, credit_id, payment_amount) VALUES (?,?,?)';
              const inserts = [userId, creditId, paymentAmount];
              sqlQuery = mysql.format(sqlQuery, inserts);
              conn.query(sqlQuery, (error, result, fields) => {
                if (error) {
                  res.status(500).json({
                    error: error
                  });
                } else {
                  if (result.affectedRows === 1) {
                    conn.commit((err) => {
                      if (err) {
                        conn.rollback(() => {
                          res.status(500).json({
                            error: err
                          });
                        });
                      } else {
                        res.status(201).json({
                          message: 'payment created!',
                        });
                      }
                    });
                  } else {
                    conn.rollback(() => {
                      res.status(409).json({
                        message: 'Please check the given inputs!'
                      });
                    });
                  }
                }
              });
            }
          });
        }
      });
      conn.release();
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
      var sqlQuery = 'SELECT * FROM payments WHERE user_id = ?';
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


module.exports = router;