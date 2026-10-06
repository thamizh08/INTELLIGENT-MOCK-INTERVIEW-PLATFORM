// server.js
// Entry point of the application.
// Its only job is: load environment variables, connect to the database,
// then start the Express app (which lives in src/app.js) listening on a port.

require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, only start listening for requests once that succeeds.
// This avoids a situation where the server accepts requests before the DB is ready.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database. Server not started.', err);
    process.exit(1);
  });
