/*jslint browser: true, devel: true, eqeq: true, plusplus: true, vars: true, white: true*/
/*global outputToConsole, tab, $, consoleEdition*/

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
            outputToConsole(data, true);
        },
        
        // If help is needed, it is shown to the user as a submethod
        "help": function(){
            "use strict";
            outputToConsole(
                "This command simply outputs the text entered after the command itself, with or without quotes.<br>"+
                tab + 'Example: "echo gordonFreeman" will simply output: "gordonFreeman".'
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
                tab + "Here are the currently defined commands and what they do: "
            ,false);
            
            var i;
            for (i = 0; i <= commandsArray.length - 1; i++){
                outputToConsole(commandsArray[i].desc, true);
            }
            
            outputToConsole(
                "For more information, type the command followed by \"help\".<br>"+
                tab + "Doing that will output the command's own docs."
            ,false);
        },
        
        "help": function(){
            "use strict";
            outputToConsole("What do you think you are doing here, exactly?",false);
        }
    }
];