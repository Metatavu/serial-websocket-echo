const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');
const SerialPort = require('serialport');
const http = require('http');

const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean, description: 'display this help text' },
  { name: 'device', alias: 'D', type: String, description: 'device to listen for data' },
  { name: 'baudrate', alias: 'b', type: Number, defaultValue: 9600, description: 'baudrate that will be used (default value: 9600)' },
  { name: 'port', alias: 'p', type: Number, defaultValue: 8000, description: 'port that websocket server will listen (default value: 8000)' }
];

const usage = getUsage([{
  header: 'Serial websocket echo',
  content: 'Small commandline application that sends messages received from serialport thru websocket.'
}, {
  header: 'Options',
  optionList: optionDefinitions
}, {
  content: 'Project home: [underline]{https://github.com/Metatavu/serial-websocket-echo}'
}]);

const options = commandLineArgs(optionDefinitions);

if (options.help || !options.device || isNaN(options.baudrate) || isNaN(options.port)) {
  console.log(usage);
} else {
  var port = new SerialPort(options.device, {
    baudRate: options.baudrate,
    parser: SerialPort.parsers.readline('\n')
  }, (err) => {
    if (err) {
      console.error('Error connecting to serialport: ', err.message);
    } else {
      console.log('Connected to device, starting server...');
      var connections = [];

      var server = http.createServer((req, res) => {
        res.writeHead(404);
        res.end();
      });

      var io = require('socket.io')(server);

      io.on('connection', (socket) => {
        console.log('client connected');
      });

      port.on('data', (data) => {
        console.log('Received data: ' + data);
        io.emit('data-received', data);
      });

      server.listen(options.port, () => {
        console.log('Listening to: ' + options.port);
      });
    }
  });
}