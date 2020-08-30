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
      var sqlQuery = 'SELECT * FROM credits';
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

router.get('/:creditId', (req, res, next) => {
  const creditId = req.params.creditId;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'SELECT * FROM credits WHERE credit_id = ?';
      const inserts = [creditId];
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
      var sqlQuery = 'SELECT * FROM credits WHERE user_id = ?';
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

router.get('/debts/:userId', (req, res, next) => {
  const userId = req.params.userId;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'SELECT merchant_name, total_debt_amount FROM credits WHERE user_id = ?';
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
  const merchantName = req.body.merchantName;
  const locationInfo = req.body.locationInfo;
  const userId = req.body.userId;
  const creditRuleId = req.body.creditRuleId;
  const totalDebtAmount = parseFloat(req.body.totalDebtAmount);
  const amountPerInstallment = req.body.amountPerInstallment;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var userCreditQuery = 'SELECT credit_limit FROM users WHERE user_id = ?';
      const userCreditInserts = [userId];
      userCreditQuery = mysql.format(userCreditQuery, userCreditInserts);
      conn.query(userCreditQuery, (error, result, fields) => {
        if (error) {
          res.status(500).json({
            error: error
          });
        } else {
          if (result.length === 1) {
            const creditLimit = parseFloat(result[0].credit_limit);
            if (creditLimit < totalDebtAmount) {
              res.status(409).json({
                message: 'User have\'n got enough credit limit!'
              });
            } else {

              conn.beginTransaction((err) => {
                if (err) {
                  res.status(500).json({
                    error: err
                  });
                } else {
                  var editUserCreditQuery = 'UPDATE users SET credit_limit = credit_limit - ? WHERE user_id = ?';
                  var editUserCreditInserts = [totalDebtAmount, userId];
                  editUserCreditQuery = mysql.format(editUserCreditQuery, editUserCreditInserts);
                  conn.query(editUserCreditQuery, (error, result, fields) => {
                    if (error) {
                      res.status(500).json({
                        error: error
                      });
                    } else {
                      var creditQuery = 'INSERT INTO credits (merchant_name, location_info, user_id, credit_rule_id, total_debt_amount, amount_per_installment) VALUES (?,?,?,?,?,?)';
                      const creditInserts = [merchantName, locationInfo, userId, creditRuleId, totalDebtAmount, amountPerInstallment];
                      creditQuery = mysql.format(creditQuery, creditInserts);
                      conn.query(creditQuery, (error, result, fields) => {
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
                                  message: 'Credit created!',
                                  creditId: result.insertId
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
            }
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