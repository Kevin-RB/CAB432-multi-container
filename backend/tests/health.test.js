import request from 'supertest';
import app from '../src/app.js';

describe('Health Endpoint', () => {
  test('GET / should return health status', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /json/);
    
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('File Upload API is running');
  });

  test('GET / should include service status', async () => {
    const response = await request(app)
      .get('/');
    
    expect(response.body).toHaveProperty('services');
    expect(response.body).toHaveProperty('endpoints');
  });
});

// Example usage - you'll need to install jest and supertest:
// npm install --save-dev jest supertest
