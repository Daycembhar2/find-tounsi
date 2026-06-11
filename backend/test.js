const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('GROQ:', process.env.GROQ_API_KEY);
console.log('PORT:', process.env.PORT);