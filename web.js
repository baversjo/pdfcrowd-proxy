var http = require('http');
var url = require('url');
var pdf = require('pdfcrowd');

var api_key = process.env.NODE_API_KEY;
var pdfc = new pdf.Pdfcrowd(process.env.PDFCROWD_USER,process.env.PDFCROWD_API_KEY);

http.createServer(function (req, res) {
  var req_params = url.parse(req.url,true);
  var params = req_params.query;
  var action = params['action'];
  if(!action && params['url']){
    action = 'pdf';
  }
  var param_api_key = params.api_key;
  
  delete params['api_key'];
  
  if(api_key && param_api_key != api_key){
    res.writeHead(401, {'Content-Type': 'text/plain'});
    res.end('unauthorized\n');
    return;
  }
  
  if(action == 'pdf'){    
    var pdf_url = params.url,
    filename = params.filename;
    
    delete params['url'];
    delete params['filename'];
  
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
  }
  else if(action == 'wait'){
    var wait_time = parseInt(params['wait_time']);
    
    setTimeout(function(){
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('done\n');
    },wait_time);
    
  }else{
    res.writeHead(400, {'Content-Type': 'text/plain'});
    res.end('Unknown action specified\n');
  }
  
}).listen(process.env.PORT || 5000);