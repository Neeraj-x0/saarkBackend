const { Server } = require('socket.io');

let io = null;

/**
 * Sets up the Socket.IO server and event listeners
 * @param {Object} server - HTTP server
 */
function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join user to their room using their ID
    socket.on('join', (userId) => {
      if (!userId) {
        console.warn('join event missing userId');
        return;
      }

      socket.join(userId);
      console.log(`User ${userId} joined their socket room`);
      socket.emit('joinConfirmation', {
        message: 'Connected and listening for task updates'
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Attach task-related socket logic
  require('./sockets/task.socket')(io);

  // Save io globally for controller use
  global._io = io;
}

module.exports = { initializeSocket };
