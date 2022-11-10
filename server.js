/*********************************************************************************
* BTI325 – Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: LO TSZ KIT Student ID: 160067211 Date: 2022/10/26
*
* https://senecaweba4.herokuapp.com/
* _______________________________________________________
*
********************************************************************************/
const express = require("express")
const fs = require("fs")
let app = express()
const path = require("path")
const port = process.env.PORT || 8080
let data = require("./data-service")
const multer = require("multer")
const exphbs = require('express-handlebars')

const storage = multer.diskStorage({
    destination: "./images/uploaded",
    filename: function(req, file, cb){
       cb(null, Date.now()+ path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use( express.static('public') )
app.use('/images', express.static('images'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//handle bars
app.engine('.hbs', exphbs.engine({
    extname:'.hbs',
    helpers:{
        navLink(url, options){return ('<li' +((url == app.locals.activeRoute) ? ' class="active" ' : '') +'><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>');},
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
            }
    }
}) )
app.set('view engine','.hbs')
app.set('views','./views')
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
    });


app.get("/",(req,res)=>{
    //res.sendFile(path.join(__dirname,"/views/home.html"))
    res.render('home');
})

app.get("/about",(req,res)=>{
    //res.sendFile(path.join(__dirname,"/views/about.html"))
    res.render('about');
})

app.get("/employees",(req,res)=>{
    
    const filter = Object.keys(req.query); 
    if(filter.length==1){//check if query exists
        switch(filter[0]){
            case "status": 
                data.getEmployeesByStatus(req.query.status)
                .then(result=>{res.render("employees",{employees:result})},err=> res.render("employees",{message:err}));
                break;
            case "department" : 
                data.getEmployeesByDepartment(req.query.department)
                .then(
                    result=>{res.render("employees",{employees:result})},
                    err=> res.render("employees",{message:err}));
                break;
            case "manager" : 
                data.getEmployeesByManager(req.query.manager)
                .then(result=>{res.render("employees",{employees:result})},err=> res.render("employees",{message:err}));
                break;
            default:
                data.getAllEmployees().then(result=>{res.render("employees",{employees:result})},err=> res.render("employees",{message:err}));
        }
    }else{
        data.getAllEmployees().then(result=>{res.render("employees",{employees:result})},err=> res.render("employees",{message:err}));
    }
    
    
})




app.get("/departments",(req,res)=>{

    data.getDepartments().then(result=>{res.render("departments",{departments:result})},err=> res.render("departments",{message:err}));
})

app.get("/employees/add",(req,res)=>{
    //res.sendFile( path.join(__dirname,"views/addEmployee.html") )
    res.render('addEmployee')
})

app.get("/images/add",(req,res)=>{
    //res.sendFile( path.join(__dirname,"views/addImage.html") )
    res.render('addImage')
})

app.post("/images/add",upload.single("imageFile"),(req,res)=>{
    res.redirect('/images');
})

app.get("/images",(req,res)=>{
    fs.readdir("./images/uploaded", function(err, files){
        res.render("images",{images:files})
    })
    
})

app.post("/employees/add",(req,res)=>{
    data.addEmployee(req.body).then(result=>{
        res.redirect('/employees')
    },err=>{
        res.send({message:err})
    })
})

app.get("/employee/:employeeID",(req,res)=>{
    data.getEmployeeByNum(req.params.employeeID)
    .then(result=>res.render("employee",{employee:result}),err=> res.render("employee",{message:err}));
})

app.post("/employee/update",(req,res)=>{
    data.updateEmployee(req.body)
    .then(result=> res.redirect("/employees"),err=> res.render("employee",{message:err}));
})



/*
app.get("*",(req,res)=>{
    res.status(404).send("Page Not Found")
})
*/


data.initialize().then(result=>{

    app.listen(port,()=>{
        console.log(`Express http server listening on ${port}`)
    })
},err=>{
    console.log("Unable to start up server", err)
})