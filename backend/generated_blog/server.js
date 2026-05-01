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
app.use(helmet()); app.use(cors()); app.use(express.json()); app.use(morgan('dev'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesPath = path.join(__dirname, 'routes');

if (fs.existsSync(routesPath)) {
  for (const file of fs.readdirSync(routesPath).filter(f => f.endsWith('.js'))) {
    const mod = await import(`./routes/${file}`);
    app.use(`/api/${file.split('.')[0]}`, mod.default);
  }
}

app.get('/', (req, res) => res.send('API running'));
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/generated-db')
  .then(() => { console.log('DB connected'); app.listen(PORT, () => console.log(`Port ${PORT}`)); })
  .catch(err => console.error(err));