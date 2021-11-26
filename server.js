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
    // res.render('chart')
    conexion.query("select country,  count(city) as city from city , country where city.country_id=country.country_id group by country.country_id",(error, results)=>{
        if(error){
            console.log(error)
        }
        else{
            res.render('chart.ejs',{results:results})
        }
    })
})

app.get('/login', (req,res)=>{
    res.render("login")
})
app.get('/register', (req,res)=>{
    res.render("register")
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
                req.session.logged = true
                req.session.name = results[0].usuario
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

//auntenticacion para las otras paginas
app.get('/',(req,res)=>{
    if(req.session.logged){
        res.render('index',{
            login:true,
            name:req.session.name,
            rol:req.session.rol
        })
        
    }else{
         res.render('index',{
             login:false,
             name:'Debes iniciar sesion'
         })
    }
})
app.get('/admin', (req,res)=>{
    if(req.session.logged){
        res.render('home',{
            login:true,
            name:req.session.name
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



  