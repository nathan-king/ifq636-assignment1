const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const app = require('../server');
const Booking = require('../models/Booking');
const FitnessClass = require('../models/FitnessClass');
const User = require('../models/User');

const { expect } = chai;

chai.use(chaiHttp);

const createToken = () => jwt.sign({ id: 'user-id' }, process.env.JWT_SECRET);

const stubAuthenticatedUser = (role = 'user') => {
    sinon.stub(User, 'findById').returns({
        select: sinon.stub().resolves({
            _id: 'user-id',
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
            role,
        }),
    });
};

describe('GET /api/bookings', () => {
    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    });

    afterEach(() => {
        sinon.restore();
    });

    it('returns bookings for the authenticated user', async () => {
        const bookings = [
            {
                id: 'booking-id',
                user: 'user-id',
                status: 'booked',
                fitnessClass: {
                    id: 'fitness-class-id',
                    class: 'Yoga',
                    instructor: 'Jack Jones',
                },
            },
        ];
        const sortStub = sinon.stub().resolves(bookings);
        const populateStub = sinon.stub().returns({ sort: sortStub });
        const findStub = sinon.stub(Booking, 'find').returns({ populate: populateStub });

        stubAuthenticatedUser();

        const res = await chai.request(app)
            .get('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(bookings);
        expect(findStub.calledOnceWithExactly({ user: 'user-id' })).to.equal(true);
        expect(populateStub.calledOnceWithExactly('fitnessClass')).to.equal(true);
        expect(sortStub.calledOnceWithExactly({ createdAt: -1 })).to.equal(true);
    });

    it('rejects requests without a token', async () => {
        const findStub = sinon.stub(Booking, 'find');

        const res = await chai.request(app)
            .get('/api/bookings');

        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({ message: 'Not authorized, no token' });
        expect(findStub.notCalled).to.equal(true);
    });

    it('returns a server error when booking retrieval fails', async () => {
        const sortStub = sinon.stub().rejects(new Error('Database unavailable'));
        const populateStub = sinon.stub().returns({ sort: sortStub });

        sinon.stub(Booking, 'find').returns({ populate: populateStub });
        stubAuthenticatedUser();

        const res = await chai.request(app)
            .get('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(res).to.have.status(500);
        expect(res.body).to.deep.equal({ message: 'Database unavailable' });
    });
});

describe('POST /api/bookings', () => {
    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    });

    afterEach(() => {
        sinon.restore();
    });

    it('creates a booking for an authenticated user', async () => {
        const fitnessClass = {
            id: 'fitness-class-id',
            class: 'Yoga',
            capacity: 20,
            status: 'confirmed',
        };
        const findByIdStub = sinon.stub(FitnessClass, 'findById').resolves(fitnessClass);
        const findOneStub = sinon.stub(Booking, 'findOne').resolves(null);
        const countStub = sinon.stub(Booking, 'countDocuments').resolves(5);
        const createStub = sinon.stub(Booking, 'create').resolves({
            id: 'booking-id',
            user: 'user-id',
            fitnessClass: 'fitness-class-id',
            userRole: 'user',
            status: 'booked',
        });

        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({ fitnessClassId: 'fitness-class-id' });

        expect(res).to.have.status(201);
        expect(res.body).to.include({
            id: 'booking-id',
            user: 'user-id',
            fitnessClass: 'fitness-class-id',
            userRole: 'user',
            status: 'booked',
        });
        expect(findByIdStub.calledOnceWithExactly('fitness-class-id')).to.equal(true);
        expect(findOneStub.calledOnceWithExactly({
            user: 'user-id',
            fitnessClass: 'fitness-class-id',
        })).to.equal(true);
        expect(countStub.calledOnceWithExactly({
            fitnessClass: 'fitness-class-id',
            status: 'booked',
        })).to.equal(true);
        expect(createStub.calledOnceWithExactly({
            user: 'user-id',
            fitnessClass: 'fitness-class-id',
            userRole: 'user',
        })).to.equal(true);
    });

    it('creates a booking for an authenticated admin', async () => {
        sinon.stub(FitnessClass, 'findById').resolves({
            id: 'fitness-class-id',
            capacity: 20,
            status: 'confirmed',
        });
        sinon.stub(Booking, 'findOne').resolves(null);
        sinon.stub(Booking, 'countDocuments').resolves(0);
        const createStub = sinon.stub(Booking, 'create').resolves({
            id: 'booking-id',
            user: 'user-id',
            fitnessClass: 'fitness-class-id',
            userRole: 'admin',
            status: 'booked',
        });

        stubAuthenticatedUser('admin');

        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({ fitnessClassId: 'fitness-class-id' });

        expect(res).to.have.status(201);
        expect(res.body.userRole).to.equal('admin');
        expect(createStub.calledOnceWithExactly({
            user: 'user-id',
            fitnessClass: 'fitness-class-id',
            userRole: 'admin',
        })).to.equal(true);
    });

    it('rejects requests without a token', async () => {
        const findByIdStub = sinon.stub(FitnessClass, 'findById');
        const createStub = sinon.stub(Booking, 'create');

        const res = await chai.request(app)
            .post('/api/bookings')
            .send({ fitnessClassId: 'fitness-class-id' });

        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({ message: 'Not authorized, no token' });
        expect(findByIdStub.notCalled).to.equal(true);
        expect(createStub.notCalled).to.equal(true);
    });

    it('rejects requests without a fitness class', async () => {
        const findByIdStub = sinon.stub(FitnessClass, 'findById');
        const createStub = sinon.stub(Booking, 'create');

        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({});

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ message: 'Fitness class is required' });
        expect(findByIdStub.notCalled).to.equal(true);
        expect(createStub.notCalled).to.equal(true);
    });

    it('returns not found when the fitness class does not exist', async () => {
        const createStub = sinon.stub(Booking, 'create');

        sinon.stub(FitnessClass, 'findById').resolves(null);
        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({ fitnessClassId: 'missing-class-id' });

        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ message: 'Fitness class not found' });
        expect(createStub.notCalled).to.equal(true);
    });

    it('rejects cancelled fitness classes', async () => {
        const findOneStub = sinon.stub(Booking, 'findOne');
        const createStub = sinon.stub(Booking, 'create');

        sinon.stub(FitnessClass, 'findById').resolves({
            id: 'fitness-class-id',
            capacity: 20,
            status: 'cancelled',
        });
        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({ fitnessClassId: 'fitness-class-id' });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ message: 'Cannot book a cancelled class' });
        expect(findOneStub.notCalled).to.equal(true);
        expect(createStub.notCalled).to.equal(true);
    });

    it('rejects duplicate bookings', async () => {
        const countStub = sinon.stub(Booking, 'countDocuments');
        const createStub = sinon.stub(Booking, 'create');

        sinon.stub(FitnessClass, 'findById').resolves({
            id: 'fitness-class-id',
            capacity: 20,
            status: 'confirmed',
        });
        sinon.stub(Booking, 'findOne').resolves({
            id: 'existing-booking-id',
            user: 'user-id',
            fitnessClass: 'fitness-class-id',
        });
        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({ fitnessClassId: 'fitness-class-id' });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ message: 'Class already booked' });
        expect(countStub.notCalled).to.equal(true);
        expect(createStub.notCalled).to.equal(true);
    });

    it('rejects full fitness classes', async () => {
        const createStub = sinon.stub(Booking, 'create');

        sinon.stub(FitnessClass, 'findById').resolves({
            id: 'fitness-class-id',
            capacity: 20,
            status: 'confirmed',
        });
        sinon.stub(Booking, 'findOne').resolves(null);
        sinon.stub(Booking, 'countDocuments').resolves(20);
        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({ fitnessClassId: 'fitness-class-id' });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ message: 'Class is full' });
        expect(createStub.notCalled).to.equal(true);
    });

    it('returns duplicate booking message for duplicate key errors', async () => {
        sinon.stub(FitnessClass, 'findById').resolves({
            id: 'fitness-class-id',
            capacity: 20,
            status: 'confirmed',
        });
        sinon.stub(Booking, 'findOne').resolves(null);
        sinon.stub(Booking, 'countDocuments').resolves(0);
        sinon.stub(Booking, 'create').rejects({ code: 11000 });
        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({ fitnessClassId: 'fitness-class-id' });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({ message: 'Class already booked' });
    });

    it('returns a server error when booking creation fails', async () => {
        sinon.stub(FitnessClass, 'findById').resolves({
            id: 'fitness-class-id',
            capacity: 20,
            status: 'confirmed',
        });
        sinon.stub(Booking, 'findOne').resolves(null);
        sinon.stub(Booking, 'countDocuments').resolves(0);
        sinon.stub(Booking, 'create').rejects(new Error('Database unavailable'));
        stubAuthenticatedUser();

        const res = await chai.request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({ fitnessClassId: 'fitness-class-id' });

        expect(res).to.have.status(500);
        expect(res.body).to.deep.equal({ message: 'Database unavailable' });
    });
});
