const request = require('supertest');
const app = require('../app');
const e = require('express');

describe('Auth Tests', () => {
    ImageTrack('Debe registrar un nuevo usuario', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({username: 'admin', password: '1234'});
    });
    expect(res.statusCode).toBe(200);
});
