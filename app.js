/*!
 * RESTful Visual Editor
 * https://github.com/gatools/restful-visual-editor
 *
 * Copyright(c) 2016 Vasiliy Uglitskiy.
 * Open source under GPLv3 license.
 */

/**
 * Dependencies.
 */
var express = require('express');
var fs = require('fs');
var app = express();

/**
 * Package.
 */
const pjson = require('./package.json');

/**
 * Setup express-js folders.
 */
app.use('/js', express.static('./www/js'));
app.use('/css', express.static('./www/css'));
app.use('/view', express.static('./www/view'));

/**
 * Setup express-js middleware.
 */
app.use(function(req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});

/**
 * GET: Request for project lists
 * Responses list of files in ./projects
 */
app.get('/get/project-list', function(req, res) {
    fs.readdir('./projects/', function(err, files) {
        if (err) {
            console.error(err);
            res.status(500).send("Error 500");
            return;
        }

        res.type('json');
        res.send({
            "files": files
        });
    });
});

/**
 * GET: Request for project
 * Responses project json
 */
app.get('/get/project/:projectFileName', function(req, res) {
    fs.readFile('./projects/' + req.params.projectFileName, function(err, data) {
        if (err) {
            console.error(err);
            res.status(500).send("Error 500");
            return;
        }

        res.type('json');
        res.send(data);
    });
});

/**
 * POST: This method saves project
 */
app.post('/save/project/:projectFileName', function(req, res) {
    fs.writeFile('./projects/' + req.params.projectFileName, req.body, 'utf8', function(err) {
        if (err) {
            console.error(err);
            res.status(500).send("Error 500");
            return;
        }

        res.send("success");
    });
});

/**
 * GET: Request for create new project
 * Responses project file name
 */
app.get('/create/:projectName', function(req, res) {
    var projectName = req.params.projectName;

    // replace invalid path charters
    var filename = req.params.projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json';

    // check if project alrady exists
    fs.access('./projects/' + filename, fs.F_OK, function(err) {
        if (!err) {
            res.status(400).send("Project already exists");
        } else {
            fs.writeFile('./projects/' + filename, JSON.stringify({
                "editor_version": pjson.version,
                "title": projectName
            }), 'utf8', function(err) {
                if (err) {
                    console.error(err);
                    res.status(500).send("Error create project file");
                    return;
                }
                res.send(filename);
            });
        }
    });
});

/**
 * GET: Main request
 * Responses project selection page
 */
app.get('/', function(req, res) {
    fs.readFile('./www/select-project.html', function(err, file) {
        if (err) {
            console.error(err);
            res.status(500).send("Error 500");
            return;
        }

        res.type('html');
        res.send(file);
    });
});

/**
 * GET: Working project request
 * Responses project working page
 */
app.get('/project/', function(req, res) {
    fs.readFile('./www/project.html', function(err, file) {
        if (err) {
            console.error(err);
            res.status(500).send("Error 500");
            return;
        }
        res.type('html');
        res.send(file);
    });
});

/**
 * Check if folder './projects/' exists and it accessible
 * If no errors, run server
 */
try {
    fs.accessSync('./projects/', fs.F_OK | fs.R_OK | fs.W_OK);
    app.listen(3000, function() {
        console.log('Listening on port 3000');
    });
} catch (err) {
    if (err.code == 'ENOENT') {
        console.error("Make projects dirictory first './projects'");
    } else {
        console.error(err);
    }
}
