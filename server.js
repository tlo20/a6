/*********************************************************************************
* BTI325 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: LO TSZ KIT Student ID: 160067211 Date: 2022/11/29
*
* https://uninterested-underclothes-crab.cyclic.app/
* 
*
********************************************************************************/

const express = require("express")
const fs = require("fs")
let app = express()
const path = require("path")
const port = process.env.PORT || 8080
let dataService = require("./data-service")
const dataServiceAuth = require("./data-service-auth")
const multer = require("multer")
const exphbs = require('express-handlebars')
let clientSessions = require('client-sessions')

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

// Setup client-sessions
app.use(clientSessions({
    cookieName: "session",
    secret: "web_assignment6", 
    duration: 2 * 60 * 1000, 
    activeDuration: 60 * 1000 
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});



app.get("/",(req,res)=>{
    res.render('home');
})

app.get("/login",(req,res)=>{
    res.render('login');
})

app.post("/login",(req,res)=>{
    req.body.userAgent = req.get('User-Agent')
    dataServiceAuth.checkUser(req.body)
    .then(user=>{
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
            }
        res.redirect('./employees')
    }).catch(err=>{
        res.render("login",{errorMessage: err, userName: req.body.userName})
    })
})

app.get("/register",(req,res)=>{
    res.render('register');
})

app.post("/register",(req,res)=>{
    dataServiceAuth.registerUser(req.body)
    .then(result=>{
        res.render("register",{successMessage:"User created"})
    }).catch(err=>{
        res.render("register",{errorMessage: err, userName: req.body.userName})
    })
})

app.get("/logout",(req,res)=>{
    req.session.reset();
    res.redirect("/");
})

app.get("/about",(req,res)=>{
    res.render('about');
})

app.get("/userHistory",ensureLogin,(req,res)=>{
    res.render('userHistory');
})

app.get("/employees",ensureLogin,(req,res)=>{
    
    const filter = Object.keys(req.query); 
    if(filter.length==1){//check if query exists
        switch(filter[0]){
            case "status": 
            dataService.getEmployeesByStatus(req.query.status)
                .then(result=>{
                    res.render("employees",{employees:result})},
                    err=> res.render("employees",{message:err}))
                    .catch((err)=>{
                        res.status(500).send("Unable to get Employee");
                        });
                break;
            case "department" : 
            dataService.getEmployeesByDepartment(req.query.department)
                .then(
                    result=>{res.render("employees",{employees:result})},
                    err=> res.render("employees",{message:err}))
                    .catch((err)=>{
                        res.status(500).send("Unable to get Employee");
                        });
                break;
            case "manager" : 
            dataService.getEmployeesByManager(req.query.manager)
                .then(result=>{res.render("employees",{employees:result})},err=> res.render("employees",{message:err}))
                .catch((err)=>{
                    res.status(500).send("Unable to get Employee");
                    });
                break;
            default:
                dataService.getAllEmployees().then(
                    result=>{res.render("employees",{employees:result})},
                    err=> res.render("employees",{message:err}))
                    .catch((err)=>{
                        res.status(500).send("Unable to get Employee");
                        });
        }
    }else{
        dataService.getAllEmployees().then(result=>{res.render("employees",{employees:result})},err=> res.render("employees",{message:err}))
        .catch((err)=>{
            res.status(500).send("Unable to get Employee");
            });
    }
    
    
})




app.get("/departments",ensureLogin,(req,res)=>{
    dataService.getDepartments().then(result=>{res.render("departments",{departments:result})},err=> res.render("departments",{message:err}))
    .catch((err)=>{
        res.status(500).send("Unable to get Departments");
        });
})

app.get("/employees/add",ensureLogin,(req,res)=>{
    dataService.getDepartments().then(result=>{
        res.render("addEmployee",{departments:result})},
        err=> res.render("employee",{message:err}))
        .catch((err)=>{
            res.status(500).send("Unable to get Employee");
            });
})

app.get("/images/add",ensureLogin,(req,res)=>{
    res.render('addImage')
})

app.post("/images/add",upload.single("imageFile"),(req,res)=>{
    res.redirect('/images');
})

app.get("/images",ensureLogin,(req,res)=>{
    fs.readdir("./images/uploaded", function(err, files){
        res.render("images",{images:files})
    })
    
})

app.post("/employees/add",ensureLogin,(req,res)=>{
    dataService.addEmployee(req.body).then(result=>{
        res.redirect('/employees')
    },err=>{
        res.send({message:err})
    })
    .catch((err)=>{
        res.status(500).send("Unable to get Employee");
        })
})

app.get("/employee/:empNum",ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
    if (data) {
    viewData.employee = data; //store employee data in the "viewData" object as "employee"
    } else {
    viewData.employee = null; // set employee to null if none were returned
    }
    }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error
    }).then(dataService.getDepartments)
    .then((data) => {
    viewData.departments = data; // store department data in the "viewData" object as "departments"
    // loop through viewData.departments and once we have found the departmentId that matches
    // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
  
    for (let i = 0; i < viewData.departments.length; i++) {
    if (viewData.departments[i].departmentId == viewData.employee.department) {
    viewData.departments[i].selected = true;
    }
    }
    }).catch(() => {
    viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
    if (viewData.employee == null) { // if no employee - return an error
    res.status(404).send("Employee Not Found");
    } else {
    res.render("employee", { viewData: viewData }); // render the "employee" view
    }
    });
});

app.post("/employee/update",ensureLogin,(req,res)=>{
    dataService.updateEmployee(req.body)
    .then(result=> res.redirect("/employees"),err=> res.render("employee",{message:err}))
    .catch((err)=>{
        res.status(500).send("Unable to get Employee");
        });
})

app.get("/departments/add",ensureLogin,(req,res)=>{
    res.render('addDepartment')
})

app.post("/departments/add",ensureLogin,(req,res)=>{
    dataService.addDepartment(req.body).then(result=>{
        res.redirect('/departments')
    },err=>{
        res.send({message:err})
    })
    .catch((err)=>{
        res.status(500).send("Unable to get departments");
        })
})

app.post("/departments/update",ensureLogin,(req,res)=>{
    dataService.updateDepartment(req.body)
    .then(result=> res.redirect("/departments"),err=> res.render("department",{message:err}))
    .catch((err)=>{
        res.status(500).send("Unable to get departments");
        });
})

app.get("/department/:departmentId",ensureLogin,(req,res)=>{
    dataService.getDepartmentById(req.params.departmentId)
    .then(result=>{
        if(result!=undefined){
            res.render("department",{department:result}) 
        }else{
            res.status(404).send("Department Not Found")
        };
        },
        err=>{res.status(404).send("Department Not Found")}
        )
        .catch((err)=>{
            res.status(500).send("Unable to get departments");
            });
});

app.get("/employees/delete/:empNum",ensureLogin,(req,res)=>{
    dataService.deleteEmployeeByNum(req.params.empNum).then(
        result=>{res.redirect("/employees")},
        err=> res.status(500).send("Unable to Remove Employee / Employee not found")
    ).catch((err)=>{
        res.status(500).send("Unable to Remove Employee / Employee not found");
        })
})

dataService.initialize()
.then(dataServiceAuth.initialize)
.then(result=>{
    app.listen(port,()=>{
        console.log(`Express http server listening on ${port}`)
    })
},err=>{
    console.log("Unable to start up server", err)
})

function ensureLogin(req, res, next) {
    console.log(req.session)
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }