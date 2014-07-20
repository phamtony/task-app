storageEngine = function() {
	var initialized = false;
	var initializedObjectStores = {};

  function getStorageObject(type) {
    var item = localStorage.getItem(type);
    var parsedItem = JSON.parse(item);
    return parsedItem;
  }

	return {
		
		init : function(sucessCallback, errorCallback) {
			if (window.localStorage) {
				initialized = true;
				sucessCallback(null);
			} else {
				errorCallback('storage_api_not_supported', 'The web storage api is not supported');
			}
		},

		initObjectStore : function(type, sucessCallback, errorCallback) {
			if (!initialized) {
				errorCallback('storage_api_not_supported', 'The web storage api is not supported');
			} else if (!localStorage.getItem(type)) {
				localStorage.setItem(type, JSON.stringify({}));
			}
			initializedObjectStores[type] = true;
			sucessCallback(null);
		},

		save : function(type, obj, sucessCallback, errorCallback) {
			if (!initialized) {
				errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
			} else if (!initializedObjectStores[type]) {
				errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
			}
			if (!obj.id) {
				obj.id = $.now();
			}
			var storageItem = getStorageObject(type); 
			storageItem[obj.id] = obj;

			localStorage.setItem(type, JSON.stringify(storageItem));
			sucessCallback(obj);
		},

		findAll : function(type, sucessCallback, errorCallback) {
			if (!initialized) {
				errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
			} else if (!initializedObjectStores[type]) {
				errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
			}
			var result = [];
			var storageItem = getStorageObject(type);
			$.each(storageItem, function(i, v) {
				result.push(v);
			});
			sucessCallback(result);
		},

		delete : function(type, id, sucessCallback, errorCallback) {	
			if (!initialized) {
				errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
			} else if (!initializedObjectStores[type]){
				errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
			}

			var storageItem = getStorageObject(type);
			if(storageItem[id]) {
				delete storageItem[id];
				localStorage.setItem(type, JSON.stringify(storageItem));
				sucessCallback(id);
			} else {
				errorCallback('object_not_found', 'The object requested could not be found');
			}
		},

		findByProperty : function(type, propertyName, propertyValue, sucessCallback, errorCallback) {
			if (!initialized) {
				errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
			} else if (!initializedObjectStores[type]){
				errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
			}

			var result = [];
			var storageItem = getStorageObject(type);
			$.each(storageItem, function(i, v) {
				if (v[propertyName] === propertyValue) {
					result.push(v);
				}
			});
			sucessCallback(result);
		},

		findById : function(type, id, sucessCallback, errorCallback) {
      if (!initialized) {
        errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
      } else if (!initializedObjectStores[type]){
        errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
      }

      var storageItem = getStorageObject(type);
      var result = storageItem[id];
      sucessCallback(result);
		}

	}
}();






