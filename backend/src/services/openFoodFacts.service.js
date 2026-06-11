const axios = require('axios');

const searchByBarcode = async (barcode) => {
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    );

    if (response.data.status === 0) {
      return null; // produit non trouvé
    }

    const p = response.data.product;

    return {
      barcode,
      name          : p.product_name || p.product_name_fr || 'Nom inconnu',
      brand         : p.brands || null,
      country       : p.countries || null,
      origins       : p.origins || null,
      image_url     : p.image_url || null,
      ingredients   : p.ingredients_text || null,
      manufacturing : p.manufacturing_places || null,
    };

  } catch (e) {
    return null;
  }
};

// Vérifie si un produit est tunisien
const isTunisian = (product) => {
  if (!product) return false;

  const fields = [
    product.country,
    product.origins,
    product.manufacturing,
    product.brand,
  ].map(f => (f || '').toLowerCase());

  const keywords = ['tunisia', 'tunisie', 'tunisian', 'تونس'];

  return fields.some(field =>
    keywords.some(keyword => field.includes(keyword))
  );
};

module.exports = { searchByBarcode, isTunisian };