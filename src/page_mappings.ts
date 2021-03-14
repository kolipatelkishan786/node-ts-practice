let page_mappings = {
    loadMappings: function (app) {
        app.get('/', function (req, res, next) {
            res.redirect('/index.html');
        });
        app.get('/*\.html', function (req, res, next) {
            let url = req.url;
            url = url.replace('/', '');
            url = url.replace('.html', '');
            res.render(url, {
                req: req,
                res: res
            }, function (err, html) {
                if (err) {
                    console.log(err);
                    // res.redirect("/PageNotFound.html"); // File doesn't exist
                } else {
                    res.send(html);
                }
            });
        });
    }
};
export = page_mappings;
