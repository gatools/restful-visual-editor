/*!
 * RESTful Visual Editor
 * https://github.com/gatools/restful-visual-editor
 *
 * Copyright(c) 2016 Vasiliy Uglitskiy.
 * Open source under GPLv3 license.
 */

$(document).ready(function() { // Event when JQuery ready

    var requestProjects = $.getJSON("get/project-list"); // request a projects list

    /* Event when done loading projects list */
    requestProjects.done((data) => {
        var items = [];

        data.files.forEach((item, i, arr) => {
            var newItem = $('<li class="clickable">' + item + '</li>');
            newItem.click({ // set click event
                param1: item
            }, beginProject);
            items.push(newItem);
        });

        $("#projects ul").append(items); // add all discovered project files

        $('#loading_wrap').remove(); // remove loading screen
    });

    /* Event when error loading projects list */
    requestProjects.fail(requestError);

    /* Setup crete project button*/
    $("#create-new-project").click(showCreateProjectDialog);
    $("#create-project-done-button").click(createProject);
});

function requestError() {
    alert("Somthing was wrong, check Node.Js logs");
}

/* Funcion for begining project editing */
function beginProject(event) {
    Cookies.set("project-file", event.data.param1);
    window.location.replace('project');
}

function showCreateProjectDialog() {
    $("#projects ul").remove();
    $("#project-dialog").css("display", "inline");
}

/* Funcion for create new project */
function createProject() {
    if ($("#new-project-name").val() === "") {
        alert("Project name cannot be empty!");
        return;
    }

    var createRequest = $.get("create/" + $("#new-project-name").val()); // request project creation

    createRequest.done((data) => {
        beginProject({
            data: {
                param1: data
            }
        });
    });

    createRequest.fail(requestError);
}
