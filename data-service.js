/*********************************************************************************
* BTI325 – Assignment 4
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
const fs = require("fs")

let employees = []
let departments = []

function initialize(){
    return new Promise( 
        (resolve,reject)=>{
    
        fs.readFile('./data/employees.json',(err,data)=>{
            if (err)reject("Failure to read file employees.json!")
            employees = JSON.parse(data);
    
            fs.readFile('./data/departments.json',(err,data)=>{
                if (err) reject("Failure to read file employees.json!");
                departments = JSON.parse(data)
                resolve("success reading data")
            }) 
        })
    })
} 


function getAllEmployees(){
    return  new Promise( (resolve,reject)=> {
        employees.length > 0 ? resolve(employees) : reject("Data not found!")   
    })  
} 

function getManagers (){ return new Promise( (resolve,reject)=> {
    let managers = employees.filter(employee=>employee.isManager==true)
    employees.length > 0 ? resolve(managers) : reject("Data not found!") 
})}

function getDepartments (){ return new Promise( (resolve,reject)=> {
    employees.length > 0 ? resolve(departments) : reject("Data not found!") 
})}

function addEmployee(employeeData){
    return new Promise((resolve,reject)=>{
        if(employeeData==undefined){reject("Unable to add new employee.")}
        employeeData.isManager = (employeeData.isManager==undefined) ? false : true
        employeeData.employeeNum = employees.length+1
        employees.push(employeeData)
        resolve("New employee sucessfully added!")
    })
}

function getEmployeesByStatus(status){
    return  new Promise( (resolve,reject)=> {
        if(employees.length==0){reject("Data not found!")  }
        let result=[]
        for (let employee of employees){
            if(employee.status==status){result.push(employee)}
        }
        if(result.length==0){reject("No matched results!")  }
        resolve(result)
    }) 
}

function getEmployeesByDepartment(department){
    return  new Promise( (resolve,reject)=> {
        if(employees.length==0){reject("Data not found!")  }
        let result=[]
        for (let employee of employees){
            if(employee.department==department){result.push(employee)}
        }
        if(result.length==0){reject("No matched results!")  }
        resolve(result)
    }) 
}

function getEmployeesByManager(manager){
    return  new Promise( (resolve,reject)=> {
        if(employees.length==0){reject("Data not found!")  }
        let result=[]
        for (let employee of employees){
            if(employee.employeeManagerNum==manager){result.push(employee)}
        }
        if(result.length==0){reject("No matched results!")  }
        resolve(result)
    }) 
}

function getEmployeeByNum(num){
    return  new Promise( (resolve,reject)=> {
        if(employees.length==0){reject("Data not found!")  }

        for (let employee of employees){
            if(employee.employeeNum==num){resolve(employee)}
        }
        reject("No matched results!")
    }) 
}

function updateEmployee(employeeData){
    return  new Promise( (resolve,reject)=> {
        
        for (let i=0;i<employees.length;i++){
            if (employees[i].employeeNum==employeeData.employeeNum){
                employees[i] = employeeData
                resolve()
            }
        }

        reject("No matched results!")
    }) 
}

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
    updateEmployee
}