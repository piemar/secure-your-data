import { SeedDefinition } from '../../../sandbox/seeding/types.js';
import { generate, deterministicInt, deterministicMoney } from '../../../sandbox/seeding/helpers.js';

export const mission3SeedData: SeedDefinition = {
  missionId: 'mission-3',
  collections: [
    {
      name: 'orders',
      documents: generate(200, i => ({
        orderId: `ORD_${String(i).padStart(5, '0')}`,
        customerId: `CUST_${String(i % 50).padStart(4, '0')}`,
        items: generate(deterministicInt(`mission-3-items-length-${i}`, 1, 4), j => ({
          productId: `PROD_${String((i * 3 + j) % 50).padStart(3, '0')}`,
          name: ['Widget', 'Gadget', 'Doohickey', 'Thingamajig'][j % 4],
          quantity: deterministicInt(`mission-3-item-quantity-${i}-${j}`, 1, 10),
          price: deterministicMoney(`mission-3-item-price-${i}-${j}`, 200),
        })),
        status: ['pending', 'shipped', 'delivered', 'returned'][i % 4],
        createdAt: new Date(2024, Math.floor(i / 30), (i % 28) + 1),
        region: ['us-east', 'eu-west', 'ap-south', 'us-west'][i % 4],
      })),
    },
    {
      name: 'products',
      documents: generate(50, i => ({
        productId: `PROD_${String(i).padStart(3, '0')}`,
        name: `Product ${i}`,
        category: ['electronics', 'clothing', 'food', 'tools', 'books'][i % 5],
        price: deterministicMoney(`mission-3-product-price-${i}`, 500),
        inStock: i % 3 !== 0,
      })),
    },
  ],
};
