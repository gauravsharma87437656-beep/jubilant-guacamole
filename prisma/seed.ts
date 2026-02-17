import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create Brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'sabyasachi' },
      update: { logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop' },
      create: {
        name: 'Sabyasachi',
        slug: 'sabyasachi',
        logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
        description: 'Sabyasachi - The king of ethnic wear',
        website: 'https://sabyasachi.com',
        isActive: true,
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'manish-malhotra' },
      update: { logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=400&auto=format&fit=crop' },
      create: {
        name: 'Manish Malhotra',
        slug: 'manish-malhotra',
        logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=400&auto=format&fit=crop',
        description: 'Manish Malhotra - Bollywood favorite',
        website: 'https://manishmalhotra.com',
        isActive: true,
        isFeatured: true,
        sortOrder: 2,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'anita-dongre' },
      update: { logo: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=400&auto=format&fit=crop' },
      create: {
        name: 'Anita Dongre',
        slug: 'anita-dongre',
        logo: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=400&auto=format&fit=crop',
        description: 'Anita Dongre - Sustainable ethnic fashion',
        website: 'https://anitadongre.com',
        isActive: true,
        isFeatured: true,
        sortOrder: 3,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'ritu-kumar' },
      update: { logo: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=400&auto=format&fit=crop' },
      create: {
        name: 'Ritu Kumar',
        slug: 'ritu-kumar',
        logo: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=400&auto=format&fit=crop',
        description: 'Ritu Kumar - Luxury pret',
        website: 'https://ritukumar.com',
        isActive: true,
        isFeatured: true,
        sortOrder: 4,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'manyavar' },
      update: { logo: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=400&auto=format&fit=crop' },
      create: {
        name: 'Manyavar',
        slug: 'manyavar',
        logo: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=400&auto=format&fit=crop',
        description: 'Manyavar - Mens ethnic wear',
        website: 'https://manyavar.com',
        isActive: true,
        isFeatured: true,
        sortOrder: 5,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'tarun-tahiliani' },
      update: { logo: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop' },
      create: {
        name: 'Tarun Tahiliani',
        slug: 'tarun-tahiliani',
        logo: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop',
        description: 'Tarun Tahiliani - Bridge to luxury',
        website: 'https://taruntahiliani.com',
        isActive: true,
        isFeatured: true,
        sortOrder: 6,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'raghavendra-rathore' },
      update: { logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
      create: {
        name: 'Raghavendra Rathore',
        slug: 'raghavendra-rathore',
        logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
        description: 'Raghavendra Rathore - Bandhgala king',
        website: 'https://raghavendra-rathore.com',
        isActive: true,
        isFeatured: false,
        sortOrder: 7,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'anushree-reddy' },
      update: { logo: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop' },
      create: {
        name: 'Anushree Reddy',
        slug: 'anushree-reddy',
        logo: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop',
        description: 'Anushree Reddy - Modern ethnic',
        website: 'https://anushreereddy.com',
        isActive: true,
        isFeatured: false,
        sortOrder: 8,
      },
    }),
  ])

  console.log(`Created ${brands.length} brands`)

  // Create Banners
  const banners = await Promise.all([
    prisma.banner.upsert({
      where: { id: 'banner-1' },
      update: { image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2670&auto=format&fit=crop' },
      create: {
        id: 'banner-1',
        title: 'CULTURE CUPID SALE IS BACK',
        subtitle: 'Get Upto 75% Off On Your Favourite Ethnic Wear',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2670&auto=format&fit=crop',
        link: '/categories/wedding',
        position: 'home',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.banner.upsert({
      where: { id: 'banner-2' },
      update: { image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2670&auto=format&fit=crop' },
      create: {
        id: 'banner-2',
        title: 'Eco-Friendly Fashion',
        subtitle: 'Rent, Wear, Return - Save the Environment',
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2670&auto=format&fit=crop',
        link: '/categories/party',
        position: 'home',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.banner.upsert({
      where: { id: 'banner-3' },
      update: { image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2670&auto=format&fit=crop' },
      create: {
        id: 'banner-3',
        title: 'Premium Ethnic Wear',
        subtitle: 'For Every Occasion',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2670&auto=format&fit=crop',
        link: '/categories/formal',
        position: 'home',
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.banner.upsert({
      where: { id: 'banner-4' },
      update: { image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=2670&auto=format&fit=crop' },
      create: {
        id: 'banner-4',
        title: 'Designer Lehengas',
        subtitle: 'Starting at ₹2,999',
        image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=2670&auto=format&fit=crop',
        link: '/categories/wedding',
        position: 'home',
        isActive: true,
        sortOrder: 4,
      },
    }),
  ])

  console.log(`Created ${banners.length} banners`)

  // Create Categories
  const weddingCat = await prisma.category.upsert({
    where: { slug: 'wedding' },
    update: { image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop' },
    create: {
      name: 'Wedding',
      slug: 'wedding',
      description: 'Wedding collection',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      isActive: true,
      sortOrder: 1,
    },
  })

  const partyCat = await prisma.category.upsert({
    where: { slug: 'party' },
    update: { image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop' },
    create: {
      name: 'Party',
      slug: 'party',
      description: 'Party wear collection',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
      isActive: true,
      sortOrder: 2,
    },
  })

  const formalCat = await prisma.category.upsert({
    where: { slug: 'formal' },
    update: { image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop' },
    create: {
      name: 'Formal',
      slug: 'formal',
      description: 'Formal wear collection',
      image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop',
      isActive: true,
      sortOrder: 3,
    },
  })

  const casualCat = await prisma.category.upsert({
    where: { slug: 'casual' },
    update: { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800&auto=format&fit=crop' },
    create: {
      name: 'Casual',
      slug: 'casual',
      description: 'Casual wear collection',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800&auto=format&fit=crop',
      isActive: true,
      sortOrder: 4,
    },
  })

  console.log('Created categories')

  // Create a demo user first (needed for vendor)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@rentsquare.com' },
    update: {},
    create: {
      email: 'demo@rentsquare.com',
      name: 'Demo Vendor',
      password: '$2a$10$rQZQZQZQZQZQZQZQZQZQZ.O9Y1Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', // dummy hash
      role: 'VENDOR',
      isActive: true,
    },
  })

  // Create a demo vendor
  const demoVendor = await prisma.vendor.upsert({
    where: { businessSlug: 'demo-vendor' },
    update: {},
    create: {
      userId: demoUser.id,
      businessName: 'Demo Vendor',
      businessSlug: 'demo-vendor',
      description: 'Demo vendor for testing',
      status: 'APPROVED',
      isVerified: true,
    },
  })

  console.log('Created demo vendor:', demoVendor.id)

  // Get brand IDs for products
  const sabyasachiBrand = await prisma.brand.findUnique({ where: { slug: 'sabyasachi' } })
  const manishMalhotraBrand = await prisma.brand.findUnique({ where: { slug: 'manish-malhotra' } })
  const anitaDongreBrand = await prisma.brand.findUnique({ where: { slug: 'anita-dongre' } })
  const rituKumarBrand = await prisma.brand.findUnique({ where: { slug: 'ritu-kumar' } })
  const manyavarBrand = await prisma.brand.findUnique({ where: { slug: 'manyavar' } })
  const tarunTahilianiBrand = await prisma.brand.findUnique({ where: { slug: 'tarun-tahiliani' } })
  const raghavendraRathoreBrand = await prisma.brand.findUnique({ where: { slug: 'raghavendra-rathore' } })
  const anushreeReddyBrand = await prisma.brand.findUnique({ where: { slug: 'anushree-reddy' } })

  // Create Products with working Unsplash images
  const products = [
    {
      name: 'Velvet Zardosi Lehenga',
      slug: 'velvet-zardosi-lehenga',
      description: 'Beautiful velvet lehenga with zardosi work',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop'
      ],
      dailyPrice: 12499,
      categoryId: weddingCat.id,
      brandId: sabyasachiBrand?.id,
      isFeatured: true,
    },
    {
      name: 'Midnight Blue Sherwani',
      slug: 'midnight-blue-sherwani',
      description: 'Elegant midnight blue sherwani',
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop'
      ],
      dailyPrice: 8999,
      categoryId: weddingCat.id,
      brandId: manishMalhotraBrand?.id,
      isFeatured: true,
    },
    {
      name: 'Floral Organza Gown',
      slug: 'floral-organza-gown',
      description: 'Stunning floral organza gown',
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=800&auto=format&fit=crop'
      ],
      dailyPrice: 6500,
      categoryId: partyCat.id,
      brandId: anushreeReddyBrand?.id,
      isFeatured: true,
    },
    {
      name: 'Hand-Embroidery Silk Saree',
      slug: 'hand-embroidery-silk-saree',
      description: 'Beautiful silk saree with hand embroidery',
      images: [
        'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'
      ],
      dailyPrice: 4999,
      categoryId: formalCat.id,
      brandId: anitaDongreBrand?.id,
      isFeatured: true,
    },
    {
      name: 'Emerald Green Anarkali',
      slug: 'emerald-green-anarkali',
      description: 'Stunning emerald green Anarkali suit',
      images: [
        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800&auto=format&fit=crop'
      ],
      dailyPrice: 7500,
      categoryId: partyCat.id,
      brandId: rituKumarBrand?.id,
      isFeatured: true,
    },
    {
      name: 'Royal Blue Bandhgala',
      slug: 'royal-blue-bandhgala',
      description: 'Classic royal blue bandhgala suit',
      images: [
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop'
      ],
      dailyPrice: 11000,
      categoryId: formalCat.id,
      brandId: raghavendraRathoreBrand?.id,
      isFeatured: true,
    },
    {
      name: 'Blush Pink Lehenga',
      slug: 'blush-pink-lehenga',
      description: 'Beautiful blush pink lehenga',
      images: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'
      ],
      dailyPrice: 15500,
      categoryId: weddingCat.id,
      brandId: tarunTahilianiBrand?.id,
      isFeatured: true,
    },
    {
      name: 'Ivory Silk Kurta Set',
      slug: 'ivory-silk-kurta-set',
      description: 'Elegant ivory silk kurta set',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop'
      ],
      dailyPrice: 5500,
      categoryId: casualCat.id,
      brandId: manyavarBrand?.id,
      isFeatured: true,
    },
  ]

  // Create products - use update to fix existing broken images
  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: { images: productData.images },
      create: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        images: productData.images,
        dailyPrice: productData.dailyPrice,
        categoryId: productData.categoryId,
        brandId: productData.brandId,
        isFeatured: productData.isFeatured,
        status: 'ACTIVE',
        vendorId: demoVendor.id,
      },
    })
  }

  console.log(`Created ${products.length} products`)

  console.log('Seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
