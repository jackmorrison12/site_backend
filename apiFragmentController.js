// contactController.js
// Import apiFragment model
APIFragment = require('./apiFragmentModel');
// Handle index actions
exports.index = function (req, res) {
    APIFragment.get(function (err, apiFragments) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "APIFragments retrieved successfully",
            data: apiFragments
        });
    });
};
// Handle create API Fragment actions
exports.new = function (req, res) {
    var apiFragment = new APIFragment();
    apiFragment.type = req.body.type;
    apiFragment.image = req.body.image;
    apiFragment.body = req.body.body;
    apiFragment.occur_date = req.body.occur_date;
// save the API Fragment and check for errors
    apiFragment.save(function (err) {
        // if (err)
        //     res.json(err);
res.json({
            message: 'New API Fragment created!',
            data: apiFragment
        });
    });
};
// Handle view API Fragment info
exports.view = function (req, res) {
    APIFragment.findById(req.params.apiFragment_id, function (err, apiFragment) {
        if (err)
            res.send(err);
        res.json({
            message: 'API Fragment details loading..',
            data: apiFragment
        });
    });
};
// Handle update API Fragment info
exports.update = function (req, res) {
APIFragment.findById(req.params.apiFragment_id, function (err, apiFragment) {
        if (err)
            res.send(err);
        apiFragment.type = req.body.typ;
        apiFragment.image = req.body.image;
        apiFragment.body = req.body.body;
        apiFragment.occur_date = req.body.occur_date;
// save the API Fragment and check for errors
        apiFragment.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'API Fragment Info updated',
                data: apiFragment
            });
        });
    });
};
// Handle delete API Fragment
exports.delete = function (req, res) {
    APIFragment.remove({
        _id: req.params.apiFragment_id
    }, function (err, apiFragment) {
        if (err)
            res.send(err);
res.json({
            status: "success",
            message: 'API Fragment deleted'
        });
    });
};