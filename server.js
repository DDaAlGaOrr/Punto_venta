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
app.get('/detalles/:id', (req,res)=>{    
    const id = req.params.id;
    conexion.query('SELECT * FROM producto WHERE idproducto=?',[id] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            res.render('detalles', {detalle:results})           
        }        
    });
});

app.get('/compra/:id', (req,res)=>{    
    const id = req.params.id;
    const cantidad = req.body.cantidad;
    conexion.query('SELECT * FROM producto WHERE idproducto=?',[id] , (error, results) => {
        if (error) {
            throw error;
        }else{            
            const hola = results
            res.render('compra', {detalle:results,cantidad:cantidad})           
        }        
    });
});
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
            conexion.query('select rfc,nombre from provedor',(err,results)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.render('producto',{
                        prove:results,
                        alert: true,
                        alertTitle: 'producto guardado',
                        alertMessage: 'producto guardado',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: 'producto'
                    })
                }
            })
        }
    })



})



//auntenticacion para las otras paginas
app.get('/',(req,res)=>{
    conexion.query('select * from producto',(err,results)=>{
        if(err){
            console.log(err)
        }else{
           
            if(req.session.logged){
                res.render('index',{
                    login:true,
                    name:req.session.name,
                    prod:results
                })
                
            }else{
                 res.render('index',{
                     login:false,
                     name:'Debes iniciar sesion'
                 })
            }
        }
        
    })
    
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

app.post('/compra',(req,res)=>{
    const id = req.body.id
    conexion.query(`select * from producto where idproducto = ${id}`,(err,results)=>{
        if(err){
            console.log(err)
        }
        else{
            conexion.query("SELECT * FROM detalle_venta ORDER BY  iddetalle_venta DESC LIMIT 1",(err,results1)=>{
                if(err){
                    console.log(err)
                }else{
                    conexion.query(`INSERT INTO detalle_venta(iddetalle_venta, cantidad, precio_total, producto_idproducto1, establecimiento_idestablecimiento)values(${results1[0].iddetalle_venta + 1},1,${results[0].precio_venta},${results[0].idproducto},1)`,(err,results2)=>{
                        if(err){
                            console.log(err)
                        }else{
                            res.render('compra',{
                                detalle: results,
                                cantidad: 0,
                                alert: true,
                                alertTitle: 'venta realizada',
                                alertMessage: 'venta realizada',
                                alertIcon: 'success',
                                showConfirmButton: false,
                                timer: 1500,
                                ruta: ''
                            })
                        }
                    })
                    console.log(results[0].precio_venta +" "+results[0].idproducto)
                }
            })
           
        }
    })
})


app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    }) 
})



  