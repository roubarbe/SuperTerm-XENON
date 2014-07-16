/*jslint browser: true, eqeq: true, plusplus: true, vars: true, white: true, devel: true */
/*global $, outputToConsole, showNewCommandLine, loadingWheel*/


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
var currVersion = 0.5; //STX version

var consoleUsername = "STX$ "; //Could be anything you want (ex: "C: " or "BellLabs>> ")

var consoleEdition = "SuperTerm XENON"; //This is the name you want to give to the console

// And a little Message Of The Day doesn't do much bad
var motd =  "&nbsp;&nbsp;Make yourself comfortable and play around with this demo!<br>"+
            '&nbsp;&nbsp;Type "help" or "?" for information as to available commands and general usage.';

/********************/



/*****************************************************
    Commands are defined as valid JavaScript objects 
    with their own sub-variables and sub-methods.
    
    They are all part of one array.
    This makes them iterable and facilitates 
    adding or modifying them.
    
    
    Let's take the example command "echo".
    See underneath this for a line-by-line 
    explanation.
    
    First, we have to name it. 
    This is basically the command itself.
    
    Sometimes, commands have other names, thus we
    define an "alias"
    
    After, "desc" is a generic (and rather concise)
    description of what this command does. This is used by the
    integrated "help" command
    
    Example:
        
        "Echo" shows text entered as a parameter, between quotes.
        
    
    Then, we have to figure if this command will
    require specified parameters.
    This is a simple boolean (true/false)
    
    Afterwards, we have to get it to do 
    what it needs to do! This needs to be
    a function named "execute".
    
    The variable named "data" is send to the
    command. Usually a string, this could 
    really be any type of data.
    
    Finally, the function named "help" is
    self-contained document on how to use
    the command we just wrote.
    
    
*****************************************************/

var commandsArray = [
    {
        // First, we specify the name of the command (string)
        "name": "echo",
        
        // Generic description of this command
        "desc": "[echo] shows text entered as a parameter, between quotes.",
        
        // Does it require at least one parameter? (boolean)
        "parameterRequired": true,
        
        // The actual actions of the command
        "execute": function(data){
            "use strict";
            
            data = data.join(" ");
            //console.log(data);
            outputToConsole(data, true);
        },
        
        // If help is needed, it is shown to the user as a submethod
        "help": function(){
            "use strict";
            outputToConsole(
                "This command simply outputs the text entered after the command itself, with or without quotes.<br>"+
                '&nbsp;&nbsp;Example: "echo gordonFreeman" will simply output: "gordonFreeman".'
            ,false);
        }
    },
    
    // The following command could be useful to keep
    {
        "name": "clear",
        
        "desc": "[clear] erases everything onscreen.",
        
        "parameterRequired": false,
        
        "execute": function(){
            "use strict";
            
            // Take what's currently on screen
            var currElements = $("#consoleElement").children();
            
            // Fade them out
            currElements.fadeOut(200, function(){
                
                // And remove them!
                currElements.remove();
            });
        },
        
        "help": function(){
            "use strict";
            outputToConsole(this.desc, false);
        }
    },
    
    // And this one could REALLY be useful to keep!
    {
        "name": "help",
        
        "alias": "?",
        
        "desc": "[help] shows how to use the console and the user-made commands.",
        
        "parameterRequired": false,
        
        "execute": function(){
            "use strict";
            outputToConsole(
                "Using " + consoleEdition + " is like using your favorite *NIX-based terminal.<br>"+
                "&nbsp;&nbsp;Here are the currently defined commands and what they do: "
            ,false);
            
            var i;
            for (i = 0; i <= commandsArray.length - 1; i++){
                outputToConsole(commandsArray[i].desc, true);
            }
            
            outputToConsole(
                "For more information, type the command followed by \"help\".<br>"+
                "&nbsp;&nbsp;Doing that will output the command's own docs."
            ,false);
        },
        
        "help": function(){
            "use strict";
            outputToConsole("What do you think you are doing here, exactly?",false);
        }
    }
];
/**********************************************/



/*******************************************************************************
            THIS SECTION DEALS WITH PARSING AND EXECUTING COMMANDS
*******************************************************************************/



/****************************************
*   function commandParser              *
*   @param enteredCommand               *
*       String passed to the function   *
*                                       *
*   Parses the entered string and       *
*   executes the proper command with    *
*   the provided (or not) parameters.   *
*****************************************/
function commandParser(enteredCommand){
    "use strict";
    
    // Let's show something's being done
    $(".consolePositionIndicator").remove();
    
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
                }
                
                catch(err){
                    outputToConsole("Error: No help found for the specified command.",false);
                }
            }
            
            // If it was another or no parameters at all
            else{
                
                // If the commands needs a parameter and none were specified
                if(commandsArray[i].parameterRequired && !parsedCommand[1]){
                    
                    // Command's own help function
                    outputToConsole("Error: One (1) or more parameters are required.");
                }
                
                // If one was specified or that the command doesn't need any
                else{
                    
                    // Just execute it with or without parameters
                    commandsArray[i].execute(parameters);
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
        }
        
        // Because if so, then he/she/they shouldn't expect anything to happen.
    }
    
}


/*******************************************************************************
                THIS SECTION DEALS WITH THE VISUAL INTERFACE
*******************************************************************************/



/****************************************
*   function loadingWheel               *
*   @param  showOrHide                  *
*           Boolean to hide or show     *
*                                       *
*   Loads(shows) or hides the           *
*   spinning wheel animation.           *
*****************************************/
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


/****************************************
*   function outputToConsole            *
*   @param data                         *
*       String to be shown on screen    *
*                                       *
*   @param stream                       *
*       Boolean determining if this     *
*       is part of a continous stream   *
*       or a simple one-off.            *
*                                       *
*   Takes a string of characters        *
*   and outputs it to the console.      *
*****************************************/
function outputToConsole(data, stream){
    "use strict";
    
    // Before we do ANYTHING, let's check if data was actually sent here
    if(data == null){
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
        data = "&nbsp;&nbsp;" + data;
    }
    
    // If it's starting or ending or by itself
    else{
        consoleOutputElement.setAttribute("class","consoleOutput");
    }
    
    // We throw our passed string into it
    consoleOutputElement.innerHTML = "&nbsp;&nbsp;" + data;
    
    // And in the console it goes!
    $("#consoleElement").append(consoleOutputElement);
}



/****************************************
*   function showNewCommandLine         *
*                                       *
*   Creates and places on page the      *
*   important elements.                 *
*****************************************/
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



/****************************************
*   function keyboardEvents             *
*                                       *
*   Shows, removes letters typed        *
*   and executes the command parser     *
*   when enter is pressed.              *
*****************************************/
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
            
            // We send what was typed to the parser/analyser
            commandParser($(".consoleTyping.active").html());
            
            // And we show a shiny new command line
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
            
            // Take your element's content and remove the last character.
            $(".consoleTyping.active").html($(".consoleTyping.active").html().slice(0,-1));
            
        }
    });
}



/*******************************************************************************
    THIS SECTION DEALS WITH THE INITIAL PAGE LOAD AND GENERAL INITIALISATION
*******************************************************************************/



/****************************************
*   function init                       *
*                                       *
*   Creates the main console element    *
*   then applies the keyboard events    *
*   listeners.                          *
*****************************************/
function init(){
    "use strict";
    
    // Create the actual console element, in this case in the document's body.
    var consoleElement = document.createElement("div");
    consoleElement.setAttribute("id","consoleElement");
    
    document.body.appendChild(consoleElement);
    
    //MOTD
    outputToConsole(
        consoleEdition + " " + currVersion + "<br>"+motd
    );
    
    // Show a new command line
    showNewCommandLine();
    
    // Apply event listeners
    keyboardEvents();
}



// Done loading? Fire it up!
$(document).ready(function () {
    
    "use strict"; // Gotta lint
    
    init();
        
});