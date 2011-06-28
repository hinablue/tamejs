
var astmod = require ('./ast');
var parser = require ('./parser').parser;
// Set the ast bindings into the parser's free yy variable
parser.yy = astmod;

function parse (txt) {

    console.log ("XXX " + txt);


    var res = parser.parse (String (txt));
    var ast = null;
    if (res) { 
	ast = parser.yy.output;
	ast.compress ();
	var dump = ast.dump ();
	var s = JSON.stringify (dump);
	console.log (s);
    }
    return ast;
};

function produce (ast) {
    var Engine = require ('./engine').Engine;
    var engine = new Engine ();
    return engine.run (ast);
};

function main (infile, output) {
    var fs = require ('fs');
    fs.readFile (infile, function (err, data) {
	if (err) throw err;
	var ast = parse (data);
	var out = produce (ast);
	fs.writeFile (outfile, out.formatOutput (), function (err)  {
	    if (err) throw err;
	});
    });
};

main (process.argv[2], process.argv[3]);
