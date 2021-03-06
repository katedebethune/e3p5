/* 
 * A Personal Book Viewer
 * Project 5 - Final Project
 * CSCI e3 - May 11, 2015
 * Kate de Bethune
 *
 * Summary: This project combines two pieces of sample code from the Google Books API
 * developer documentation to create a simple, but powerful personal book viewer.
 * The end user can 
 *  --search the Google books database 
 *  --select a title from a drop-down populated by the return values from the search
 *  --see the description of the selected title
 *  --click buttons to see
 *		--their personal notes for that volume (if they exist)
 *		--the Google reader preview version of volume, embedded in the page
 *  at any time, a new book may be selected from the current list, or a new search
 *  initiated.
 *
 *  Google example code from the Google Books Developer documentation 
 *  was studied and adapted for this project. Specifically:
 *  https://developers.google.com/books/docs/viewer/developers_guide
 *  https://developers.google.com/books/docs/getting-started
 *  https://developers.google.com/books/docs/v1/getting_started
 */
  
 $("document").ready(function() {
		//alert("document ready");
		$('#demoForm')[0].reset();
		/* See if we can get recordSet out of the global scope */
		var recordSet = [];
		var currentSearchTerm = "";
		var currentId;
		var currentRecord = {};
		var currentISBN;
		var iframeSet = false;
});
	
	
	/*
	 * handleResponse
	 * @param - response
	 * 
	 * Callback function from the Google Books api
	 * Returns list of books
	 *
	 */ 
	
	function handleResponse(response) {
		
		console.log(response);

		for (var i = 0; i < response.items.length; i++) {
			var item = response.items[i];
			
			record = new Record(item.id, item.volumeInfo.title, item.volumeInfo.subtitle, item.volumeInfo.authors,
				item.volumeInfo.publisher, item.volumeInfo.publishedDate, item.volumeInfo.description, item.volumeInfo.industryIdentifiers, item.accessInfo.webReaderLink, item.accessInfo.embeddable);
			recordSet.push(record);
		} 
		
		// Create the h1 displaying the current search term
		document.getElementById('searchBanner').innerHTML += "<h1>You searched for: " + currentSearchTerm;
		
		// pass record set to another function that builds the select list
		populateSelect(recordSet);
	}
       
    /*
     * Event Listeners
     * 
     * Clean this up - get the var out of global space
     */
    var form = document.getElementById('demoForm');
	if ( window.addEventListener ) { // avoid errors in incapable browsers
		// QUERY GOOGLE FOR THE CURRENT SEARCH TERM
		form.addEventListener('submit', checkOnSubmit, true);
		
		// BUILD OUT THE DATA FOR THE CURRENT SELECTION
		primarySelect.addEventListener('change', buildCurrentRecord, true);
		
		// SHOW NOTES
		notesBtn.addEventListener('click', showNotes, true);
		
		// SHOW GOOGLE PREVIEW
		googleBtn.addEventListener('click', createBookViewer, true);
	}
	
	/* 
	 * checkOnSubmit
	 * @param - e
	 * 
	 * Event handler function for search form submit 
	 */
	function checkOnSubmit(e) {
		//(form.elements[0].value);
		if ( form.elements[0].value ) {
			/* RESETS */
			if ( document.getElementById('googIframe') ) {
				$("#googIframe").remove();
			}
			$('#description').empty();
			$('#descriptionHeader').empty();
			currentSearchTerm = form.elements[0].value;
			$("#content").html("");
			recordSet = [];
			document.getElementById('searchBanner').innerHTML = "";
			document.getElementById('primarySelect').options.length = 1;
			$('#notesArea').empty();
			/* END RESETS */
			// help for the following came from: http://stackoverflow.com/questions/610995/cant-append-script-element
			$("<script>", {  src : "https://www.googleapis.com/books/v1/volumes?q=" + form.elements[0].value + "&startIndex=0&maxResults=40&printType=books&callback=handleResponse"}).appendTo("body");
			//maxResults
			$('#demoForm')[0].reset();
		} 
		else {
			alert( "Please enter your search terms." );
			form.elements[0].focus();
		}	
	}

	/*
	 * buildCurrentRecord
	 * @param - e 
	 *
	 * Handles change event for primarySelect and
	 * creates a record for the currently selected value.
	 * 
	 * Calls show description
	 *
	 * Clears the description and notesArea divs
	 * Removes the viewer Canvas
	 * Sets the value of currentISBN to that of the currentRecord
	 */
	 
	/* Event handler for buildCurrentRecord */
	function buildCurrentRecord(e) {
		$('#descriptionHeader').empty();
		$('#description').empty();
		$('#notesArea').empty();
		//http://stackoverflow.com/questions/3450593/how-to-clear-the-content-of-a-div-using-javascript
		
		//https://api.jquery.com/remove/
		if ( document.getElementById('googIframe') ) {
			$("#googIframe").remove();
		}
		
		currentId = primarySelect.value;
		
		// loop to find the array entry that matches the id
		if ( recordSet ) {
			var len = recordSet.length;
			for ( var i = 0 ; i < len ; i++ ) {
				if ( recordSet[i].id == currentId ) {
					//alert( recordSet[i].id + " == " + currentId );
					currentRecord = new Record(recordSet[i].id, recordSet[i].title, recordSet[i].subtitle, recordSet[i].authors,
				recordSet[i].publisher, recordSet[i].publishedDate, recordSet[i].description, recordSet[i].ISBN, recordSet[i].previewLink, recordSet[i].embeddable); 
					
				}
			}
		}
		
		for ( var p in currentRecord.ISBN ) {
			//console.log(currentRecord.ISBN[p]);
			//console.log(currentRecord.ISBN[p].type + ": " + currentRecord.ISBN[p].identifier);
			if 	( currentRecord.ISBN[p].type == "ISBN_10" ) {
				currentISBN = currentRecord.ISBN[p].identifier;
			}	
		}
		showDescription(currentRecord.description);
		//alert(currentRecord.info());
	}
	
	/*
	 * showDescription
	 *
	 * @param - description
	 *
	 * called by a click of the form submit button
	 * to do: add other data elements for the current record
	 */
	
	function showDescription(description) {
		$('#descriptionHeader').html("Description for: " + currentRecord.title + " by " + currentRecord.authors);
		$('#description').html(description);
	}
	
	/* 
	 * showNotes
	 *
	 * @param - e
	 *
	 * Makes AJAX 'GET' call to a prefabbed set of notes in JSON
	 * format hosted at http://p1.kdeb-csci-e15.me/ajax.php
	 *
	 */
	
	function showNotes(e) {
		/*
		 * Conditional added for older IE
		 */
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			var xhr = new XMLHttpRequest();
		}
		else {// code for IE6, IE5
			var xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
	
		xhr.open("GET", "http://p1.kdeb-csci-e15.me/ajax.php");
		//Testing s3 bucket to get CORS working for a simple example
		//xhr.open("GET", "https://s3-us-west-2.amazonaws.com/studioresources/ajax.php/", "true");
		xhr.send();
	
		xhr.onreadystatechange=function()
		{
		  var el = document.getElementById("notesArea");
		  if (xhr.readyState==4 && xhr.status==200)
		  {
			var obj = JSON.parse(this.response);
			for ( var p in obj ) {
				var innerObj = obj[p];
				for ( var q in innerObj ) {
					//alert("id: " + innerObj[q].id + " notes: " + innerObj[q].notes + " current record id " + currentRecord.id);
					if ( innerObj[q].id == currentRecord.id ) {
						el.innerHTML = innerObj[q].notes;
						break;
					}
				el.innerHTML = "You have no notes for this volume.";	
				}		
			}
		  }
		}
	} 
	
	/*
	 * createBookViewer()
	 *
	 * Uses Google javascript callback function and an iframe
	 * to set up the Google embeddable viewer with the selected volume
	 * (if available).
	 *
	 */
	
	//http://stackoverflow.com/questions/10418644/creating-an-iframe-with-given-html-dynamically
	function createBookViewer() {
			//alert(currentRecord.embeddable);
			var iframe = document.createElement('iframe');
			iframe.setAttribute("id", "googIframe");
			iframe.setAttribute("style","width:600px;height:550px;border:5px solid #00A014;");
			var html = '<!DOCTYPE html "-//W3C//DTD XHTML 1.0 Strict//EN""http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="content-type" content="text/html; charset=utf-8"/><title>Google Book Search Embedded Viewer API Example</title><script type="text/javascript" src="https://www.google.com/jsapi"></script></head><body><p><script type="text/javascript" src="//www.google.com/jsapi"></script><script type="text/javascript">var isbn;function processDynamicLinksResponse(booksInfo){ for (id in booksInfo) { isbn = id; if (booksInfo[id] && booksInfo[id].preview == \'partial\') { document.getElementById(\'zippy\').style.display = \'block\'; google.load("books", "0"); } }function loadPreview(){ var viewer = new google.books.DefaultViewer(document.getElementById(\'viewerCanvas\')); viewer.load(isbn); } window.addEventListener("load", loadPreview); }</script><div id="zippy" ><div id="viewerCanvas" style="width: 600px; height: 500px; background-color: gray; display:block; margin-left:auto; margin-right:auto; "></div></div><script src="https://encrypted.google.com/books?jscmd=viewapi&bibkeys=ISBN:' + currentISBN + '&callback=processDynamicLinksResponse"></script></p></body></html>';
			console.log(html);
			viewerCanvasOuter.appendChild(iframe);
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write(html);
			iframe.contentWindow.document.close();
			iframeSet = true;	
	}
		
	/* 
	 * Record()
	 * 
	 * @param - id
	 * @param - title
	 * @param - subtitle
	 * @param - authors
	 * @param - publisher
	 * @param - publishedDate
	 * @param - description
	 * @param - previewLink
	 * @param - searchTerm
	 * 
	 * Function to create custom object for each record passed in by 
	 * the handleResponse() callback method
	 */
	function Record(id, title, subtitle, authors, publisher, publishedDate, description, previewLink, ISBN, embeddable, searchTerm) {
		this.id = id; 				
		this.title = title;		
		this.subtitle = subtitle;	
		this.authors = authors;				
		this.publisher = publisher;					
		this.publishedDate = publishedDate;				
		this.description = description;
		this.previewLink = previewLink;
		this.ISBN = ISBN; // this needs to be an object
		this.embeddable = embeddable;
		this.searchTerm = searchTerm;			

		//functions
	
		this.info = function() {
			return "id: " + this.id + " title: " + this.title + " subtitle: " + this.subtitle +
				" authors: " + this.authors + " publisher: " + this.publisher + " publication date: " + 
				this.publishedDate + " description: " + this.description + " preview link: " +
				this.previewLink + " ISBN: " +
				this.ISBN + " embeddable " + this.embeddable + "."
		}; 
	 } 
	 
	/* 
	 * populateSelect()
	 * 
	 * @param - recordSet
	 *
	 * populates the select control with titles & authors 
	 */
	function populateSelect(recordSet) {
		//get the select field by id
		var selectField = document.getElementById("primarySelect"); 
	
		// Flag variable for use in finite state machine logic
		var selectFieldSet = 'FALSE';

		//Loop through the array
		for ( var i = 0; i < recordSet.length ; i++ ) {
			if ( recordSet[i].embeddable ) {		
	
				//create an option tag
				var element = document.createElement("option");

				//add the strings from your array into each option tag
				var words = document.createTextNode(recordSet[i].title + " by " + recordSet[i].authors + " published: " + recordSet[i].publishedDate);
	
				//set the value of each option to the strings from your array
				element.value = recordSet[i].id;
	
				//append each Text Node to each option tag.
				element.appendChild(words);
	 
				//append each option tag to to the select field
				selectField.appendChild(element);
			}
		}
	} 
	
 

