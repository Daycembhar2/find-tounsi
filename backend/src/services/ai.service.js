const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { CohereClient } = require('cohere-ai');

const client = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const aiChat = async (messages, systemPrompt) => {
  try {
    // Convertir les messages au format Cohere
    const chatHistory = messages.slice(0, -1).map(m => ({
      role    : m.role === 'assistant' ? 'CHATBOT' : 'USER',
      message : m.content,
    }));

    const lastMessage = messages[messages.length - 1].content;

    const response = await client.chat({
      model : 'command-r-plus-08-2024',
      preamble    : systemPrompt,
      chatHistory,
      message     : lastMessage,
    });

    return response.text;

  } catch (e) {
    console.error('Cohere API error:', e.message);
    throw new Error('Erreur agent IA');
  }
};

module.exports = { aiChat };