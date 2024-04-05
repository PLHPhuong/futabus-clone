const express = require("express")
const router = express.Router()

router.get('/',(request,response)=>{
    console.log(`Pin to router successfully\n`)
    response.status(200).send(request.body)
})

router.use('/v1',require("./v1/index.js"))

module.exports = router
