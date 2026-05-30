const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const app = require('../server');
const FitnessClass = require('../models/FitnessClass');
const User = require('../models/User');

const { expect } = chai;

chai.use(chaiHttp);

describe('POST /api/fitness-classes', () => {
    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    });

    afterEach(() => {
        sinon.restore();
    });

    const createToken = () => jwt.sign({ id: 'user-id' }, process.env.JWT_SECRET);

    const stubAuthenticatedUser = () => {
        sinon.stub(User, 'findById').returns({
            select: sinon.stub().resolves({
                id: 'user-id',
                name: 'Test User',
                email: 'test@example.com',
            }),
        });
    };

    it('creates a fitness class for an authenticated user', async () => {
        const classData = {
            class: 'Yoga',
            instructor: 'Jane Smith',
            date: '2026-06-01',
            time: '09:00',
            capacity: 20,
            status: 'confirmed',
        };
        const createStub = sinon.stub(FitnessClass, 'create').resolves({
            id: 'fitness-class-id',
            ...classData,
        });

        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/fitness-classes')
            .set('Authorization', `Bearer ${createToken()}`)
            .send(classData);

        expect(res).to.have.status(201);
        expect(res.body).to.include({
            id: 'fitness-class-id',
            class: 'Yoga',
            instructor: 'Jane Smith',
            date: '2026-06-01',
            time: '09:00',
            capacity: 20,
            status: 'confirmed',
        });
        expect(createStub.calledOnceWithExactly(classData)).to.equal(true);
    });

    it('rejects requests without a token', async () => {
        const createStub = sinon.stub(FitnessClass, 'create');
        const findByIdStub = sinon.stub(User, 'findById');

        const res = await chai.request(app)
            .post('/api/fitness-classes')
            .send({
                class: 'Yoga',
                instructor: 'Jane Smith',
                date: '2026-06-01',
                time: '09:00',
                capacity: 20,
            });

        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({ message: 'Not authorized, no token' });
        expect(findByIdStub.notCalled).to.equal(true);
        expect(createStub.notCalled).to.equal(true);
    });

    it('rejects requests with missing required fields', async () => {
        const createStub = sinon.stub(FitnessClass, 'create');

        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/fitness-classes')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({
                class: '',
                instructor: 'Jane Smith',
                date: '2026-06-01',
                time: '09:00',
                capacity: 20,
            });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
            message: 'Class, instructor, date, time, and capacity are required',
        });
        expect(createStub.notCalled).to.equal(true);
    });

    it('returns a server error when class creation fails', async () => {
        sinon.stub(FitnessClass, 'create').rejects(new Error('Database unavailable'));

        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/fitness-classes')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({
                class: 'Yoga',
                instructor: 'Jane Smith',
                date: '2026-06-01',
                time: '09:00',
                capacity: 20,
            });

        expect(res).to.have.status(500);
        expect(res.body).to.deep.equal({ message: 'Database unavailable' });
    });
});
