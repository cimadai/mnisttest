var request = require('request');

var URL = process.env.MNIST_API_URL
var API_KEY = process.env.MNIST_API_KEY

function detectMNIST(inputs, callback) {
    var columnNames = ["Label"];
    for (var f = 0; f < 784; f++) {
        columnNames.push("f" + f);
    }
    var body = {
        Inputs: {
            input1: {
                ColumnNames: columnNames,
                Values: [(['0']).concat(inputs)]
            }
        },
        GlobalParameters: {}
    };
    var options = {
        uri: URL,
        method: "POST",
        json: true,
        headers: {
            "Content-Length": body.length,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": ("Bearer " + API_KEY)
        },
        body: body
    };
    request.post(options, callback);
}

exports.detectMNIST = detectMNIST;
