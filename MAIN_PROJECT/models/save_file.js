const fs = require('fs')
const path = require('path')

const p = path.join(__dirname, '..', 'data', 'data.json')


const readmyfile = cb =>{
    fs.readFile(p, (err, filecontent) =>{
        if(err){
            cb([])
        }
        else{
        cb(JSON.parse(filecontent))
        }
    })
}

module.exports = class Save_file{ 
    constructor(m){
        this.data = m
    }
    save(){
        readmyfile(values=>{
            values.push(this)
            fs.writeFile(p, JSON.stringify(values), (err) =>{
                console.log(err)
            })
        })
    }
    static fetch(cb){
       readmyfile(cb)
    }
}


    
  