import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import connect from './config/dbConn.js';
import Register from './routes/register.js';
import Authenticate from './routes/auth.js';
import RefreshToken from './routes/refresh.js';
import Logout from './routes/logout.js';
import Data from './routes/api/playersData.js';
import Access from './routes/access.js';
import ErrorHandler from './config/errorHandler.js';
import corsOptions from './config/corsOptions.js';
import Credentials from './middlewares/credentials.js';
import Notifications from "./routes/api/notifications.js"
import { config } from 'dotenv';
import { verifyTokenHandler } from './middlewares/verifyToken.js';

const app = express();

// MIDDLEWARES
config();
app.use(Credentials);
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
connect();


// PATHS
app.use("/register", Register);

app.use("/auth", Authenticate);

app.use("/refresh", RefreshToken);

// PROTECTED ROUTES
app.use(verifyTokenHandler)

app.use("/logout", Logout);

app.use("/data", Data);

app.use("/access", Access);

app.use("/notifications", Notifications);

// Global Error function
app.use(ErrorHandler)

// DATABASE
mongoose.connection.once('open', () => {
    console.log("Connected To DB");
    app.listen(process.env.PORT, () => { console.log("Server is running at port 3000") })
})