const express = require('express');
const jest = require('jest');
const app = require('../server/app.js');
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const memberModel = require('../server/models/Member.js');

try {
    (async () => {await mongoose.connect(process.env.DB_URL_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })})();
}
catch(err) {
    console.log(err);
}

beforeAll(async () => {
    await memberModel.deleteMany();
});

test("testing view profile route", async () => {
    const member = new memberModel({
        id : 'ac-1',
        password: 'kcsckcsk',
        email : 'zizo.1990@live.com'
    });
    await member.save();
    const res = await memberModel.find({id : member.id});
    expect(res).toHaveLength(1);
    expect(res.id).toBe(member.id);
    expect(res.password).toBe(member.password);
    expect(res.email).toBe(member.email);
});

