import express from 'express'; // Importar express
import { createConnection } from 'mysql';
import cors from 'cors';
import cookieParser from 'cookie-parser';
//import { sign } from 'jsonwebtoken';
import pkg, { verify } from 'jsonwebtoken';
const { sign } = pkg;


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: ["http://localhost:5173"], //url del frontend
        methods: ["POST", "GET"],
        credentials: true
    }
))

const mysql = require('mysql2');

const db = createConnection({
    host: "localhost",
    user: "root",
    password: "Iris2015",
    database: "cilsa_todolist"
})

const verifyUser = (req, res, next) => {
    const token = req.cookie.token;
    if(!token){
        return res.json({Message: "Se requiere un token"})
    }else {
        JsonWebTokenError.verify(token, "our-jsonwebtoken-secret-key", (err,decoded) => {
            if(err){
                return res.json({Message: "Error de Autenticacion"})
            }else{
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/',verifyUser, (req,res) => {
    return res.json({Status: "Success", name: req.name})
})
// Conectar a la base de datos
app.post('/login', (req, res) =>{
    const sql = "SELECT * FROM usuario WHERE email = ? AND password = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        console.error("Database Error: ", err); // Esto mostrará el error en la consola
        console.error(err);  // Imprimir el error
        if(err) return res.json({Message: "Server Side Error"});
        if(data.length > 0) {
            const name = data[0].name;
            const token = sign({name}, "our-jsonwebtoken-secret-key", {expiresIn: '1d'});
            res.cookie('token', token);
            return res.json({Status:"Success"})
        }else {
            return res.json({Message: "No Records existed"});
        }
    })
})

app.get('/logout', (req,res) => {
    res.clearCookie('token');
})

app.listen(8081, ()=>{
    console.log("Running")
})