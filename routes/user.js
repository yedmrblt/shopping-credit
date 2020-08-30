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
      var sqlQuery = 'SELECT * FROM users';
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

router.post('/login', (req, res, next) => {
  const fullName = req.body.fullName;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'SELECT user_id FROM users WHERE full_name = ?';
      var inserts = [fullName];
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

router.post('/create', (req, res, next) => {
  const fullName = req.body.fullName;
  const registerDate = req.body.registerDate;
  const creditLimit = req.body.creditLimit;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'INSERT INTO users (full_name, register_date, credit_limit) VALUES (?,?,?)';
      const inserts = [fullName, registerDate, creditLimit];
      sqlQuery = mysql.format(sqlQuery, inserts);
      conn.query(sqlQuery, (error, result, fields) => {
        if (error) {
          res.status(500).json({
            error: error
          });
        } else {
          if (result.affectedRows === 1) {
            res.status(201).json({
              message: 'User created!'
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

router.get('/:userId', (req, res, next) => {
  const userId = req.params.userId;
  pool.getConnection((err, conn) => {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      var sqlQuery = 'SELECT * FROM users WHERE user_id = ?';
      const inserts = [userId];
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