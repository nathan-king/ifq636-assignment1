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

const stubAuthenticatedUser = (role = 'user') => {
    sinon.stub(User, 'findById').returns({
        select: sinon.stub().resolves({
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
            role,
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

    it('creates a fitness class for an authenticated admin', async () => {
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

        stubAuthenticatedUser('admin');

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

    it('rejects class creation for non-admin users', async () => {
        const createStub = sinon.stub(FitnessClass, 'create');

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

        expect(res).to.have.status(403);
        expect(res.body).to.deep.equal({ message: 'Not authorized as admin' });
        expect(createStub.notCalled).to.equal(true);
    });

    it('rejects requests with missing required fields', async () => {
        const createStub = sinon.stub(FitnessClass, 'create');

        stubAuthenticatedUser('admin');

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

        stubAuthenticatedUser('admin');

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

describe('PUT /api/fitness-classes/:id', () => {
    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    });

    afterEach(() => {
        sinon.restore();
    });

    it('updates a fitness class for an authenticated admin', async () => {
        const updateData = {
            class: 'Yoga Flow',
            instructor: 'Jane Smith',
            date: '2026-06-08',
            time: '18:30',
            capacity: 24,
            status: 'confirmed',
        };
        const existingClass = {
            class: 'Yoga',
            instructor: 'Jack Jones',
            date: '2026-06-03',
            time: '19:00',
            capacity: 20,
            status: 'confirmed',
            save: sinon.stub().resolves({
                id: 'fitness-class-id',
                ...updateData,
            }),
        };
        const findByIdStub = sinon.stub(FitnessClass, 'findById').resolves(existingClass);

        stubAuthenticatedUser('admin');

        const res = await chai.request(app)
            .put('/api/fitness-classes/fitness-class-id')
            .set('Authorization', `Bearer ${createToken()}`)
            .send(updateData);

        expect(res).to.have.status(200);
        expect(res.body).to.include({
            id: 'fitness-class-id',
            class: 'Yoga Flow',
            instructor: 'Jane Smith',
            date: '2026-06-08',
            time: '18:30',
            capacity: 24,
            status: 'confirmed',
        });
        expect(findByIdStub.calledOnceWithExactly('fitness-class-id')).to.equal(true);
        expect(existingClass.save.calledOnce).to.equal(true);
        expect(existingClass.class).to.equal('Yoga Flow');
        expect(existingClass.instructor).to.equal('Jane Smith');
        expect(existingClass.date).to.equal('2026-06-08');
        expect(existingClass.time).to.equal('18:30');
        expect(existingClass.capacity).to.equal(24);
    });

    it('rejects class updates for non-admin users', async () => {
        const findByIdStub = sinon.stub(FitnessClass, 'findById');

        stubAuthenticatedUser();

        const res = await chai.request(app)
            .put('/api/fitness-classes/fitness-class-id')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({
                class: 'Yoga Flow',
                instructor: 'Jane Smith',
                date: '2026-06-08',
                time: '18:30',
                capacity: 24,
            });

        expect(res).to.have.status(403);
        expect(res.body).to.deep.equal({ message: 'Not authorized as admin' });
        expect(findByIdStub.notCalled).to.equal(true);
    });

    it('rejects updates with missing required fields', async () => {
        const findByIdStub = sinon.stub(FitnessClass, 'findById');

        stubAuthenticatedUser('admin');

        const res = await chai.request(app)
            .put('/api/fitness-classes/fitness-class-id')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({
                class: '',
                instructor: 'Jane Smith',
                date: '2026-06-08',
                time: '18:30',
                capacity: 24,
            });

        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
            message: 'Class, instructor, date, time, and capacity are required',
        });
        expect(findByIdStub.notCalled).to.equal(true);
    });

    it('returns not found when the class does not exist', async () => {
        sinon.stub(FitnessClass, 'findById').resolves(null);

        stubAuthenticatedUser('admin');

        const res = await chai.request(app)
            .put('/api/fitness-classes/missing-class-id')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({
                class: 'Yoga Flow',
                instructor: 'Jane Smith',
                date: '2026-06-08',
                time: '18:30',
                capacity: 24,
            });

        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ message: 'Fitness class not found' });
    });

    it('returns a server error when class update fails', async () => {
        sinon.stub(FitnessClass, 'findById').rejects(new Error('Database unavailable'));

        stubAuthenticatedUser('admin');

        const res = await chai.request(app)
            .put('/api/fitness-classes/fitness-class-id')
            .set('Authorization', `Bearer ${createToken()}`)
            .send({
                class: 'Yoga Flow',
                instructor: 'Jane Smith',
                date: '2026-06-08',
                time: '18:30',
                capacity: 24,
            });

        expect(res).to.have.status(500);
        expect(res.body).to.deep.equal({ message: 'Database unavailable' });
    });
});

describe('DELETE /api/fitness-classes/:id', () => {
    before(() => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    });

    afterEach(() => {
        sinon.restore();
    });

    it('deletes a fitness class for an authenticated admin', async () => {
        const existingClass = {
            deleteOne: sinon.stub().resolves(),
        };
        const findByIdStub = sinon.stub(FitnessClass, 'findById').resolves(existingClass);

        stubAuthenticatedUser('admin');

        const res = await chai.request(app)
            .delete('/api/fitness-classes/fitness-class-id')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ message: 'Fitness class deleted' });
        expect(findByIdStub.calledOnceWithExactly('fitness-class-id')).to.equal(true);
        expect(existingClass.deleteOne.calledOnce).to.equal(true);
    });

    it('rejects class deletion for non-admin users', async () => {
        const findByIdStub = sinon.stub(FitnessClass, 'findById');

        stubAuthenticatedUser();

        const res = await chai.request(app)
            .delete('/api/fitness-classes/fitness-class-id')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(res).to.have.status(403);
        expect(res.body).to.deep.equal({ message: 'Not authorized as admin' });
        expect(findByIdStub.notCalled).to.equal(true);
    });

    it('returns not found when deleting a missing class', async () => {
        sinon.stub(FitnessClass, 'findById').resolves(null);

        stubAuthenticatedUser('admin');

        const res = await chai.request(app)
            .delete('/api/fitness-classes/missing-class-id')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(res).to.have.status(404);
        expect(res.body).to.deep.equal({ message: 'Fitness class not found' });
    });

    it('returns a server error when class deletion fails', async () => {
        sinon.stub(FitnessClass, 'findById').rejects(new Error('Database unavailable'));

        stubAuthenticatedUser('admin');

        const res = await chai.request(app)
            .delete('/api/fitness-classes/fitness-class-id')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(res).to.have.status(500);
        expect(res.body).to.deep.equal({ message: 'Database unavailable' });
    });
});
