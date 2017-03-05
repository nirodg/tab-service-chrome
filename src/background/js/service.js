var currentTabs = [];
var createdTabs = [];

var isBrowserCreated = false;

var service = {
	server : '',
	port : '',
	isDebug : false
};

var optionsDefined=true;

var xmlhttp = new XMLHttpRequest();

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    	if(service.isDebug) {
        console.info("Server result: " + JSON.parse(xmlhttp.responseText));
      }
    }
};

domContentLoaded();

if(service.isDebug) {
	console.info('Service started...');
}

chrome.tabs.query({}, function(tabs){
	
	if(optionsDefined){
		if(service.isDebug) {
			console.info('Found ' + tabs.length + ' tabs opened');
		}

		for(i=0; i < tabs.length; i++){
			var currTab = {
				tabId : tabs[i].id,
				windowId : tabs[i].windowId,
				name : tabs[i].title,
				url : tabs[i].url
			};
			
			// Add to array
			currentTabs.push(currTab);

			if(isBrowserCreated){
				// Send all tabs, one by one. 
				// TODO Should be refactored
				addTab(tabs[i].id, encode(tabs[i].title), encode(tabs[i].url) );
			}
		}
	}

});

chrome.tabs.onCreated.addListener(function(tab){

	if(optionsDefined){
		chrome.tabs.get(tab.id, function(currTab){

			if(currTab.title !='New Tab'){

				addTab(tab.id, encode(currTab.title), encode(currTab.url) );
				
				if(service.isDebug) {
					console.info('Send onCREATE');
				}

			}else{

				// Add to current opened tabs. They will be checked onUpdated listener
				var _tab = {		
					name : currTab.title,
					url : currTab.url,
					tabId : currTab.id,
					windowId : currTab.windowId,
				}
				createdTabs.push(_tab);

			}

			
		});
	}

});

chrome.tabs.onUpdated.addListener(function(id, changeInfo, tab){

	if(optionsDefined){
		if(changeInfo['status'] === 'complete'){

			// Recent opened tabs
			for(i=0; i< createdTabs.length; i++ ){

				if(createdTabs[i].tabId === id && tab.title != 'New Tab'){

					// send data to SparkService
					addTab(createdTabs[i].tabId , encode(tab.title), encode(tab.url) );
					
					if(service.isDebug){
						console.info(tab);
						console.info('Send onUPDATE');
					}

				}
			}

			// Before opened tabs
			for(i=0; i< currentTabs.length; i++ ){

				if(currentTabs[i].tabId === id ){

					// send data to SparkService
					addTab(currentTabs[i].tabId , encode(tab.title), encode(tab.url) );
					
					if(service.isDebug){
						console.info(tab);
						console.info('Send onUPDATE already created tabs');
					}

				}
			}


		}
	}

});

chrome.tabs.onRemoved.addListener(function(tabId){

	if(optionsDefined){
		if(service.isDebug){
			console.info('onDelete called');
		}

		if(currentTabs.length>0){		
			for (i = 0; i < currentTabs.length; i++) {
				if(tabId==currentTabs[i].tabId){
					removeTab(currentTabs[i].tabId);
					if(service.isDebug){
						console.info('[currentTabs] Deleting ' + currentTabs[i].name );
					}
				}
			}
		}

		if(createdTabs.length>0){
			for (i = 0; i < createdTabs.length; i++) {
				if(tabId==createdTabs[i].tabId){
					removeTab(createdTabs[i].tabId);
					if(service.isDebug){
						console.info('[createdTabs] Deleting ' + createdTabs[i].name );
					}
				}
			}
		}
	}

});


function addTab(tabId, title, url){
	xmlhttp.open("POST", service.completePath  + tabId + "?title="  + title + "&url=" + url, true);
	xmlhttp.send();
}

function removeTab(name){
	xmlhttp.open("DELETE", service.completePath + name, true);
	xmlhttp.send();
}

function encode(url) {
	return encodeURIComponent(url).replace(/'/g,"%27").replace(/"/g,"%22");	
}
function decode(url) {
	return decodeURIComponent(url.replace(/\+/g,  " "));
}

function domContentLoaded(){
	
	chrome.storage.sync.get({
		server : '',
			port : '',
			optionDebug : false
		}, function(items) {

			// Check if there are options
			if(items.server == null || items.server.length == 0 ||
				items.port == null || items.port.length ==  0 ){

				optionsDefined = false;

				// Open Options View
				chrome.tabs.create({ 'url': 'src/options/options.html' });
			}else{

				service.server = items.server;
				service.port = items.port;
				service.isDebug = items.optionDebug;
				
				// Create complete path
				service.completePath = service.server + ":" + service.port  + '/SparkServices/rest/browser/Chrome/';
			
				// Options defined
				optionsDefined = true
			}
		
	});

}