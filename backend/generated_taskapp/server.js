import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Dynamically load routes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesPath = path.join(__dirname, 'routes');

if (fs.existsSync(routesPath)) {
  const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));
  for (const file of routeFiles) {
    const routeModule = await import(`./routes/${file}`);
    const routeName = file.split('.')[0];
    app.use(`/api/${routeName}`, routeModule.default);
  }
}

app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/generated-db')
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ DB Connection Error:', err));
