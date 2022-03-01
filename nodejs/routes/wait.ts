import type {Request, Response, NextFunction} from 'express';

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
    res.render('wait', { 
        title: 'LivePaper: LOADING',
    });  
});

module.exports = router;
