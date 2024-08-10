const express = require("express");
const bodyParser = require("body-parser");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const socketManager = require("./socketManager");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const prodcategoryRouter = require("./routes/prodcategoryRoute");
const brandRouter = require("./routes/brandRoute");
const colorRouter = require("./routes/colorRoute");
const enqRouter = require("./routes/enqRoute");
const couponRouter = require("./routes/couponRoute");
const uploadRouter = require("./routes/uploadRoute");
const paypalRouter = require("./routes/paypal");
const orderRoutes = require("./routes/orderRoutes");
const faqRouter = require('./routes/faqRoutes');

// Connect to the database
dbConnect();

// Middleware
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});

// Initialize socketManager with the io instance
socketManager.init(io);

// WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use("/api/user", authRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/product", productRouter);
app.use("/api/category", prodcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/paypal", paypalRouter);
app.use('/api/faq', faqRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});