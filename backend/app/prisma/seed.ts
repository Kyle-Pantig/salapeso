import { PrismaClient, WalletType } from '@prisma/client'

const prisma = new PrismaClient()

const wallets = [
  // E-Wallets
  { slug: 'gcash', logo: '/wallets/gcash.png', type: WalletType.EWALLET },
  { slug: 'maya', logo: '/wallets/maya.png', type: WalletType.EWALLET },
  { slug: 'grabpay', logo: '/wallets/grabpay.png', type: WalletType.EWALLET },
  { slug: 'shopeepay', logo: '/wallets/shopeepay.png', type: WalletType.EWALLET },
  { slug: 'coins', logo: '/wallets/coins.png', type: WalletType.EWALLET },
  { slug: 'paypal', logo: '/wallets/paypal.png', type: WalletType.EWALLET },
  
  // Banks
  { slug: 'bpi', logo: '/wallets/bpi.png', type: WalletType.BANK },
  { slug: 'bdo', logo: '/wallets/bdo.png', type: WalletType.BANK },
  { slug: 'metrobank', logo: '/wallets/metrobank.png', type: WalletType.BANK },
  { slug: 'landbank', logo: '/wallets/landbank.png', type: WalletType.BANK },
  { slug: 'unionbank', logo: '/wallets/unionbank.png', type: WalletType.BANK },
  { slug: 'chinabank', logo: '/wallets/chinabank.png', type: WalletType.BANK },
  { slug: 'pnb', logo: '/wallets/pnb.png', type: WalletType.BANK },
  { slug: 'securitybank', logo: '/wallets/securitybank.png', type: WalletType.BANK },
  { slug: 'rcbc', logo: '/wallets/rcbc.png', type: WalletType.BANK },
  { slug: 'eastwest', logo: '/wallets/eastwest.png', type: WalletType.BANK },
  { slug: 'cimb', logo: '/wallets/cimb.png', type: WalletType.BANK },
  { slug: 'ing', logo: '/wallets/ing.png', type: WalletType.BANK },
  { slug: 'gotyme', logo: '/wallets/gotyme.png', type: WalletType.BANK },
  { slug: 'tonik', logo: '/wallets/tonik.png', type: WalletType.BANK },
  { slug: 'seabank', logo: '/wallets/seabank.png', type: WalletType.BANK },
  { slug: 'maya-bank', logo: '/wallets/maya-bank.png', type: WalletType.BANK },
  
  // Cash
  { slug: 'cash', logo: '/wallets/cash.png', type: WalletType.CASH },
  { slug: 'piggy-bank', logo: '/wallets/piggy-bank.png', type: WalletType.CASH },
  
  // Other
  { slug: 'other', logo: '/wallets/other.png', type: WalletType.OTHER },
]

async function main() {
  console.log('🌱 Seeding wallets...')
  
  for (const wallet of wallets) {
    await prisma.wallet.upsert({
      where: { slug: wallet.slug },
      update: { logo: wallet.logo, type: wallet.type },
      create: wallet,
    })
    console.log(`  ✅ ${wallet.slug}`)
  }
  
  console.log('✨ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

