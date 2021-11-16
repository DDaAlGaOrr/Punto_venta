const mysql = require('mysql')

const conexion = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'usuarios'
})

conexion.connect((error)=>{
    if(error){
        console.log('error en la conexion')
        return
    }
    else{
        console.log('conectado')
    }
})

module.exports = conexion;