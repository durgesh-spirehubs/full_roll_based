import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import { fileURLToPath, pathToFileURL } from 'url';
import configJson from "../config/config.json" with {type:"json"}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = {};
const env = process.env.NODE_ENV || 'development';
const config = configJson[env];
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// ✅ Load all model files dynamically
for (const file of fs.readdirSync(__dirname)) {
  if (file.endsWith('.js') && file !== path.basename(__filename)) {
    const modelPath = pathToFileURL(path.join(__dirname, file)).href;
    const modelModule = await import(modelPath);
    const model = modelModule.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }
}

// ✅ Setup associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
