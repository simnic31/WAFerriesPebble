/**
 * Pebble WS Ferries
 */
var DEBUG = true;

var UI = require('ui');
var ajax = require('ajax');

// Global UI ///////////////////////////////
var Vector2 = require('vector2');
var splashWindow = new UI.Window();

// Loads the splash screen to be displayed while fetching data
function displaySplashScreen(message){
  
  splashWindow.each(function(element) {
    splashWindow.remove(element);
  });
  
  // Text element to inform user
  var text = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    text: message,
    font:'GOTHIC_28_BOLD',
    color:'#FFFFFF',
    textOverflow:'wrap',
    textAlign:'center',
    textColor:'#FFFFFF',
    backgroundColor:'#1976D2'
  });

  // Add to splashWindow and show
  splashWindow.add(text);
  splashWindow.show();
}

function displayRoutesMenu(data){
  // Construct Menu to show to user

  // Add data & style to menu
  var routesMenu = new UI.Menu({
    
    backgroundColor: '#1976D2',
    highlightBackgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Routes',
      items: data
    }]
  });
  
  // Add an action for SELECT
  routesMenu.on('select', function(e) {
    loadSailingsData(data[e.itemIndex]);
  });
  
  // Show the Menu, hide the splash
  routesMenu.show();
  splashWindow.hide(); 
}

function displaySailingsMenu(data){
  // Construct Menu to show to user

  // Add data & style to menu
  var sailingsMenu = new UI.Menu({
    
    backgroundColor: '#1976D2',
    highlightBackgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Sailings',
      items: data
    }]
  });
  
  // Add an action for SELECT
  sailingsMenu.on('select', function(e) {
    loadTimesData(data[e.itemIndex]);
  });
  
  // Show the Menu, hide the splash
  sailingsMenu.show();
  splashWindow.hide(); 
}

function displayTimesMenu(data){
  // Construct Menu to show to user

  // Add data & style to menu
  var timesMenu = new UI.Menu({
    
    backgroundColor: '#1976D2',
    highlightBackgroundColor: '#2196F3',
    textColor: '#FFFFFF',
    highlightTextColor: '#FFFFFF',
    sections: [{
      title: 'Times',
      items: data
    }]
  });
  
  // Add an action for SELECT
  timesMenu.on('select', function(e) {
    // TODO: Push to timeline
  });
  
  // Show the Menu, hide the splash
  timesMenu.show();
  splashWindow.hide(); 
}

// Main ////////////////////////////
var today = getToday();
var API_KEY = 'INSERT_API_KEY_HERE';

// Gets this all going
loadRoutesData();

// AJAX functions ///////////////////
// Display splash screen, load ajax, calls menu builder

function loadRoutesData(){

  displaySplashScreen('Downloading Routes Data...');
  
  var routesURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest/routes/' + today + '?apiaccesscode=' + API_KEY;
  // Make the request for route data
  ajax(
    {
      url: routesURL,
      type: 'json'
    },
    function(data) {
      // Success!
      var menuItems = parseRoutes(data);
    
      if (DEBUG){
        console.log('Successfully fetched routes data!');
        // Check the items are extracted OK
        for(var i = 0; i < menuItems.length; i++) {
          console.log(menuItems[i].title + ' | ' + menuItems[i].id);
        }
      }
    
      displayRoutesMenu(menuItems);
    
    },
    function(error) {
      // Failure!
      console.log('Failed fetching routes data: ' + error);
    }
  );
}
  
function loadSailingsData(route){
  if (DEBUG){
    console.log(route.id);
  }
  displaySplashScreen("Downloading Sailings Data...");
  
  var sailingsURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest//terminalsandmatesbyroute/' +  today + '/' + route.id + '?apiaccesscode=' + API_KEY;
  
  //make ajax for sailings
  // Make the request for route data
  ajax(
    {
      url: sailingsURL,
      type: 'json'
    },
    function(data) {
      // Success!
      var menuItems = parseSailings(data, route);
    
      if (DEBUG){
        console.log('Successfully fetched sailing data!');
        // Check the items are extracted OK
        for(var i = 0; i < menuItems.length; i++) {
          console.log(menuItems[i].title);
        }
      }
      displaySailingsMenu(menuItems);
    },
    function(error) {
      // Failure!
      console.log('Failed fetching sailing data: ' + error);
    }
  );
}


function loadTimesData(sailing){
  if (DEBUG){
    console.log("");
  }
  displaySplashScreen("Downloading Times Data...");
  
  var timesURL = 'http://www.wsdot.wa.gov/ferries/api/schedule/rest/schedule/' + today + '/' + sailing.route_id  + '?apiaccesscode=' + API_KEY;
  //make ajax for sailings
  // Make the request for route data
  ajax(
    {
      url: timesURL,
      type: 'json'
    },
    function(data) {
      // Success!
      var menuItems = parseTimes(data, sailing);
    
      if (DEBUG){
        console.log('Successfully fetched times data!');
        // Check the items are extracted OK
        for(var i = 0; i < menuItems.length; i++) {
          console.log(menuItems[i].title);
        }
      }
      displayTimesMenu(menuItems);
    },
    function(error) {
      // Failure!
      console.log('Failed fetching times data: ' + error);
    }
  );
}

// Util Functions //////////////////

// Returns a list of route names
function parseRoutes(data){
  
  var items = [];
  for(var i in data) {
    
    // Get Route ID
    var id = data[i].RouteID;
    
    // Get abbrev route name
    var abbrev_name = data[i].RouteAbbrev;
    abbrev_name = abbrev_name.toUpperCase();

    // Get full route name
    var full_name = data[i].Description;

    // Add to menu items array
    items.push({
      title:abbrev_name,
      subtitle:full_name,
      id:id
    });
  }
  return items;
}

function parseSailings(data, route){
  
  var items = [];
  for(var i in data) {
    
    // Get Route ID
    var depart_id = data[i].DepartingTerminalID;
    var arrive_id = data[i].ArrivingTerminalID;
    
    // Get sailing name
    var full_sailing_name = data[i].DepartingDescription.substring(0, 6) + ' / ' + data[i].ArrivingDescription.substring(0, 6);
   
    // Add to menu items array
    items.push({
      title:full_sailing_name,
      depart_id:depart_id,
      arrive_id:arrive_id,
      route_id:route.id
    });
  }
  return items;
}


function parseTimes(data, sailing){
  
  var items = [];
  for (var i = 0; i < data.TerminalCombos.length; i++) {
    if (data.TerminalCombos[i].DepartingTerminalID == sailing.depart_id && data.TerminalCombos[i].ArrivingTerminalID == sailing.arrive_id){
      for (var j = 0; j < data.TerminalCombos[i].Times.length; j++){
        
        var title = convertTime(data.TerminalCombos[i].Times[j].DepartingTime);
                
        // Add to menu items array
        items.push({
          title:title
        });
        
      } 
    }
  }
  return items;
}

function convertTime(time){
  
  var date = new Date(parseInt(time.substring(6, 19)));

  return date.getHours() + ':' + date.getMinutes();
}

// returns current date in YYYY-MM-DD format.
function getToday(){
  today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  return today;
}
