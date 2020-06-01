const request = require('supertest')
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
let server;

describe('/api/genres', () => {
    beforeEach(() => {
        server = require('../../index');
    })

    afterEach( async () => {
        await server.close();
        await Genre.deleteMany({});
    })

    describe('GET /', () => {
        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                { name: 'Genre1' },
                { name: 'Genre2' }
            ])

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'Genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'Genre2')).toBeTruthy(); 
        })
    })

    describe('GET /:id', () => {
        it('should return a genre if valid id passed.', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();
            const res = await request(server).get('/api/genres/' + genre._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        })

        it('should return 400 if genre ID is not valid objectID.', async () => {
            const res = await request(server).get('/api/genres/1');
            expect(res.status).toBe(400);
        })
    })

    describe('POST /', () => {

        let token;
        let name;
        
        const exec = async () => {
            return await request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({name});
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        })

        it('should return 400 if genre is less than 5 char', async () => {
            name = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if genre is more than 50 char', async () => {
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should save genre if it valid', async () => {
            const res = await exec();
            const genre = Genre.find({ name: 'genre1'});
            expect(genre).not.toBeNull();
            expect(res.status).toBe(200);
        })

        it('should return the genre if it valid', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        })
    })
})