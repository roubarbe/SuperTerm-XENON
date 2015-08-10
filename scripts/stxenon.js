/*jslint browser: true, eqeq: true, plusplus: true, vars: true, white: true, devel: true */
/*global $, outputToConsole, showNewCommandLine, loadingWheel, Hammer, commandsArray*/


/**************************************************************************
    
    SuperTerm Xenon
    
    
    WHAT IS THIS?
        St-Zénon is a cute little village in Quebec, thus a 
        play-on-words on a funny-named place.

        This is a (nearly) fully-featured web-based terminal ready
        to be bent and mended to your needs. All you need is to define
        the actual commands and what they do.
    
        Basically, this provides you with a functional interface.
    
    
    WHAT DO I NEED?
        This app/library/whatever requires jQuery and has, for now, worked
        fine with the latest stable release.
        
        Some neat little effects may require a CSS3-compliant browser.
    
    
    HOW TO USE:
        Simply join it to your HTML file. Ready to serve. Kind-of.
        You'll have to make your own commands.
        
        See further down for more details on how to make one.
    
    
    LICENSE?
        You are free to use it, modify it, tattoo your name on it
        or whatever tickles you fancy but please mention me somewhere!
        
        (This means Apache, guys. Thanks.)
    
***************************************************************************/



/* GLOBAL VARIABLES */

// tab shows four consecutive spaces
var tab = "&nbsp;&nbsp;&nbsp;&nbsp;";

var currVersion = 0.71; //STX version

var consoleUsername = "STX$ "; //Could be anything you want (ex: "C: " or "BellLabs>> ")

var consoleEdition = "SuperTerm XENON"; //This is the name you want to give to the console

// And a little Message Of The Day doesn't do much bad
var motd =  tab + tab + "Make yourself comfortable and play around with this demo!<br>"+
            tab + tab + "New since 0.71 (highlight): <br>"+
            tab + tab + tab + "You can now paste in the terminal! <br>"+
            tab + tab + tab + "Use: \"|\" to execute multiple commands on one line.<br>"+
            tab + tab + tab + "\"tab\" is a new global variable that instantly applies 4 whitespace characters. Snazzy!<br>"+
            tab + tab + tab + "Commands are now in an external file, for better clarity.<br>"+
            tab + tab + tab + "In-Code Documentation now made to work with JavaDocs.<br><br>"+
            
            tab + 'Type "help" or "?" for information as to available commands and general usage.';

/********************/


/* ERROR CODE ARRAY */
// Each position represents an error message
var errCodesArray = [
    /*0*/ "Command execution was successful.",
    /*1*/ "[help] for this command doesn't exist or couldn't execute properly.",
    /*2*/ "One (1) or more parameters are required. See the command's help for usage information.",
    /*3*/ "Unknown error.",
    /*4*/ "HTTP Request Ended with Error 404. See the command's help for usage information and then contact your administrator for more details.",
    /*5*/ "HTTP Request Ended with Error 500. Contact your administrator for more details."
];
/********************/



/*
    Commands are now in an external file, for better editing.
*/



/*******************************************************************************
            THIS SECTION DEALS WITH PARSING AND EXECUTING COMMANDS
*******************************************************************************/



/**
    Parses the entered string and executes the proper command with the provided (or not) parameters.
    @param  {string}    enteredCommand  String passed to the function
    @return {number}    Returns the error code to the command that triggered the "enter" key.
*/
function commandParser(enteredCommand){
    "use strict";
    
    // Let's show something's being done
    $(".consolePositionIndicator").remove();
    
    // Prepare the error code variable (see documentation on error codes)
    // By default, it gets assigned error code 0 (successful execution)
    var errCode = 0;
    
    // Also, running the spinningWheel function with the bool 'true'
    loadingWheel(true);
        
    // Then, we cut down the entered text
    var parsedCommand = enteredCommand.split(" ");

    // The first array position is the command itself.
    var command = parsedCommand[0];

    // Then we take the rest of the array and store it in a variable
    var parameters = parsedCommand.slice(1, parsedCommand.length);

    // Simple integer for undetermined commands
    var nbIterations = 0;

    // Then we need to check if the entered command exists
    var i;
    for (i = 0; i <= commandsArray.length - 1; i++) {
        if(command == commandsArray[i].name || command == commandsArray[i].alias){

            // First of all, was this user asking for help on this command?
            if(parsedCommand[1] == "help"){

                /*  Because errors are part of human nature, we can't trust
                    that the command actually has a help function   */
                try{
                    // If it does, then we just call the command's own help function
                    commandsArray[i].help();

                    //Error code 0 represents successful completion of command
                    errCode = 0;
                }

                // If the 'help' submethod isn't found or can't be executed
                catch(err){
                    errCode = 1;
                }
            }

            // If it was another or no parameters at all
            else{

                // If the commands needs a parameter and none were specified
                if(commandsArray[i].parameterRequired && !parsedCommand[1]){

                    // Error code 2 is applied when no parameters were given but were expected
                    errCode = 2;
                }

                // If one was specified or that the command doesn't need any
                else{

                    // Try to execute it with or without parameters
                    try{
                        commandsArray[i].execute(parameters);
                        errCode = 0;
                    }

                    // If anything wrong happens
                    catch(errN){
                        errCode = 1;
                    }
                }
            }
        }

        // If the written command doesn't equal to the currently selected position
        else{

            // We increment this variable
            nbIterations++;
        }
    }

    // If we went through the list of all available commands without finding a match
    if(nbIterations == commandsArray.length){

        // If that's not because the user hasn't entered anything
        if(command != ""){
            outputToConsole("Command: [" + enteredCommand + "] is invalid or undetermined.", false);
            errCode = 0;
        }

        // Because if so, then he/she/they shouldn't expect anything to happen.
    }
    
    return errCode;
    
}


/*******************************************************************************
                THIS SECTION DEALS WITH THE VISUAL INTERFACE
*******************************************************************************/



/**
    Loads(shows) or hides the spinning wheel animation.
    @param  showOrHide  {boolean}   Boolean to hide or show
*/
function loadingWheel(showOrHide){
    "use strict";
    
    // If we do want the wheel to appear
    if(showOrHide){
        var spinningWheelElement = document.createElement("img");
        spinningWheelElement.setAttribute("class","loadingWheel");
        spinningWheelElement.setAttribute("src","res/loading.gif");
        $("#consoleElement").append(spinningWheelElement);
    }
    
    // Now if we want to hide/erase it:
    else{
        $(".loadingWheel").remove();
    }
}


/**
    Takes a string of characters and outputs it to the console.
    @param  data    {string}    String to be shown on screen
    @param  stream  {boolean}   Determines if it's a stream (multiple echos) or not.
*/
function outputToConsole(data, stream){
    "use strict";
    
    // Before we do ANYTHING, let's check if data was actually sent here
    if(data == null){
        // If none were provided, 'data' gets assigned a generic error message
        data =  "An error has occured during execution of the command:<br>"+
                "No message or text was sent to be shown on screen.";
    }
    
    // Displayed as a Paragraph. Easier to manage.
    var consoleOutputElement = document.createElement("p");
    
    // If this is part of a stream of data
    if(stream){
        
        // Then it adds the SPECIAL class
        consoleOutputElement.setAttribute("class","consoleOutput consoleOutputStream");
        
        // And a little bit more indentation
        data = tab + data;
    }
    
    // If it's starting or ending or by itself
    else{
        consoleOutputElement.setAttribute("class","consoleOutput");
    }
    
    // We throw our passed string into it
    consoleOutputElement.innerHTML = tab + data;
    
    // And in the console it goes!
    $("#consoleElement").append(consoleOutputElement);
}



/**
    Unassigns active input elements and creates new ones to display a new input line.
*/
function showNewCommandLine(){
    "use strict";
    
    /* 
        This adds a new line to the end of the current command line.
        This makes sure you don't end up having everything on the same line
    */
    $(".consoleTyping.active").html($(".consoleTyping.active").html() + "<br>");
    
    var consoleElement = document.getElementById("consoleElement");
    
    // Also, just so we don't type everywhere on the screen at once
    $(".active").removeClass("active");
    
    // Remove any position indicators (blinky thing)
    $(".consolePositionIndicator").remove();
    
    // Remove the loading wheel since we're back to input-mode
    loadingWheel(false);
    
    // First, we create the console's shown name
    var consoleName = document.createElement("span");
    consoleName.setAttribute("class","consoleName active");
    consoleName.innerHTML = consoleUsername;
    
    // Then where the letters are going to appear when we type
    var consoleTyping = document.createElement("span");
    consoleTyping.setAttribute("class","consoleTyping active");
    
    // After, a simple position indicator
    var consolePositionIndicator = document.createElement("span");
    consolePositionIndicator.setAttribute("class","consolePositionIndicator active");
    consolePositionIndicator.innerHTML = "█";
    
    // Now we apply everything to the main consoleElement
    consoleElement.appendChild(consoleName);
    consoleElement.appendChild(consoleTyping);
    consoleElement.appendChild(consolePositionIndicator);
    
    // Cute animated auto-scroll
    $("body, html").animate({
        scrollTop: consoleElement.scrollHeight
    }, 500);
}



/*******************************************************************************
                THIS SECTION DEALS WITH EVENT LISTENERS
*******************************************************************************/



/**
    Shows, removes letters typed and executes the command parser when enter is pressed.              *
*/
function keyboardEvents(){
    "use strict";
    
    // KeyPress events for the enter key and letters (including spacebar)
    $(document).keypress(function (e) {
        
        // The letter associated with the Key Code is stored in a variable
        var letterTyped = String.fromCharCode(e.which);
        
        // The enter key is associated with the number '13' with Chrome
        if(e.which == 13) {
            
            // Prevent the browser's default usage of ENTER (Return)
            e.preventDefault();
            
            /*  Before executing any commands, we check if the user has decided
                to execute multiple ones on the same line, with the character: "|"
            */
            var splitCommands = $(".consoleTyping.active").html().split("|");
            
            // Then we execute each one with a for loop
            var i;
            for (i = 0; i <= splitCommands.length - 1; i++){
                
                // Command sent to the parser, which returns an error code
                var executionResult = commandParser($.trim(splitCommands[i]));

                // Error code 0 represents successful completion, all else shows an error message
                if(executionResult != 0){
                    outputToConsole(executionResult + ": " + errCodesArray[executionResult]);
                }
            }
            
            // And we show a shiny new command line when everything's done.
            showNewCommandLine();
        
        }
        
        // Since it wasn't enter, we add the typed character.
        else{
            $(".consoleTyping.active").append(letterTyped);
        }
    });
    
    // The backspace is a keydown event.
    $(document).keydown(function(e){
        
        // Key Code 8 is backspace with Chrome
        if(e.keyCode == 8) {
            
            // Prevent the browser's default usage of backspace
            e.preventDefault();
            
            // Takes your element's content and remove the last character.
            $(".consoleTyping.active").html($(".consoleTyping.active").html().slice(0,-1));
            
        }
    });
}



/**
    This is a compatibility layer for mobile users. The software keyboard won't appear unless a prompt is made to appear.
*/
function mobileClickEvent(){
    "use strict";
    
    // Touch events triggered through the MIT-licensed Hammer library!
    var hammerTouchEvent = new Hammer(document.body);
    hammerTouchEvent.on('tap', function(){

        //We have to ask for a prompt
        var mobileCommand = prompt("Enter command:",$(".consoleTyping.active").html());
        
        // Anything typed in the previous prompt gets transfered to the input line
        $(".consoleTyping.active").html(mobileCommand);

        //Simulate enter key when we're done
        $(document).trigger({type: 'keypress', which: 13});
    });
}



/**
    Listens for the user pasting content in the terminal and shows it in the currently active input line.
*/
function desktopPasteEvent(){
    "use strict";
    
    // First, we listen for the paste event, on any element of the app
    document.body.onpaste = function(e){
        
        // Then we add it at the end of the currently active input line
        $(".consoleTyping.active").html($(".consoleTyping.active").html() + e.clipboardData.getData("text/plain"));
    };
}



/*******************************************************************************
    THIS SECTION DEALS WITH THE INITIAL PAGE LOAD AND GENERAL INITIALISATION
*******************************************************************************/



/**
    Creates the main console element then applies the keyboard events listeners.
*/
function init(){
    "use strict";
    
    // Create the actual console element, in this case in the document's body.
    var consoleElement = document.createElement("div");
    consoleElement.setAttribute("id","consoleElement");
    
    // You can apply your own logo, if you want
    var consoleHeaderImage = document.createElement("img");
    consoleHeaderImage.setAttribute("id","terminalHeaderImage");
    consoleHeaderImage.setAttribute("src","res/stxlogo.png");
    
    document.body.appendChild(consoleElement);
    consoleElement.appendChild(consoleHeaderImage);
    
    //MOTD
    outputToConsole(
        consoleEdition + " " + currVersion + "<br>" + motd
    );
    
    // Show a new command line
    showNewCommandLine();
    
    //Mobile compatibility events
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        mobileClickEvent();
    }

    // Checks all key inputs and will also launch the command parser.
    keyboardEvents();
    
    // Checks if something was pasted on screen (known to work in Chrome);
    desktopPasteEvent();
    
}


/**
    Using jQuery's "ready" method, we wait until all ressources are done loading until we launch initialization of the terminal
*/
$(document).ready(function () {
    
    "use strict"; // Gotta lint
    
    init();
        
});