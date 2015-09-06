var server = require('http').createServer()
    , wss = require('./src/wss').createWSS(server)
    , express = require('express')
    , app = express()
    , port = 4080;

app.use(function (req, res) {
    res.send({msg: "hello"});
});

server.on('request', app);
server.listen(port, function () {
    console.log('Listening on ' + server.address().port);
});