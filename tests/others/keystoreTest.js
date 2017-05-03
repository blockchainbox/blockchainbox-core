var fs = require('fs');

var fileDir = process.env.KEYSTORE_PATH;
fs.readdir(fileDir, 'utf8', function(err, files) {
	if (err) console.log(err);
  files.forEach(function(file) {
    console.log(file);
    if (file.indexOf('2707318718f1c69ff55f5192cec64e117fdbbfde') >= 0) {
	    fs.readFile(fileDir + '/' + file, 'utf8', function(err, data) {
	    	console.log(data);
	    })
	  }
  });
})
