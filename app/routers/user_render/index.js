const router = require('express').Router();
const userRenderController = require('./lib/controllers');

/********** Commond File Render **************/
router.get('/', userRenderController.landing);

router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;