const fs = require('fs')
const path = require('path')

const chendu = path.join(__dirname,'prathamesh_deep_learning_2020-07-21.json')

try {
  if (fs.existsSync(chendu)) {
      console.log('It is there')
    //file exists
  }
} catch(err) {
  console.error(err)
}