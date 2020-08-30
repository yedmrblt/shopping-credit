const mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'admin1234',
  database: 'colendi',
  timezone: 'utc',
  multipleStatements: true
});

module.exports = pool;