const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const app = require('../server');
const FitnessClass = require('../models/FitnessClass');
const User = require('../models/User');

const { expect } = chai;

chai.use(chaiHttp);

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

describe('POST /api/fitness-classes', () => {
    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    });

    afterEach(() => {
        sinon.restore();
    });

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

describe('GET /api/fitness-classes', () => {
    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    });

    afterEach(() => {
        sinon.restore();
    });

    it('returns fitness classes for an authenticated user', async () => {
        const fitnessClasses = [
            {
                id: 'class-1',
                class: 'Yoga',
                instructor: 'Jack Jones',
                date: '2026-06-03',
                time: '7:00 PM',
                capacity: 20,
                status: 'confirmed',
            },
            {
                id: 'class-2',
                class: 'Pilates',
                instructor: 'Jessica Smith',
                date: '2026-06-04',
                time: '7:00 PM',
                capacity: 15,
                status: 'confirmed',
            },
        ];
        const sortStub = sinon.stub().resolves(fitnessClasses);
        const findStub = sinon.stub(FitnessClass, 'find').returns({ sort: sortStub });

        stubAuthenticatedUser();

        const res = await chai.request(app)
            .get('/api/fitness-classes')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(fitnessClasses);
        expect(findStub.calledOnceWithExactly()).to.equal(true);
        expect(sortStub.calledOnceWithExactly({ date: 1, time: 1 })).to.equal(true);
    });

    it('rejects requests without a token', async () => {
        const findByIdStub = sinon.stub(User, 'findById');
        const findStub = sinon.stub(FitnessClass, 'find');

        const res = await chai.request(app)
            .get('/api/fitness-classes');

        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({ message: 'Not authorized, no token' });
        expect(findByIdStub.notCalled).to.equal(true);
        expect(findStub.notCalled).to.equal(true);
    });

    it('returns a server error when class retrieval fails', async () => {
        const sortStub = sinon.stub().rejects(new Error('Database unavailable'));

        sinon.stub(FitnessClass, 'find').returns({ sort: sortStub });
        stubAuthenticatedUser();

        const res = await chai.request(app)
            .get('/api/fitness-classes')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(res).to.have.status(500);
        expect(res.body).to.deep.equal({ message: 'Database unavailable' });
    });
});
