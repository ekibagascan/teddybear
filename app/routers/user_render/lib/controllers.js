const controllers = {};

controllers.landing = (req, res) => {
    return res.render('user/index');
};

module.exports = controllers;