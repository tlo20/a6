/********** SET UP FOR DATABASE **********/
const mongoose = require("mongoose")
let userSchema,User;
const bcrypt = require("bcryptjs")

function initialize(){
    return new Promise( (resolve,reject)=>{
        const db = mongoose.createConnection("mongodb+srv://root:web_a6@cluster0.gkmnbul.mongodb.net/?retryWrites=true&w=majority")
        db.on('connected',()=>{
            //Set up Schema
            userSchema = new mongoose.Schema({
                "userName": String,
                "password" : String,
                "email": String,
                "loginHistory": [{
                    "dateTime": Date,
                    "userAgent" : String
                }]
            })
            User = db.model("users",userSchema)
            resolve()
        }) //End of connected

        db.on('error',(err)=>{
            reject(err)
        })
    }) //End of Promise
}
/********** SET UP FOR DATABASE **********/

function registerUser(userData){
    return new Promise( (resolve,reject)=>{
        //checking password
        if (
            userData.password==undefined||
            userData.password2==undefined||
            userData.password.trim().length==0 || 
            userData.password2.trim().length== 0
        ){
            reject("user name cannot be empty or only white spaces!")
        }

        if(userData.password!=userData.password2){
            reject("Passwords do not match")
        }

        //Encypt password
        bcrypt.hash(userData.password,10).then(hash=>{
            userData.password=hash
            console.log(userData)
            //Save new user to db
            let newUser = new User(userData)
            newUser.save().then( result=>{resolve()} )
            .catch(err=>{
                if(err.code==11000){reject("User Name already taken")}
                else{reject(`There was an error creating the user: ${err}`)}
            })  
        })
        
 
    }) 
}

function checkUser(userData){
    return new Promise( (resolve,reject)=>{
        User.findOne({"userName":userData.userName})
        .exec()
        .then( foundUser=>{

            //Encypt login password
            bcrypt.compare(userData.password,foundUser.password)
            .then(samePassword=>{

                //Wrong Password
                if(!samePassword){
                    reject(`Incorrect Password for user:${userData.userName}`)
                }else{
                //Correct Password
                    foundUser.loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent})
                    User.updateOne(
                        {"userName":foundUser.userName}, //query
                        {"$set":{"loginHistory":foundUser.loginHistory}},
                    ).exec().then(
                        sucess=>{resolve(foundUser)}
                    ).catch(err=>{
                        reject(`There was an error verifying the user:${err}`)
                    })   
                }
            })



        })
        //No Results Found
        .catch(err=>{
            reject(`Unable to find user: ${userData.userName}`)
        })
    })
}



module.exports = {
    initialize,
    registerUser,
    checkUser
}