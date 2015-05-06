/*
<script src="https://encrypted.google.com/books?jscmd=viewapi&bibkeys=ISBN:0738531367&callback=processDynamicLinksResponse"></script>
*/


 $(document).ready(function() {
		alert("document ready");
		$('#demoForm')[0].reset();
		/* See if we can get recordSet out of the global scope */
		var recordSet = [];
		var currentSearchTerm = "";
		var currentId;
		var currentRecord = {};
	});
	
	/*
	 * handleResponse
	 * @param - response
	 * 
	 * Callback function from the Google Books api
	 *
	 */ 
	
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
    
    /*
     * Event Listeners
     * 
     * Clean this up - get the var out of global space
     */
    var form = document.getElementById('demoForm');
	if ( window.addEventListener ) { // avoid errors in incapable browsers
		form.addEventListener('submit', checkOnSubmit, true);
		//primarySelect.addEventListener('change', showDescription, true);
		primarySelect.addEventListener('change', buildCurrentRecord, true);
		// determine if notes exist using AJAX before showing the button?
		notesBtn.addEventListener('click', showNotes, true);
		zippy.addEventListener('click', togglePreview, true);
		
	}
	
	/* Zippy code ex from html file */
	/*
	<div id="zippy"">
        		<a href="javascript:togglePreview();">Toggle book preview</a>
        		<div id="viewerCanvas" ></div>
    		</div>
    		
    */
     
	/*
	 * GOOGLE DYNAMIC BOOK PREVIEW FUNCTIONS 
	 *
	 */
	
	 var isbn;

	function processDynamicLinksResponse(booksInfo) {
		alert("inside processDynamicLinksResponse");
		alert(booksInfo);
		/*
		$.each( booksInfo, function( i, val ) {
 			 //$( "#" + val ).text( "Mine is " + val + "." );
 			 alert(i);
 		}); */
		
		for (id in booksInfo) {
		  isbn = id;
		  alert(isbn);
		  if (booksInfo[id] && booksInfo[id].preview == 'partial') {
			document.getElementById('zippy').style.display = 'block';
			google.load("books", "0");
		  }
		}
	}

	function loadPreview() {
		var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
		viewer.load(isbn);
	}

	function togglePreview(e) {
		alert("inside toggle preview event handler");
		var canvas = document.getElementById('viewerCanvas');
		if (canvas.style.display == 'none') {
		  canvas.style.display = 'block';
		  loadPreview();
		} 
		else {
		  canvas.style.display = 'none';
		}
	}
	
	/*
	 * END: GOOGLE DYNAMIC BOOK PREVIEW FUNCTIONS 
	 *
	 */
	
	/* 
	 * checkOnSubmit
	 * @param - e
	 * 
	 * Event handler function for search form submit 
	 */
	function checkOnSubmit(e) {
		//(form.elements[0].value);
		if ( form.elements[0].value ) {
			currentSearchTerm = form.elements[0].value;
			$("#content").html("");
			recordSet = [];
			document.getElementById('searchBanner').innerHTML = "";
			document.getElementById('primarySelect').options.length = 1;
			// help for the following came from: http://stackoverflow.com/questions/610995/cant-append-script-element
			$("<script>", {  src : "https://www.googleapis.com/books/v1/volumes?q=" + form.elements[0].value + "&callback=handleResponse"}).appendTo("body");
			$('#demoForm')[0].reset();
			$('#notesArea').empty();
		} 
		else {
			//alert( "Please enter your search terms." );
			form.elements[0].focus();
		}	
	}

	/*
	 * buildCurrentRecord
	 * @param - e 
	 *
	 * Creates a record for the currently selected value
	 * Calls clear description & show description
	 */
	 
	/* Event handler for buildCurrentRecord */
	function buildCurrentRecord(e) {
		$('#description').empty();
		$('#notesArea').empty();
		currentId = primarySelect.value;
		//alert("We're in buildCurrentRecord and the value is " + currentId);
		var descript;
		
		// loop to find the array entry that matches the id
		// write it the old fashioned way, then try jQuery each
		if ( recordSet ) {
			var len = recordSet.length;
			for ( var i = 0 ; i < len ; i++ ) {
				if ( recordSet[i].id == currentId ) {
					//alert( recordSet[i].id + " == " + currentId );
					currentRecord = new Record(recordSet[i].id, recordSet[i].title, recordSet[i].subtitle, recordSet[i].authors,
				recordSet[i].publisher, recordSet[i].publishedDate, recordSet[i].description, recordSet[i].previewLink); 
					
				}
			}
		}
		//alert(currentRecord.info());
		//alert(currentRecord.id);
		showDescription(currentRecord.description);
		$("<script>", { src : "https://encrypted.google.com/books?jscmd=viewapi&bibkeys=ISBN:0738531367&callback=processDynamicLinksResponse" } ).appendTo("body");
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
		document.getElementById('description').innerHTML = description;
	}
	
	/*
	 * clearDescription
	 *
	 * @param - NONE
	 *
	 * called by a click of the form submit button
	 * to do: add other data elements for the current record
	 */
	
	/*
	function clearDescription() {
		$('#description').empty();
	} */
	
	/* 
	 * showGooglePreview
	 * @param - e
	 * 
	 * Not working right now
	 * Doesn't work when js code is separated into .js file 
	 * Try with preview link embedded in an iframe
	 */
	
	
	/*
	function showGooglePreview(e) {
      //{ other_params : 'libraries=places&sensor=false&key=my_key', callback : ... })
      
      //google.load("books", "0", { other_params : 'key=AIzaSyDg_3CqVhiLDOU6EjCSkY9X7o_CGg8KwSQ' });
      //google.load("books", "0");
      //function initialize() {
      //  var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
      //  viewer.load('ISBN:0738531367');
      //  //viewer.load('id:' + currentRecord.id);
      //}
      //google.setOnLoadCallback(initialize);
      getMyBooks();
    }
    */
    
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
		if (window.XMLHttpRequest)
		  {// code for IE7+, Firefox, Chrome, Opera, Safari
		  var xhr = new XMLHttpRequest();
		  }
		else
		  {// code for IE6, IE5
		  var xhr = new ActiveXObject("Microsoft.XMLHTTP");
		  }
		
		xhr.open("GET", "http://p1.kdeb-csci-e15.me/ajax.php");
		xhr.send();
		
		xhr.onreadystatechange=function()
		{
		  var el = document.getElementById("notesArea");
		  if (xhr.readyState==4 && xhr.status==200)
			{
			alert("inside xhr ready");
			
			JSON.parse(this.response, function(k, v) {
					console.log(k + ": " + v);
					if (k == "notes") {
						el.innerHTML += k + ": " + v + "<br>";
					}
				//return v;
				});
			}
		}
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
	 
	/* 
	 * populateSelect()
	 * 
	 * @param - recordSet
	 *
	 * populates the select control with titles & authors 
	 */
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

