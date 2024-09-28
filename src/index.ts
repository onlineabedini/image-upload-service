import 'reflect-metadata';
import express, { Application } from 'express';
import { createConnection } from 'typeorm';
import routes from './routes';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

class Server {
    private app: Application;
    private port: number | string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeDatabase();
    }

    private initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private initializeRoutes() {
        this.app.use('/api', routes);
    }

    private initializeDatabase() {
        createConnection()
            .then(() => {
                this.startServer();
            })
            .catch((error) => console.log('Database connection error:', error));
    }

    private startServer() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
    
    public getApp(): Application {
        return this.app;
    }
}

const server = new Server();
export default server.getApp();
