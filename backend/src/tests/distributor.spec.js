const app = require('../app');
const randomGenerator = require('../utils/randomGenerator');

const Distributor = require('../models/distributor');

const supertest = require('supertest')
const request = supertest(app);

const mongoose = require('mongoose');
const InitiateMongoServer = require('../db/connection');
const mongoURI = process.env.MONGODB_URI_TEST;

describe('01 - Distributor', () => {

    beforeAll(async () => {
        InitiateMongoServer(mongoURI);
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it('A - Should list all distributors', async (done) => {
        const newDistributor1 = new Distributor(randomGenerator.newDistributor());
        const newDistributor2 = new Distributor(randomGenerator.newDistributor());
        const newDistributor3 = new Distributor(randomGenerator.newDistributor());

        const saved1 = await newDistributor1.save();
        const saved2 = await newDistributor2.save();
        const saved3 = await newDistributor3.save();

        request
            .get('/distributors')
            .end(function (err, res) {
                if (err) { return done(err); }

                expect(res.status).toBe(200);
                expect(res.body.length).toBeGreaterThanOrEqual(3);

                expect(res.body).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            _id: saved1.id,
                            name: saved1.name,
                            password: saved1.password,
                            address: saved1.address
                        }),
                        expect.objectContaining({
                            _id: saved2.id,
                            name: saved2.name,
                            password: saved2.password,
                            address: saved2.address
                        }),
                        expect.objectContaining({
                            _id: saved3.id,
                            name: saved3.name,
                            password: saved3.password,
                            address: saved3.address
                        })
                    ])
                );

                done();
            });
    });
});
describe('02 - Distributor - registration', () => {

    beforeAll(async () => {
        InitiateMongoServer(mongoURI);
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it('A - Should create a new distributor', (done) => {
        const newDistributor = randomGenerator.newDistributor();

        request
            .post('/distributors/new')
            .send(newDistributor)
            .end(function (err, res) {
                if (err) { return done(err); }

                expect(res.status).toBe(201);
                expect(res.body.id).toMatch(/[\d\w]{24}/);
                expect(res.body.message).toBe(`Distributor ${newDistributor.name} created successfully`);

                done();
            });
    });

    it('B - Cannot create a new distributor, because all fields are not specified', (done) => {
        request
            .post('/distributors/new')
            .send({})
            .end(function (err, res) {
                if (err) { return done(err); }

                expect(res.status).toBe(422);
                expect(res.body.errors).toContainEqual({ "name": "Name must be specified." });
                expect(res.body.errors).toContainEqual({ "name": "Name has non-alphanumeric characters." });
                expect(res.body.errors).toContainEqual({ "password": "Password must be specified." });
                expect(res.body.errors).toContainEqual({ "address": "Address must be specified." });

                done();
            });
    });

    it('C - Cannot create a new distributor, because address is invalid', (done) => {
        const newDistributor = randomGenerator.newDistributor();
        newDistributor.address += "123";

        request
            .post('/distributors/new')
            .send(newDistributor)
            .end(function (err, res) {
                if (err) { return done(err); }

                expect(res.status).toBe(422);
                expect(res.body.errors).toContainEqual({ "address": "Invalid address." });

                done();
            });
    });
});

describe('03 - Distributor - login', () => {

    beforeAll(async () => {
        InitiateMongoServer(mongoURI);
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it('A - Should be able to login', async (done) => {
        const newDistributor = randomGenerator.newDistributor();

        await new Distributor(newDistributor).save();

        request
            .post('/distributors/login')
            .send(newDistributor)
            .end(function (err, res) {
                if (err) { return done(err); }

                expect(res.status).toBe(200);
                expect(res.body.distributorJWT).toMatch(/^[\d\w-_=]+\.[\d\w-_=]+\.?[\d\w-_.+\/=]*$/);
                expect(res.body.address).toEqual(newDistributor.address);

                done();
            });
    });

    it('B - Cannot login, because all fields are not specified', (done) => {
        request
            .post('/distributors/login')
            .end(function (err, res) {
                if (err) { return done(err); }

                expect(res.status).toBe(422);
                expect(res.body.errors).toContainEqual({ "name": "Name must be specified." });
                expect(res.body.errors).toContainEqual({ "name": "Name has non-alphanumeric characters." });
                expect(res.body.errors).toContainEqual({ "password": "Password must be specified." });

                done();
            });
    });

    it('C - Cannot login, because name is invalid', async (done) => {
        const newDistributor = new Distributor(randomGenerator.newDistributor());
        await newDistributor.save();

        newDistributor.name = "123";

        request
            .post('/distributors/login')
            .send(newDistributor)
            .end(function (err, res) {
                if (err) { return done(err); }

                expect(res.status).toBe(401);
                expect(res.body).toEqual({ "message": "Invalid name" });

                done();
            });
    });

    it('D - Cannot login, because password is invalid', async (done) => {
        const newDistributor = new Distributor(randomGenerator.newDistributor());
        await newDistributor.save();

        newDistributor.password = "123";

        request
            .post('/distributors/login')
            .send(newDistributor)
            .end(function (err, res) {
                if (err) { return done(err); }

                expect(res.status).toBe(401);
                expect(res.body).toEqual({ "message": "Invalid password" });

                done();
            });
    });
});