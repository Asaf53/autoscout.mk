import http from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from './api/inquiry.js';
const assets = {'/':['index.html','text/html; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/favicon.svg':['favicon.svg','image/svg+xml']};
http.createServer(async (req,res)=>{
 const path = new URL(req.url,'http://localhost').pathname;
 if(path==='/api/inquiry'){
  let bytes=0; const chunks=[];
  for await(const chunk of req){bytes+=chunk.length;if(bytes>16000){res.writeHead(413);res.end('Inquiry too large');return;}chunks.push(chunk);}
  req.body=Buffer.concat(chunks).toString();
  res.status=function(code){this.statusCode=code;return this;};
  res.json=function(value){this.setHeader('Content-Type','application/json');this.end(JSON.stringify(value));return this;};
  return handler(req,res);
 }
 if(!Object.hasOwn(assets,path)){res.writeHead(404);res.end('Not found');return;}
 try{const [file,type]=assets[path];res.setHeader('Content-Type',type);res.end(await readFile(new URL(file,import.meta.url)));}catch{res.writeHead(500);res.end('Server error');}
}).listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log('Local website: http://localhost:'+(process.env.PORT||3000)));
