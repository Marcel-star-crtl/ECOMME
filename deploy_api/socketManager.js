// // socketManager.js
// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = require("socket.io")(httpServer);
//     return io;
//   },
//   getIO: () => {
//     if (!io) {
//       throw new Error("Socket.io not initialized!");
//     }
//     return io;
//   },
// };



const socketManager = {
    io: null,
  
    init(ioInstance) {
      this.io = ioInstance;
    },
  
    getIO() {
      if (!this.io) {
        throw new Error('Socket.IO not initialized!');
      }
      return this.io;
    },
  
    emitNewOrder(orderId, status) {
      console.log('Emitting newOrder event:', { orderId, status });
      this.getIO().emit('newOrder', { orderId, status });
    },
  
    emitOrderStatusUpdate(orderId, status, dispatchedAt, expectedDeliveryAt) {
      console.log('Emitting orderStatusUpdate event:', { orderId, status, dispatchedAt, expectedDeliveryAt });
      this.getIO().emit('orderStatusUpdate', { orderId, status, dispatchedAt, expectedDeliveryAt });
    },

    emitNewEnquiry(enquiry) {
        console.log('Emitting newEnquiry event:', enquiry);
        this.getIO().emit('newEnquiry', enquiry);
    }
};

module.exports = socketManager;