const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a test user and generate auth token
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '1234567890'
  });
  authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe('Product Endpoints', () => {
  describe('GET /products', () => {
    it('should return all products', async () => {
      await Product.create([
        {
          name: 'Organic Jaggery',
          description: 'Pure organic jaggery',
          price: 199,
          category: 'Jaggery',
          stock: 100
        },
        {
          name: 'Jaggery Powder',
          description: 'Fine jaggery powder',
          price: 149,
          category: 'Jaggery',
          stock: 50
        }
      ]);

      const res = await request(app)
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(2);
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        description: 'Test product description',
        price: 299,
        category: 'Jaggery',
        stock: 75
      };

      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', productData.name);
      expect(res.body).toHaveProperty('price', productData.price);
    });

    it('should not create product without required fields', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Incomplete Product'
        });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a single product', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 199,
        category: 'Jaggery',
        stock: 100
      });

      const res = await request(app)
        .get(`/products/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(404);
    });
  });
}); 