const { ObjectId } = require("mongodb")
const mongoose  = require('mongoose')

const AddressSchema = new mongoose.Schema ({

    firstName : {
        type : String,
        required : true
    },
   

})

module.exports = mongoose.model("Address",AddressSchema)