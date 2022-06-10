require('./env');
require('./globals');

const router = require('./app/routers');

router.initialize();

module.exports = router;