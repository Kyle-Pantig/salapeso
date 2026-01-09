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
  { slug: 'lazada-wallet', logo: '/wallets/lazada-wallet.png', type: WalletType.EWALLET },
  
  // Digital Banks
  { slug: 'gotyme', logo: '/wallets/gotyme.png', type: WalletType.BANK },
  { slug: 'tonik', logo: '/wallets/tonik.png', type: WalletType.BANK },
  { slug: 'maya-bank', logo: '/wallets/maya-bank.png', type: WalletType.BANK },
  { slug: 'maribank', logo: '/wallets/maribank.png', type: WalletType.BANK },
  { slug: 'cimb', logo: '/wallets/cimb.png', type: WalletType.BANK },
  { slug: 'ing', logo: '/wallets/ing.png', type: WalletType.BANK },
  { slug: 'komo', logo: '/wallets/komo.png', type: WalletType.BANK },
  { slug: 'uno-digital', logo: '/wallets/uno-digital.png', type: WalletType.BANK },
  { slug: 'ownbank', logo: '/wallets/ownbank.png', type: WalletType.BANK },
  { slug: 'ofbank', logo: '/wallets/ofbank.png', type: WalletType.BANK },
  { slug: 'diskartech', logo: '/wallets/diskartech.png', type: WalletType.BANK },
  
  // Major Traditional Banks
  { slug: 'bpi', logo: '/wallets/bpi.png', type: WalletType.BANK },
  { slug: 'bdo', logo: '/wallets/bdo.png', type: WalletType.BANK },
  { slug: 'metrobank', logo: '/wallets/metrobank.png', type: WalletType.BANK },
  { slug: 'landbank', logo: '/wallets/landbank.png', type: WalletType.BANK },
  { slug: 'unionbank', logo: '/wallets/unionbank.png', type: WalletType.BANK },
  { slug: 'pnb', logo: '/wallets/pnb.png', type: WalletType.BANK },
  { slug: 'securitybank', logo: '/wallets/securitybank.png', type: WalletType.BANK },
  { slug: 'rcbc', logo: '/wallets/rcbc.png', type: WalletType.BANK },
  { slug: 'chinabank', logo: '/wallets/chinabank.png', type: WalletType.BANK },
  { slug: 'eastwest', logo: '/wallets/eastwest.png', type: WalletType.BANK },
  
  // Other Philippine Banks
  { slug: 'psbank', logo: '/wallets/psbank.png', type: WalletType.BANK },
  { slug: 'aub', logo: '/wallets/aub.png', type: WalletType.BANK },
  { slug: 'dbp', logo: '/wallets/dbp.png', type: WalletType.BANK },
  { slug: 'robinsons-bank', logo: '/wallets/robinsons-bank.png', type: WalletType.BANK },
  { slug: 'bank-of-commerce', logo: '/wallets/bank-of-commerce.png', type: WalletType.BANK },
  { slug: 'pbcom', logo: '/wallets/pbcom.png', type: WalletType.BANK },
  { slug: 'sterling-bank', logo: '/wallets/sterling-bank.png', type: WalletType.BANK },
  { slug: 'veterans-bank', logo: '/wallets/veterans-bank.png', type: WalletType.BANK },
  
  // International Banks in PH
  { slug: 'maybank', logo: '/wallets/maybank.png', type: WalletType.BANK },
  { slug: 'hsbc', logo: '/wallets/hsbc.png', type: WalletType.BANK },
  { slug: 'citibank', logo: '/wallets/citibank.png', type: WalletType.BANK },
  { slug: 'standard-chartered', logo: '/wallets/standard-chartered.png', type: WalletType.BANK },
  
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

