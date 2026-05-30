const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../server');
const User = require('../models/User');

const { expect } = chai;

chai.use(chaiHttp);

describe('POST /api/auth/register', () => {
    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    });

    afterEach(() => {
        sinon.restore();
    });

    it('creates a user and returns the public user details with a token', async () => {
        const findOneStub = sinon.stub(User, 'findOne').resolves(null);
        const createStub = sinon.stub(User, 'create').resolves({
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
        });

        const res = await chai.request(app)
            .post('/api/auth/register')
            .send({
                name: ' Test User ',
                email: 'TEST@example.com ',
                password: 'password123',
            });

        expect(res).to.have.status(201);
        expect(res.body).to.include({
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
        });
        expect(res.body.token).to.be.a('string');
        expect(res.body).to.not.have.property('password');
        expect(findOneStub.calledOnceWithExactly({ email: 'test@example.com' })).to.equal(true);
        expect(createStub.calledOnceWithExactly({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        })).to.equal(true);
    });

    it('rejects registration when required fields are missing', async () => {
        const findOneStub = sinon.stub(User, 'findOne');
        const createStub = sinon.stub(User, 'create');

        const res = await chai.request(app)
            .post('/api/auth/register')
            .send({
                name: '',
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
            message: 'Name, email, and password are required',
        });
        expect(findOneStub.notCalled).to.equal(true);
        expect(createStub.notCalled).to.equal(true);
    });

    it('rejects passwords shorter than six characters', async () => {
        const findOneStub = sinon.stub(User, 'findOne');
        const createStub = sinon.stub(User, 'create');

        const res = await chai.request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'short',
            });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
            message: 'Password must be at least 6 characters',
        });
        expect(findOneStub.notCalled).to.equal(true);
        expect(createStub.notCalled).to.equal(true);
    });

    it('rejects duplicate users found before creation', async () => {
        const createStub = sinon.stub(User, 'create');

        sinon.stub(User, 'findOne').resolves({
            id: 'existing-user-id',
            email: 'test@example.com',
        });

        const res = await chai.request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ message: 'User already exists' });
        expect(createStub.notCalled).to.equal(true);
    });

    it('rejects duplicate users when MongoDB raises a duplicate key error', async () => {
        const duplicateKeyError = new Error('duplicate key');
        duplicateKeyError.code = 11000;

        sinon.stub(User, 'findOne').resolves(null);
        sinon.stub(User, 'create').rejects(duplicateKeyError);

        const res = await chai.request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ message: 'User already exists' });
    });
});
