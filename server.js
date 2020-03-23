// Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

// Tell server where to look for files
app.use(express.static('public'));
app.get('/', (req, res) => res.redirect('/player'));

// Create socket connection
let io = require('socket.io').listen(server);

// Keep track of queue
let queue = [];
let colorMap = {};
let q = -1;
let current;

let getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Listen for individual clients to connect
io.sockets.on('connection',
  // Callback function on connection
  // Comes back with a socket object
  function (socket) {

    console.log("We have a new client: " + socket.id);

    // Add socket to queue
    queue.push(socket);
    // Assign unique color
    colorMap[socket.id] = getRandomColor()

    // Kick off queue as soon as there's 1 person in line
    if (q < 0 && queue.length > 1) {
      next(true);
    }

    // Ready for next
    socket.on('next', function () {
      next(true);
    });

    socket.on('draw', function(data) {
      // just pass the data to all other sockets along with the current color
      io.sockets.emit('draw', {
        socket_id: socket.id,
        color: colorMap[socket.id],
        data: data,
      })
    });

    // Listen for this client to disconnect
    // Tell everyone client has disconnected
    socket.on('disconnect', function() {
      // Tell everyone someone
      io.sockets.emit('disconnected', socket.id);

      // Remove socket from queue
      for(let s = 0; s < queue.length; s++) {
        console.log(queue[s].id, socket.id);
        if(queue[s].id == socket.id) {
          console.log("Remove from queue: ", socket.id);
          // Remove from queue
          queue.splice(s, 1);
          // If current client disconnected, set new current
          if (socket === current) next(false);
        }
      }
    });
  });

// Get next client
function next(advance) {
  // Move to next person in line
  if(advance) q++;
  // When we reach the end, wrap around to the beginning
  if(q >= queue.length) q = 0;
  console.log("NEXT UP: ", q, queue.length);

  // Set current socket
  current = queue[q];
  current.emit('go');
}
