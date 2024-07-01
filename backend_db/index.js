import express from 'express';
import hbs from 'hbs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import {readPosts,readusers,insertpost,insertuser,likefunc,sharefunc,delfunc} from './operation.js';

const app = express();
const secret = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const op = await readusers(req.body.profile);
        if (op.length === 0) {
            return res.send("User not found");
        }
        const password = op[0].password;
        if (password === req.body.password) {
            const payload = { profile: op[0].profile, name: op[0].name, headline: op[0].headline };
            const token = jwt.sign(payload, secret, { expiresIn: '1h' });
            res.cookie('token', token);
            console.log('Token set in cookie:', token);
            res.redirect('/posts');
        } else {
            res.send("Incorrect Username or Password");
        }
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/posts', verifyLogin, async (req, res) => {
    const op = await readPosts()
    res.render('posts',{
        data: op,
        userInfo: req.payload
    });
});
app.post('/like',async (req,res)=>{
    await likefunc(req.body.content)
    res.redirect('/posts')
})
app.post('/share',async (req,res)=>{
    await sharefunc(req.body.content)
    res.redirect('/posts')
})
app.post('/del',async (req,res)=>{
    await delfunc(req.body.content)
    res.redirect('/posts')
})
app.post('/addpost',async(req,res)=>{
    await insertpost(req.body.profile,req.body.content)
    res.redirect('/posts')
})

function verifyLogin(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        console.log('No token found in cookies');
        return res.sendStatus(403); // Forbidden
    }

    jwt.verify(token, secret, (err, payload) => {
        if (err) {
            console.log('JWT verification error:', err);
            return res.sendStatus(403); // Forbidden
        }
        req.payload = payload;
        console.log('JWT verified, payload:', payload);
        next();
    });
}
app.get('/register',(req,res)=>{
    res.render('register')
})
app.post ('/addusers',async (req,res)=>{

    if(req.body.password === req.body.cnfpassword){
        await insertuser(req.body.name,req.body.profile,req.body.password,req.body.headline)
        res.redirect('/')
    }
    else{
        res.send("Password and Confirm Password are not same.")
    }
})

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
