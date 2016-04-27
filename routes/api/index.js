var router = require('express').Router();

router.use('/document', require('./document'));

module.exports = router;