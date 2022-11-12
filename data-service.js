/*********************************************************************************
* BTI325 – Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: LO TSZ KIT Student ID: 160067211 Date: 2022/10/26
*
* * https://senecaweba4.herokuapp.com/
* _______________________________________________________
*
********************************************************************************/

const Sequelize = require('sequelize');

/********** SET UP FOR DATABASE **********/
var sequelize = new Sequelize('rynlyfdt', 'rynlyfdt', 'xri_osgUXTvtCV0kvuz_9ItRhF_UxThb', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });
/********** SET UP FOR DATABASE **********/

function initialize(){
 
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(resolve(),err=>reject("unable to sync the database"));
    });
} 


function getAllEmployees(){
    return new Promise(function (resolve, reject) {
        Employee.findAll({order:sequelize.col('employeeNum')}).then(result=>resolve(result),err=>reject("Data not found!"))
    });
} 

function getManagers (){ 
    return new Promise(function (resolve, reject) {
        reject();
    });
    /*
    return new Promise( (resolve,reject)=> {
    let managers = employees.filter(employee=>employee.isManager==true)
    employees.length > 0 ? resolve(managers) : reject("Data not found!") 
    })
    */
}

function getDepartments (){ 
    return new Promise(function (resolve, reject) {
        Department.findAll({order:sequelize.col('departmentId')}).then(result=>resolve(result),err=>reject("Data not found!"))
    });

}

function addEmployee(employeeData){
    return new Promise(function (resolve, reject) {
        if(employeeData==undefined){err=>reject("Unable to add new employee.")}
        employeeData.isManager = (employeeData.isManager===undefined) ? false : true
        for (attr in employeeData){
            if (employeeData[attr]==''){employeeData[attr] = null;}
        }
        Employee.create(employeeData).then(resolve(),err=>reject("Unable to add employee"))
    });

}

function getEmployeesByStatus(_status){
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{status:_status}}).then(result=>resolve(result),err=>reject("Data not found!"))
    });
 
}

function getEmployeesByDepartment(_department){
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{department:_department}}).then(result=>resolve(result),err=>reject("Data not found!"))
    });
}

function getEmployeesByManager(manager){
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{employeeManagerNum:manager}}).then(result=>resolve(result),err=>reject("Data not found!"))
    });

}

function getEmployeeByNum(num){
    return new Promise(function (resolve, reject) {
        Employee.findAll({where:{employeeNum:num}}).then(result=>resolve(result[0]),err=>reject("Data not found!"))
    });

}

function updateEmployee(employeeData){
    return new Promise(function (resolve, reject) {
        if(employeeData==undefined){reject("Unable to update employee.")}
        employeeData.isManager = (employeeData.isManager==undefined) ? false : true
        for (attr in employeeData){
            if (employeeData[attr]==""){employeeData[attr] = null;}
        }

        Employee.update(employeeData).then(resolve(),err=>reject("Unable to update employee"))
    });
}

function addDepartment(departmentData){
    return new Promise(function (resolve, reject) {
    for (attr in departmentData){
        if (departmentData[attr]==""){departmentData[attr] = null;}
    }
    Department.create(departmentData,resolve(),err=>reject("Unable to add department"))
    })
}

function updateDepartment(departmentData){
    return new Promise(function (resolve, reject) {
    for (attr in departmentData){
        if (departmentData[attr]==""){departmentData[attr] = null;}
    }
    Department.update(departmentData,{where:{departmentId:departmentData.departmentId}})
    .then(resolve(),err=>reject("Unable to update department"))
    })
}
function getDepartmentById(id){
    return new Promise(function (resolve, reject) {
        Department.findAll({where:{departmentId:id}}).then(result=>resolve(result[0]),err=>reject("Data not found!"))
    });
}

function deleteEmployeeByNum(empNum){
    console.log(empNum)
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
          }).then(resolve("DONE"),err=>reject("Unable to remove record"))
    });
}

let Employee = sequelize.define('Employee', {
    employeeNum: {type:Sequelize.INTEGER,primaryKey:true,autoIncrement:true},
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet:Sequelize.STRING,
    addressCity:Sequelize.STRING,
    addressState:Sequelize.STRING,
    addressPostal:Sequelize.STRING,
    maritalStatus:Sequelize.STRING,
    isManager:Sequelize.BOOLEAN,
    employeeManagerNum:Sequelize.INTEGER,
    status:Sequelize.STRING,
    department:Sequelize.INTEGER,
    hireDate:Sequelize.STRING
});

let Department = sequelize.define('department',{
    departmentId : {type:Sequelize.INTEGER,primaryKey:true,autoIncrement:true},
    departmentName:Sequelize.STRING
});



module.exports = {
    initialize,
    getAllEmployees,
    getManagers,
    getDepartments,
    addEmployee,
    getEmployeesByStatus,
    getEmployeesByDepartment,
    getEmployeesByManager,
    getEmployeeByNum,
    updateEmployee,
    addDepartment,
    updateDepartment,
    getDepartmentById,
    deleteEmployeeByNum
}