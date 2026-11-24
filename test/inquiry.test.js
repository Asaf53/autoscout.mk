import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/inquiry.js';
const valid = {name:'Test Buyer',email:'buyer@example.com',interest:'purchase',offer:'1000 EUR',message:'Interested in buying.'};
function call(body, method='POST') {
  const req={body,method,headers:{'content-type':'application/json'}};
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(data){this.data=data;return this;}};
  return handler(req,res).then(()=>res);
}
test('rejects GET, invalid email, honeypot, invalid interest and oversize message',async()=>{
  assert.equal((await call(valid,'GET')).code,405);
  for(const patch of [{email:'bad'},{website:'spam'},{interest:'__proto__'},{message:'x'.repeat(3001)}]) assert.equal((await call({...valid,...patch})).code,400);
});
test('missing email credentials returns explicit failure',async()=>{
  const keys=['RESEND_API_KEY','CONTACT_FROM_EMAIL','CONTACT_TO_EMAIL'];
  const previous=keys.map(k=>process.env[k]);keys.forEach(k=>delete process.env[k]);
  try{assert.equal((await call(valid)).code,503);}finally{keys.forEach((k,i)=>previous[i]===undefined?delete process.env[k]:process.env[k]=previous[i]);}
});
test('mock provider success and failure',async(t)=>{
  const keys=['RESEND_API_KEY','CONTACT_FROM_EMAIL','CONTACT_TO_EMAIL'];const previous=keys.map(k=>process.env[k]);
  keys.forEach((k,i)=>process.env[k]=['test-key','sender@example.com','owner@example.com'][i]);
  try{const mock=t.mock.method(globalThis,'fetch',async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');const payload=JSON.parse(options.body);assert.equal(payload.reply_to,valid.email);assert.ok(payload.text.includes(valid.message));return {ok:true};});assert.equal((await call(valid)).code,200);mock.mock.mockImplementation(async()=>({ok:false,status:429}));assert.equal((await call(valid)).code,502);}finally{keys.forEach((k,i)=>previous[i]===undefined?delete process.env[k]:process.env[k]=previous[i]);}
});
