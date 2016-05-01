var router = require('express').Router();

router.use('/document', require('./document'));
router.use('/workflow', require('./workflow'));
router.use('/users', require('./users'));

module.exports = router;