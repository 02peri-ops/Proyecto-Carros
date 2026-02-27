const request = require('supertest');
const app = require('../app');

describe('Auth Tests', () => {
    test('Debe registrar un nuevo usuario', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'testuser', password: '123456' });
        expect(res.statusCode).toBe(201);
    });

    test('Debe hacer login correctamente', async () => {
        
        await request(app)
            .post('/api/auth/register')
            .send({ username: 'logintest', password: '123456' });
        
       
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'logintest', password: '123456' });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('Debe rechazar login con contraseña incorrecta', async () => {
        
        await request(app)
            .post('/api/auth/register')
            .send({ username: 'authtest', password: '123456' });
        
        
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'authtest', password: 'wrongpassword' });
        
        expect(res.statusCode).toBe(400);
    });
});

describe('Cars Tests', () => {
    let authToken;

    beforeAll(async () => {
        
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'admin123' });
        authToken = res.body.token;
    });

    test('Debe obtener lista de carros con paginación', async () => {
        const res = await request(app)
            .get('/api/cars?page=1&limit=10');
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeDefined();
    });

    test('Debe filtrar carros por marca', async () => {
        const res = await request(app)
            .get('/api/cars?marca=Toyota');
        expect(res.statusCode).toBe(200);
    });

    test('Debe rechazar acceso sin token', async () => {
        const res = await request(app)
            .post('/api/cars')
            .send({ Marca: 'Test', Modelo: 'Test', Precio: 10000 });
        expect(res.statusCode).toBe(403);
    });
});
