const express=require("express")
const { open }=require("sqlite")
const sqlite3=require("sqlite3")
const path=require("path")
const bcrypt=require("bcrypt")
const dbPath=path.join(__dirname,userData.db);
const app=express()
app.use(express.json())
let database=null
const initializeDbAndServer =async ()=>{
    try{
        database=await open){
            filename:dbPath,
            driver:sqlite3.Database
        }
        app.listen(3000,()=>{
            console.log("Server is running")
        });
    }
    catch(error){
        console.log(`database Error ${error.message}`)
        process.exit(1)
    }
}
initializeDbAndServer()
const passWordLength=(password)=>{
    return password.length>4;
}
app.post("/register", async (request,response)=>{
    const {username,name,password,gender,location}=request.body
    const hashedPassword=await bcrypt.hash(password,10)
    const userQuery=`SELECT * 
    FROM user
    WHERE 
        username='${username}';`;
    const dbResponse=await database.run(userQuery)
    if(dbResponse===undefined){
        const createQuery=`
        INSERT INTO 
        user(username,name,password,gender,location)
        VALUES('${username}','${name}','${password}','${gender}','${location}');`;
        if(passWordLength(password)){
            await database.run(userQuery);
            response.status(200)
            response.send("User created successfully")
        }
        else{
            response.status(400)
            console.log("password is too short")
        }
    }
    else{
        response.status(400)
        console.log("User already exists")
    }
});
app.post("/login",async (request,response)=>{
    const {username,password}=request.body
    const selectUser=`SELECT * FROM user WHERE username='${username}';`;
    const dbResponse=await database.run(selectUser)
    if(dbResponse===undefined){
        response.status(400)
        response.send("Invalid user")
    }
    else{
        const isPassword=bcrypt.compare(password,dbResponse.password)
        if(isPassword===true){
            response.status(200)
            response.send("Login success!")
        }
        else{
            response.status(400)
            response.send("Invalid password")
        }
    }
});
app.put("/change-password", async (request,response)=>{
    const {username,oldPassword,newPassword}=request.body
    const selectUserQuery=`SELECT * FROM user WHERE username='${username}';`;
    const responSe=await database.run(selectUserQuery);
    if(responSe===undefined){
        response.status(400)
        response.send("Invalid user")
    }else{
        const isPassword=bcrypt.compare(oldPassword,responSe.password)
        if(isPassword===true){
            if(passWordLength(newPassword)){
                const hashedPassword=bcrypt.hash(newPassword,10)
                const updateQuery=`
                UPDATE user 
                SET 
                    password=${hashedPassword}
                WHERE 
                    username='${username}';`;
                await database.run(updateQuery)
                response.status(200)
                response.send("password updated")
            }
            else{
                response.status(400)
                response.send("password is too short")
            }
        }
        else{
            response.status(400)
            response.send("Invalid current password")
        }
    }
});
module.exports=app;
