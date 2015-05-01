
	/* See if we can get recordSet out of the global scope */
	var recordSet = [];
	var currentSearchTerm = "";
	var currentId;
	var currentRecord = {};
	
	
	$(document).ready(function() {
		alert("document ready");
		$('#demoForm')[0].reset();
	});
	
	function handleResponse(response) {
		for (var i = 0; i < response.items.length; i++) {
			var item = response.items[i];
			//console.log(item);
			// in production code, item.text should have the HTML entities escaped.
			//document.getElementById("content").innerHTML += "<br>" + item.volumeInfo.publishedDate  + "&nbsp;" + item.volumeInfo.title + "&nbsp;" + item.id + "&nbsp;" + item.volumeInfo.authors 
			//+ "&nbsp;" + item.volumeInfo.readingModes.text  + "&nbsp;"+ item.volumeInfo.canonicalVolumeLink + "&nbsp;" + item.accessInfo.webReaderLink + "<br /><br />";
			
			//Record(id, title, subtitle, authors, publisher, publishedDate, description)
			record = new Record(item.id, item.volumeInfo.title, item.volumeInfo.subtitle, item.volumeInfo.authors,
				item.volumeInfo.publisher, item.volumeInfo.publishedDate, item.volumeInfo.description, item.accessInfo.webReaderLink);
				
			recordSet.push(record);
		} 
		console.log(recordSet);
		// Create the h1 displaying the current search term
		document.getElementById('searchBanner').innerHTML += "<h1>You searched for: " + currentSearchTerm;
		// pass record set to another function that builds the select list
		populateSelect(recordSet);
	}
    
    var form = document.getElementById('demoForm');
	if ( window.addEventListener ) { // avoid errors in incapable browsers
		form.addEventListener('submit', checkOnSubmit, true);
		//primarySelect.addEventListener('change', showDescription, true);
		primarySelect.addEventListener('change', buildCurrentRecord, true);
		googleBtn.addEventListener('click', showGooglePreview, true);
		//notesBtn.addEventListener('click', showNotes, true);
		//userFld.addEventListener('focus', showUserInfo, false);
		//userFld.addEventListener('blur', checkUserInfo, false);
	}
	/*
	selectField.addEventListener("change", function(){
		var myVal = selectField.value;
	*/
	
	/* Event handler function for form submit */
	function checkOnSubmit(e) {
		alert(form.elements[0].value);
		currentSearchTerm = form.elements[0].value;
		$("#content").html("");
		recordSet = [];
		document.getElementById('searchBanner').innerHTML = "";
		document.getElementById('primarySelect').options.length = 1;
		$("<script>", {  src : "https://www.googleapis.com/books/v1/volumes?q=" + form.elements[0].value + "&callback=handleResponse"}).appendTo("body");
		$('#demoForm')[0].reset();
		
		// make getter and setter work for the search term
		//var currentSearchTerm = SearchTerm(form.elements[0].value);
	
	}
	/* End event handler for form submit */
	
	/* Event handler for buildCurrentRecord */
	function buildCurrentRecord(e) {
		currentId = primarySelect.value;
		alert("We're in buildCurrentRecord and the value is " + currentId);
		var descript;
		
		// loop to find the array entry that matches the id
		// write it the old fashioned way, then try jQuery each
		if ( recordSet ) {
			var len = recordSet.length;
			for ( var i = 0 ; i < len ; i++ ) {
				if ( recordSet[i].id == currentId ) {
					alert( recordSet[i].id + " == " + currentId );
					currentRecord = new Record(recordSet[i].id, recordSet[i].title, recordSet[i].subtitle, recordSet[i].authors,
				recordSet[i].publisher, recordSet[i].publishedDate, recordSet[i].description, recordSet[i].previewLink); 
					
				}
			}
		}
		alert(currentRecord.info());
		showDescription(currentRecord.description);
	}
	/* End event handler for showDescription */
	/* Event handler for showDescription */
	function showDescription(description) {
		document.getElementById('description').innerHTML = description;
	}
	/* End event handler for showDescription */
	
	/* Event handler for googleBtn click v1 */
	
	// Doesn't work when js code is separated into .js file 
	// Try with preview link embedded in an iframe
	
	function showGooglePreview(e) {
      //{ other_params : 'libraries=places&sensor=false&key=my_key', callback : ... })
      
      //google.load("books", "0", { other_params : 'key=AIzaSyDg_3CqVhiLDOU6EjCSkY9X7o_CGg8KwSQ' });
      google.load("books", "0");
      function initialize() {
        var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
        viewer.load('ISBN:0738531367');
        //viewer.load('id:' + currentRecord.id);
      }
      google.setOnLoadCallback(initialize);
    }
    
	/* End event handler for googleBtn click */
	
	/* Event handler for googleBtn click v2 */
	/*
	function showGooglePreview(e) {
		alert("inside showGooglePreview function, current record is <br>" + currentRecord.previewLink);
		
		// set up an iframe in the viewerCanvas div
		var x = document.createElement("IFRAME");
		//document.getElementsByTagName("H1")[0].setAttribute("class", "democlass");
		x.setAttribute("width", "600px");
		x.setAttribute("height", "500px");
		//document.getElementById("myFrame").src = "http://www.cnn.com";
		x.src = currentRecord.previewLink;
		document.getElementById('viewerCanvas').appendChild(x);
		
	}
	*/
	/* END: Event handler for googleBtn click v2 */
	
	
	/* Event handler for notesBtn click */
	
	/* End event handler for notesBtn click */

	/*
	function showUserInfo(e) {
		//alert(e.type); // access event properties
		//var form = this.form; // to access form 
		//var terms = form.elements['terms']; // acccess other form elements
		//alert(terms.value);
	
		this.className = 'active'; // display span with validation info
	} */

	/*
	function checkUserInfo(e) {
		this.className = '';
	
		if ( this.value.length < 8 ) {
			this.className = 'error';
		}
	} */
	/* Function to return the search term for use outside on submit */
	
	/*
	function SearchTerm(searchTerm) {
		this.searchTerm = searchTerm;
		console.log("Inside SearchTerm custom object");
		
		//functions
		// getSearchTerm
		this.getSearchTerm = function() {
			return this.searchTerm;
		}
		
		// clearSearchTerm
		this.clearSearchTerm = function() {
			this.searchTerm = "";
			return this.searchTerm;
		}
	}
	*/
	
	/* End function to return the search term for use outside on submit */
	
	/* Function to create custom object for each record passed in */
	
	function Record(id, title, subtitle, authors, publisher, publishedDate, description, previewLink, searchTerm) {
			this.id = id; 				
			this.title = title;		
			this.subtitle = subtitle;	
			this.authors = authors;				
			this.publisher = publisher;					
			this.publishedDate = publishedDate;				
			this.description = description;
			this.previewLink = previewLink;
			this.searchTerm = searchTerm;			
	
			//functions
			
			this.info = function() {
				return "id: " + this.id + " title: " + this.title + " subtitle: " + this.subtitle +
					" authors: " + this.authors + " publisher: " + this.publisher + " publication date: " + 
					this.publishedDate + " description: " + this.description + " preview link: " +
					this.previewLink + "."
			}; 
	 } 
	
	 /* End Function to create Custom object for each record passed in */
	 
	/* populate the select control with titles & authors */
	function populateSelect(recordSet) {
		'use strict';
		//get the select field by id
		var selectField = document.getElementById("primarySelect"); 
	
		// Flag variable for use in finite state machine logic
		var selectFieldSet = 'FALSE';

		//Loop through the array
		for ( var i = 0; i < recordSet.length ; i++ ) {
		//for(var i = 0; i < optionsSelect.length; i++) {
	
			//create an option tag
			var element = document.createElement("option");

			//add the strings from your array into each option tag
			var words = document.createTextNode(recordSet[i].title + " by " + recordSet[i].authors);
	
			//set the value of each option to the strings from your array
			element.value = recordSet[i].id;
	
			//append each Text Node to each option tag.
			element.appendChild(words);
	 
			//append each option tag to to the select field
			selectField.appendChild(element);
		}
	}  
	/* populate the select control with titles & authors */

