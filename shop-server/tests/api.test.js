import test from 'node:test'; import assert from 'node:assert/strict'; import request from 'supertest'; process.env.NODE_ENV='test'; const { app }=await import('../app.js');
test('health endpoint responds',async()=>{const response=await request(app).get('/api/health');assert.equal(response.status,200);assert.equal(response.body.success,true)});
test('invalid order is rejected before database work',async()=>{const response=await request(app).post('/api/orders').send({customer:{},items:[]});assert.equal(response.status,422);assert.equal(response.body.success,false)});
test('invalid enquiry is rejected',async()=>{const response=await request(app).post('/api/contact').send({name:'A'});assert.equal(response.status,422)});
