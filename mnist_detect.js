var request = require('request');

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
        uri: process.env.MNIST_API_URL,
        method: "POST",
        json: true,
        headers: {
            "Content-Length": body.length,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": ("Bearer " + process.env.MNIST_API_KEY)
        },
        body: body
    };
    request.post(options, callback);
}

exports.detectMNIST = detectMNIST;
