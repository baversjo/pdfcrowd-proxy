var http = require('http');
var url = require('url');
var pdf = require('pdfcrowd');

var api_key = process.env.NODE_API_KEY;
var pdfc = new pdf.Pdfcrowd(process.env.PDFCROWD_USER,process.env.PDFCROWD_API_KEY);

http.createServer(function (req, res) {
  var req_params = url.parse(req.url,true);
  var params = req_params.query;

    
  var pdf_url = params.url,
  filename = params.filename,
  param_api_key = params.api_key;
  
  delete params['url'];
  delete params['filename'];
  delete params['api_key'];
  
  if(api_key && param_api_key != api_key){
    res.writeHead(401, {'Content-Type': 'text/plain'});
    res.end('unauthorized\n');
    return;
  }  
  
  res.writeHead(200, {'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="' + (filename || 'generated') + '.pdf"'
  });
  
  
  
  pdfc.convertURI(pdf_url,new function(){
    this.pdf = function(stream){
      stream.on('data',function(buffer){
        res.write(buffer);
      })
    }
    this.end = function(){
      res.end();
    }
    this.error = function(errorMessage, statusCode){
      res.end('error ' + statusCode + ', ' + errorMessage);
    }

  },params);
}).listen(process.env.PORT || 5000);