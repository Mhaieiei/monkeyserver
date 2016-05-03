var router = require('express').Router();

router.use('/document', require('./document'));
router.use('/workflows', require('./workflow'));
router.use('/services', require('./service'));
router.use('/users', require('./users'));

module.exports = router;