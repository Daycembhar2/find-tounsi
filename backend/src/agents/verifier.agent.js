const { aiChat } = require('../services/ai.service');

const SYSTEM_PROMPT = `Tu es un agent de vérification de l'origine des produits pour "Find Tounsi".

Quand on te donne des informations sur un produit, tu dois analyser si le produit est tunisien ou non.

Réponds TOUJOURS en JSON valide avec ce format exact sans markdown :
{
  "is_tunisian": true,
  "confidence": "high",
  "reason": "explication courte",
  "impact": "impact économique si tunisien sinon null",
  "alternative": "alternative tunisienne si pas tunisien sinon null"
}`;

const verify = async (productInfo) => {
  const messages = [
    {
      role    : 'user',
      content : `Analyse ce produit : ${JSON.stringify(productInfo)}`
    }
  ];

  const response = await aiChat(messages, SYSTEM_PROMPT);

  try {
    const clean = response.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      is_tunisian : false,
      confidence  : 'low',
      reason      : response,
      impact      : null,
      alternative : null,
    };
  }
};

module.exports = { verify };