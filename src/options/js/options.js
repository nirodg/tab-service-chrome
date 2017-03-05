
function save_options(){

	var ssServer = document.getElementById('server').value;
	var ssPort = document.getElementById('port').value;
	var ssOptionDebug = document.getElementById('optionDebug').checked;
	var status = document.getElementById('status');

	if(ssServer.length==0 && ssPort.length==0){

		requiredInput('server');
		requiredInput('port');

		status.textContent = 'The fields are required';
		status.className = "status status-info";
		
	}else{
		chrome.storage.sync.set({
			server : ssServer,
			port : ssPort,
			optionDebug : ssOptionDebug
		},function(){

			status.textContent = 'Options saved';
			status.className = "status status-success";
			setTimeout(function() {
		      status.textContent = '';
		      status.className = "status";
		    }, 750);

			// reload extension
				// chrome.runtime.reload();

		});
	}
	
}

function reset_options(){
	
	 chrome.storage.sync.set({
	    server : '',
		port : '',
		optionDebug : false
	  }, function(items) {
		    document.getElementById('server').value = '';
			document.getElementById('port').value = '';
			document.getElementById('optionDebug').checked = false;
			
			var status = document.getElementById('status');
			status.textContent = 'Options cleaned';
			status.className = "status status-success";
			setTimeout(function() {
		      status.textContent = '';
		      status.className = "status";
		    }, 750);

	  });

}

function requiredInput(id){
	var input = document.getElementById(id).value;
	if(input.length==0){
		input.className = "input-info";
	}else{
		input.className = "";
	}
}

function domContentLoaded(){

	 chrome.storage.sync.get({
	    server : '',
			port : '',
			optionDebug : false
	  }, function(items) {
	    document.getElementById('server').value = items.server;
			document.getElementById('port').value = items.port;
			document.getElementById('optionDebug').checked = items.optionDebug;
			
			var status = document.getElementById('status');
			status.textContent = 'Data loaded successfuly';
			status.className = "status status-success";
			
			setTimeout(function() {
	      status.textContent = '';
	      status.className = "status";
	    }, 2000);


			if(document.getElementById('optionDebug').checked){
				console.info("Debug mode activated");
				
			}

	  });
}

// Listeners
document.addEventListener('DOMContentLoaded', domContentLoaded, false);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('reset').addEventListener('click', reset_options);