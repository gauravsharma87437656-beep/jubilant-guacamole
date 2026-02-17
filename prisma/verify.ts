import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const brands = await prisma.brand.count()
  const banners = await prisma.banner.count()
  const categories = await prisma.category.count()
  const products = await prisma.product.count()
  const vendors = await prisma.vendor.count()
  const users = await prisma.user.count()

  console.log('=== Database Stats ===')
  console.log('Brands:', brands)
  console.log('Banners:', banners)
  console.log('Categories:', categories)
  console.log('Products:', products)
  console.log('Vendors:', vendors)
  console.log('Users:', users)
  console.log('=====================')
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
