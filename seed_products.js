import fs from 'fs';

const API_URL = 'http://localhost:8000/api/v1/products';

async function createProducts() {
  try {
    // Read the dummy products file
    const data = fs.readFileSync('./dummy_products.json', 'utf-8');
    const products = JSON.parse(data);

    console.log(`\n📦 Starting to create ${products.length} products...\n`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`✅ [${i + 1}/${products.length}] ${product.name} - Created successfully!`);
          console.log(`   ID: ${result.data._id}\n`);
        } else {
          console.log(`❌ [${i + 1}/${products.length}] ${product.name} - Failed!`);
          console.log(`   Error: ${result.message}\n`);
        }
      } catch (error) {
        console.log(`❌ [${i + 1}/${products.length}] ${product.name} - Error: ${error.message}\n`);
      }
    }

    console.log('✨ All products processed!');
    
    // Fetch all products to verify
    console.log('\n📋 Fetching all products to verify...\n');
    const allResponse = await fetch(API_URL);
    const allResult = await allResponse.json();
    
    console.log(`Total products in database: ${allResult.data.length}`);
    console.log('\nProducts created:');
    allResult.data.forEach((prod, index) => {
      console.log(`${index + 1}. ${prod.name} (${prod.category})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createProducts();
