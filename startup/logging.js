const winston = require('winston');
require('express-async-errors');

module.exports = function() {
    winston.exceptions.handle(
       [ 
        new winston.transports.File({filename: 'exception.log'}), 
        new winston.transports.Console({ colorize: true, prettyPrint: true })
       ]
    )
    
    process.on('unhandledRejection', (ex) => {
        throw ex;
    })
    
    winston.add(new winston.transports.File({ filename: 'logfile.log' }));
    winston.add(new winston.transports.Console());
}