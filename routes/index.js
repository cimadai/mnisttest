var express = require('express');
var mnist = require('../mnist_detect');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', { title: "MNIST test"});
});

router.post('/detect', function(req, res, next) {
    mnist.detectMNIST(req.body, function(err, resp, body) {
        if (!err && resp.statusCode == 200) {
            res.json(body);
        } else {
            console.log('error: '+ resp.statusCode);
            console.log(JSON.stringify(body));
        }
    });
});

module.exports = router;
