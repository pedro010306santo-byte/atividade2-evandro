require('dotenv').config({path: require('node:path').join(__dirname,'../../.env'), quiet:true});
const {Pool,types}=require('pg');
types.setTypeParser(1082, value => value); // DATE sem deslocamento de fuso.
const db=new Pool({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||5432),database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD,max:10,connectionTimeoutMillis:5000});
module.exports=db;
