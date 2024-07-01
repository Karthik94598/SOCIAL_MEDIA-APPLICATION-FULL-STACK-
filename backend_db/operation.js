import mysql from 'mysql2'

const connections = mysql.createPool({
    host : '127.0.0.1',
    user : 'root',
    password : 'apple@123',
    database : 'social_media'
}).promise()

export async function readPosts(){
    const op = await connections.query('select * from posts')
    return op[0]
}

export async function readusers(profile){
    const op = await connections.query("select * from users where profile ='"+profile+"'")
    return op[0]
}

export async function insertuser(name,profile,password,headline){
    const op = await connections.query("insert into users(name,profile,password,headline) values ('"+name+"','"+profile+"','"+password+"','"+headline+"')")
}

export async function insertpost(profile,content){
    const op = await connections.query("insert into posts(profile,content,likes,shares) values ('"+profile+"','"+content+"',0,0)")
}

export async function likefunc(content){
    const op = await connections.query("select likes from posts where content = '"+content+"'")
    const likes = op[0][0].likes
    const incLikes = likes +1
    await connections.query("update posts set likes = '"+incLikes+"' where content = '"+content+"' " )
}

export async function sharefunc(content){
    const op = await connections.query("select shares from posts where content = '"+content+"'")
    const shares = op[0][0].shares
    const incShares = shares +1
    await connections.query("update posts set shares = '"+incShares+"' where content = '"+content+"' " )
}

export async function delfunc(content){
    await connections.query("delete from posts where content = '"+content+"' " )
}