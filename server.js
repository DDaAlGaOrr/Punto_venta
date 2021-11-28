const express = require('express');
const app = express();
const dotEnv = require('dotenv')
const bcript = require('bcryptjs')
const session = require('express-session')
const conexion = require('./database/db')

app.set('view engine','ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.json());
// app.use('/', require('./router'));
app.use('/resources',express.static('public'))
app.use('/resources',express.static(__dirname+'/public'))
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}))



app.get('/chart',(req,res)=>{
 
    conexion.query("select u.usuario, count(v.usuarios_idusuario) as ventas from usuarios u inner join venta v on idusuario = usuarios_idusuario group by v.usuarios_idusuario;",(error, results)=>{
        if(error){
            console.log(error)
        }
        else{
            // console.log(results.length)
            // results.forEach((v,i) => console.log(results[i]))
            var string=JSON.stringify(results);
            var json =  JSON.parse(string);
            // console.log('>> json: ', json);
            // console.log('>> user.name: ', json[0].name);
            // req.list = json;
            // next();
            res.render('chart.ejs',{results:json})
        }
    })
})

app.get('/login', (req,res)=>{
    res.render("login")
})
app.get('/register', (req,res)=>{
    res.render("register")
})
app.get('/proveedor',(req,res) =>{
    res.render('proveedor')
})
app.get('/producto',(req,res) =>{
    conexion.query('select rfc,nombre from provedor',(err,results)=>{
        if(err){
            console.log(err)
        }
        else{
            res.render('producto',{prove:results})
        }
    })
    
})



app.listen(3000, ()=>{
    console.log('SERVER corriendo en http://localhost:3000');
});

//registrar usuarios
app.post('/register',async(req,res)=>{
    const user = req.body.user
    const pass = req.body.password
    const rol = req.body.rol
    let passhash = await bcript.hash(pass,8)

    conexion.query('insert into usuarios set ?',{usuario:user, contrasenia:passhash, tipo:rol},async(error,results)=>{
        if(error){
            console.log(error)
        }
        else{
            res.render('register',{
                alert:true,
                alertTitle:'Registro',
                alertMessage:'Usuario Guardado con exito',
                alertIcon:'success',
                showConfirmButton:false,
                timer:1500,
                ruta:'login'
            })
        }
    })
})

// autenticacion 
app.post('/auth',async(req,res)=>{
    const user = req.body.user
    const pass = req.body.password
     let passwhash = await bcript.hash(pass, 8)

    if(user && pass){
        conexion.query('SELECT * FROM usuarios WHERE usuario = ?' , [user], async(error,results)=>{
            if(results.length == 0 || !(await bcript.compare(pass, results[0].contrasenia))){
                
                if(error){
                    console.log(error)
                }else{
                    res.render('login',{
                        alert: true,
                        alertTitle: 'Inicio sesion',
                        alertMessage: 'Usuario o contraseña incorrectos',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: 1500,
                        ruta: 'login'
                    })
                }
            }else{
                req.session.nameadmin = results[0].usuario
                req.session.name = results[0].usuario
                req.session.logged = true
                if(results[0].tipo == 'admin'){
                    res.render('login',{
                        alert: true,
                        alertTitle: 'Inicio sesion',
                        alertMessage: 'Sesion iniciada',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: 'admin'
                    })
                }else{
                   
                    res.render('login',{
                        
                        alert: true,
                        alertTitle: 'Inicio sesion',
                        alertMessage: 'Sesion iniciada',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: ''
                    })
                }
                
            }
        })
    }
    else{
        res.render('login',{
                    
            alert: true,
            alertTitle: 'Inicio sesion',
            alertMessage: 'Ingresa un usuario y contraseña',
            alertIcon: 'error',
            showConfirmButton: false,
            timer: 1500,
            ruta: 'login'
        })
    }
})

app.post('/proveedor', (req,res)=>{
    const rfc = req.body.rfc
    const nombre = req.body.nombre
    const pais = req.body.pais
    const telefono = req.body.telefono

    conexion.query('insert into provedor set ?',{rfc:rfc, nombre:nombre, direccion:pais,telefono:telefono}, (err,results)=>{
        if(err){
            console.log(err)
        }
        else{
            res.render('proveedor',{  
                alert: true,
                alertTitle: 'proveedor guardado',
                alertMessage: 'proveedor guardado',
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'proveedor'
            })
        }
    })
})

app.post('/producto',(req,res)=>{
    const id = req.body.id
    const nombre = req.body.nombre
    const categoria = req.body.categoria
    const preCompra = req.body.preCompra
    const preVenta = req.body.preVenta
    const contenido = req.body.contenido
    const medida = req.body.medida
    const prove = req.body.prove

    conexion.query('INSERT INTO producto set?',{idproducto:id, nombre:nombre, categoria:categoria, precio_venta:preVenta, precio_compra:preCompra,cantidad:contenido,medida:medida,provedor_rfc1:prove}, (err,results)=>{
        if(err){
            console.log(err)
        }else{
            console.log("funciona :D")
        }
    })



})



//auntenticacion para las otras paginas
app.get('/',(req,res)=>{
    if(req.session.logged){
        res.render('index',{
            login:true,
            name:req.session.name,
            // rol:req.session.rol
        })
        
    }else{
         res.render('index',{
             login:false,
             name:'Debes iniciar sesion'
         })
    }
})
// auntenticacion admin
app.get('/admin', (req,res)=>{
    if(req.session.logged){
        res.render('home',{
            login:true,
            name:req.session.nameadmin
        })
    }else{
        res.render('index',{
            login:false,
            name:'Debes iniciar sesion'
        })
    }
    
})


app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    }) 
})



  