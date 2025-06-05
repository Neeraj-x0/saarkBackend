/**
 * Socket.IO event handler setup for task-related events
 * @param {Object} io - Socket.IO server instance
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join', (userId) => {
      if (!userId) {
        console.error('User ID is required to join a socket room');
        return;
      }
      console.log(`User ${userId} joined their room`);
      socket.join(userId);
      socket.emit('joinConfirmation', { message: `Joined room for user: ${userId}` });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
 
  global._io = io;
};

