const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seed...')

  // ── CATÉGORIES ───────────────────────────────────────
  console.log('📁 Création des catégories...')

  const categories = await Promise.all([
    prisma.category.upsert({
      where:  { slug: 'cosmetiques' },
      update: {},
      create: { name: 'Cosmétiques', name_ar: 'مستحضرات التجميل', slug: 'cosmetiques', icon: '/image/cosmetiques.jpg' },
    }),
    prisma.category.upsert({
      where:  { slug: 'vetements' },
      update: {},
      create: { name: 'Vêtements', name_ar: 'ملابس', slug: 'vetements', icon: '/image/vetements.jpg' },
    }),
    prisma.category.upsert({
      where:  { slug: 'artisanat' },
      update: {},
      create: { name: 'Artisanat', name_ar: 'صناعة تقليدية', slug: 'artisanat', icon: '/image/artisanat.jpg' },
    }),
    prisma.category.upsert({
      where:  { slug: 'alimentation' },
      update: {},
      create: { name: 'Alimentation', name_ar: 'غذاء', slug: 'alimentation', icon: '/image/alimentation.jpg' },
    }),
    prisma.category.upsert({
      where:  { slug: 'electronique' },
      update: {},
      create: { name: 'Électronique', name_ar: 'إلكترونيات', slug: 'electronique', icon: '/image/electronique.jpg' },
    }),
    prisma.category.upsert({
      where:  { slug: 'bijoux-tunisiennes' },
      update: {},
      create: { name: 'Bijoux Tunisiennes', name_ar: 'مجوهرات تونسية', slug: 'bijoux-tunisiennes', icon: '/image/bijoux.jpg' },
    }),
  ])

  console.log(`   ✔ ${categories.length} catégories créées`)

  // ── MARQUES ──────────────────────────────────────────
  console.log('🏷️  Création des marques...')

  const brands = await Promise.all([
    prisma.brand.upsert({
      where:  { slug: 'vanoise' },
      update: {},
      create: { name: 'Vanoise', slug: 'vanoise', founded: 1963, description: 'Marque tunisienne de produits alimentaires depuis 1963', logo_url: '/image/vanoise.jpg', is_verified: true },
    }),
    prisma.brand.upsert({
      where:  { slug: 'vitalait' },
      update: {},
      create: { name: 'Vitalait', slug: 'vitalait', founded: 1997, description: 'Produits laitiers tunisiens depuis 1997', logo_url: '/image/vitalait.jpg', is_verified: true },
    }),
    prisma.brand.upsert({
      where:  { slug: 'lilas' },
      update: {},
      create: { name: 'Lilas', slug: 'lilas', founded: 1994, description: "Produits d'hygiène et de soins depuis 1994", logo_url: '/image/lilas.jpg', is_verified: true },
    }),
    prisma.brand.upsert({
      where:  { slug: 'evertek' },
      update: {},
      create: { name: 'Evertek', slug: 'evertek', founded: 2008, description: 'Marque tunisienne de téléphonie et électronique', logo_url: '/image/evertek.jpg', is_verified: true },
    }),
    prisma.brand.upsert({
      where:  { slug: 'hamadi-abid' },
      update: {},
      create: { name: 'Hamadi Abid', slug: 'hamadi-abid', founded: 1990, description: 'Marque de vêtements tunisienne depuis 1990', logo_url: '/image/hamadi-abid.jpg', is_verified: true },
    }),
    prisma.brand.upsert({
      where:  { slug: 'zynia' },
      update: {},
      create: { name: 'Zynia', slug: 'zynia', description: 'Marque tunisienne de cosmétiques naturels', logo_url: '/image/zynia.jpg', is_verified: true },
    }),
    prisma.brand.upsert({
      where:  { slug: 'bako-motors' },
      update: {},
      create: { name: 'Bako Motors', slug: 'bako-motors', description: 'Voiture électrique tunisienne', logo_url: '/image/bako-motors.jpg', is_verified: true },
    }),
  ])

  console.log(`   ✔ ${brands.length} marques créées`)

  // ── RÉGIONS ──────────────────────────────────────────
  console.log('📍 Création des régions...')

  const regions = await Promise.all([
    prisma.region.upsert({
      where:  { slug: 'tunis' },
      update: {},
      create: { name: 'Tunis', name_ar: 'تونس', slug: 'tunis', latitude: 36.8065, longitude: 10.1815 },
    }),
    prisma.region.upsert({
      where:  { slug: 'sfax' },
      update: {},
      create: { name: 'Sfax', name_ar: 'صفاقس', slug: 'sfax', latitude: 34.7406, longitude: 10.7603 },
    }),
    prisma.region.upsert({
      where:  { slug: 'nabeul' },
      update: {},
      create: { name: 'Nabeul', name_ar: 'نابل', slug: 'nabeul', latitude: 36.4561, longitude: 10.7376 },
    }),
    prisma.region.upsert({
      where:  { slug: 'sousse' },
      update: {},
      create: { name: 'Sousse', name_ar: 'سوسة', slug: 'sousse', latitude: 35.8245, longitude: 10.6346 },
    }),
    prisma.region.upsert({
      where:  { slug: 'kairouan' },
      update: {},
      create: { name: 'Kairouan', name_ar: 'القيروان', slug: 'kairouan', latitude: 35.6781, longitude: 10.0963 },
    }),
    prisma.region.upsert({
      where:  { slug: 'djerba' },
      update: {},
      create: { name: 'Djerba', name_ar: 'جربة', slug: 'djerba', latitude: 33.8075, longitude: 10.9904 },
    }),
    prisma.region.upsert({
      where:  { slug: 'bizerte' },
      update: {},
      create: { name: 'Bizerte', name_ar: 'بنزرت', slug: 'bizerte', latitude: 37.2744, longitude: 9.8739 },
    }),
  ])

  console.log(`   ✔ ${regions.length} régions créées`)

  // ── PRODUITS ─────────────────────────────────────────
  console.log('📦 Création des produits...')

  // Récupérer les IDs
  const cosmetiques  = categories.find(c => c.slug === 'cosmetiques')
  const vetements    = categories.find(c => c.slug === 'vetements')
  const artisanat    = categories.find(c => c.slug === 'artisanat')
  const alimentation = categories.find(c => c.slug === 'alimentation')
  const electronique = categories.find(c => c.slug === 'electronique')
  const bijoux       = categories.find(c => c.slug === 'bijoux-tunisiennes')

  const zynia      = brands.find(b => b.slug === 'zynia')
  const bakoMotors = brands.find(b => b.slug === 'bako-motors')

  const sfax    = regions.find(r => r.slug === 'sfax')
  const djerba  = regions.find(r => r.slug === 'djerba')
  const kairouan = regions.find(r => r.slug === 'kairouan')
  const nabeul  = regions.find(r => r.slug === 'nabeul')

  const products = await Promise.all([
    prisma.product.upsert({
      where:  { slug: 'pack-hydratation-zynia' },
      update: {},
      create: { name: 'Pack hydratation Zynia', slug: 'pack-hydratation-zynia', description: 'Pack beauté hydratant Zynia pour peau sèche et sensible', price: 16, image_url: '/image/zynia-pack.jpg', category_id: cosmetiques.id, brand_id: zynia.id, region_id: sfax.id, is_100_percent_tunisian: true },
    }),
    prisma.product.upsert({
      where:  { slug: 'creme-solaire-zynia-visage' },
      update: {},
      create: { name: 'Crème solaire Zynia visage SPF 50+', slug: 'creme-solaire-zynia-visage', description: 'Crème solaire haute protection visage SPF 50+', price: 35, image_url: '/image/creme-solaire.jpg', category_id: cosmetiques.id, brand_id: zynia.id, region_id: sfax.id, is_100_percent_tunisian: true },
    }),
    prisma.product.upsert({
      where:  { slug: 'gel-douche-abricot-zynia' },
      update: {},
      create: { name: 'Gel douche abricot Zynia', slug: 'gel-douche-abricot-zynia', description: 'Gel douche parfum abricot doux et hydratant', price: 9.5, image_url: '/image/gel-douche.jpg', category_id: cosmetiques.id, brand_id: zynia.id, region_id: sfax.id, is_100_percent_tunisian: true },
    }),
    prisma.product.upsert({
      where:  { slug: 'blouza-jerbia' },
      update: {},
      create: { name: 'Blouza Jerbia', slug: 'blouza-jerbia', description: 'Blouza traditionnelle de Djerba en tissu brodé', price: 25, image_url: '/image/blouza-jerbia.jpg', category_id: vetements.id, region_id: djerba.id, is_100_percent_tunisian: true },
    }),
    prisma.product.upsert({
      where:  { slug: 'koufin-tunisienne' },
      update: {},
      create: { name: 'Koufin Tunisienne', slug: 'koufin-tunisienne', description: 'Panier artisanal tressé à la main', price: 14, image_url: '/image/koufin.jpg', category_id: artisanat.id, region_id: kairouan.id, is_100_percent_tunisian: true },
    }),
    prisma.product.upsert({
      where:  { slug: 'huile-olive-1l' },
      update: {},
      create: { name: "Huile d'olive 1L", slug: 'huile-olive-1l', description: "Huile d'olive tunisienne extra vierge 1 litre", price: 15, image_url: '/image/huile-olive.jpg', category_id: alimentation.id, region_id: sfax.id, is_100_percent_tunisian: true },
    }),
    prisma.product.upsert({
      where:  { slug: 'bako-motors-start' },
      update: {},
      create: { name: 'Voiture Bako Motors Version Start', slug: 'bako-motors-start', description: 'Voiture électrique tunisienne version Start', price: 16120, image_url: '/image/bako-motors.jpg', category_id: electronique.id, brand_id: bakoMotors.id, is_100_percent_tunisian: true },
    }),
    prisma.product.upsert({
      where:  { slug: 'bracelet-khomsa' },
      update: {},
      create: { name: 'Bracelet Khomsa', slug: 'bracelet-khomsa', description: 'Bracelet artisanal tunisien avec pendentif Khomsa', price: 10, image_url: '/image/bracelet-khomsa.jpg', category_id: bijoux.id, region_id: nabeul.id, is_100_percent_tunisian: true },
    }),
  ])

  console.log(`   ✔ ${products.length} produits créés`)

  // ── BOYCOTT ──────────────────────────────────────────
  console.log('⛔ Création des items boycott...')

  const boycottItems = await Promise.all([
    prisma.boycottItem.upsert({
      where:  { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000001', name: 'Coca-Cola', name_ar: 'كوكا كولا', reason: 'Multinationale — alternatives tunisiennes disponibles', level: 'HIGH', alternative: 'Boga, Hamoud Boualem', is_active: true },
    }),
    prisma.boycottItem.upsert({
      where:  { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000002', name: 'McDonald\'s', name_ar: 'ماكدونالدز', reason: 'Franchise internationale', level: 'HIGH', alternative: 'Restaurants tunisiens locaux', is_active: true },
    }),
    prisma.boycottItem.upsert({
      where:  { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000003', name: 'Zara', name_ar: 'زارا', reason: 'Délocalisation de production', level: 'MEDIUM', alternative: 'Hamadi Abid, créateurs tunisiens', is_active: true },
    }),
  ])

  console.log(`   ✔ ${boycottItems.length} items boycott créés`)
  console.log('')
  console.log('✅ Seed terminé avec succès !')
  console.log(`   📁 ${categories.length} catégories`)
  console.log(`   🏷️  ${brands.length} marques`)
  console.log(`   📍 ${regions.length} régions`)
  console.log(`   📦 ${products.length} produits`)
  console.log(`   ⛔ ${boycottItems.length} items boycott`)
}

main()
  .catch(e => {
    console.error('❌ Erreur seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })