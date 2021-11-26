const mysql = require('mysql')

const conexion = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'mydb'
    // database:'sakila'
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