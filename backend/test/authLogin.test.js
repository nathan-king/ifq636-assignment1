const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../models/User');

const { expect } = chai;

chai.use(chaiHttp);

describe('POST /api/auth/login', () => {
    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    });

    afterEach(() => {
        sinon.restore();
    });

    it('logs in a user and returns the public user details with a token', async () => {
        const findOneStub = sinon.stub(User, 'findOne').resolves({
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashed-password',
        });
        const compareStub = sinon.stub(bcrypt, 'compare').resolves(true);

        const res = await chai.request(app)
            .post('/api/auth/login')
            .send({
                email: 'TEST@example.com ',
                password: 'password123',
            });

        expect(res).to.have.status(200);
        expect(res.body).to.include({
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
        });
        expect(res.body.token).to.be.a('string');
        expect(res.body).to.not.have.property('password');
        expect(findOneStub.calledOnceWithExactly({ email: 'test@example.com' })).to.equal(true);
        expect(compareStub.calledOnceWithExactly('password123', 'hashed-password')).to.equal(true);
    });

    it('rejects login when required fields are missing', async () => {
        const findOneStub = sinon.stub(User, 'findOne');
        const compareStub = sinon.stub(bcrypt, 'compare');

        const res = await chai.request(app)
            .post('/api/auth/login')
            .send({
                email: '',
                password: 'password123',
            });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
            message: 'Email and password are required',
        });
        expect(findOneStub.notCalled).to.equal(true);
        expect(compareStub.notCalled).to.equal(true);
    });

    it('rejects login when the email does not match a user', async () => {
        const compareStub = sinon.stub(bcrypt, 'compare');

        sinon.stub(User, 'findOne').resolves(null);

        const res = await chai.request(app)
            .post('/api/auth/login')
            .send({
                email: 'missing@example.com',
                password: 'password123',
            });

        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({ message: 'Invalid email or password' });
        expect(compareStub.notCalled).to.equal(true);
    });

    it('rejects login when the password is incorrect', async () => {
        sinon.stub(User, 'findOne').resolves({
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashed-password',
        });
        sinon.stub(bcrypt, 'compare').resolves(false);

        const res = await chai.request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrong-password',
            });

        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({ message: 'Invalid email or password' });
    });

    it('returns a server error when user lookup fails', async () => {
        sinon.stub(User, 'findOne').rejects(new Error('Database unavailable'));

        const res = await chai.request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res).to.have.status(500);
        expect(res.body).to.deep.equal({ message: 'Database unavailable' });
    });
});
