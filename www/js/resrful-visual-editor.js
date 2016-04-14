/*!
 * RESTful Visual Editor
 * https://github.com/gatools/restful-visual-editor
 *
 * Copyright(c) 2016 Vasiliy Uglitskiy.
 * Open source under GPLv3 license.
 */

/* Event when JQuery ready */
$(document).ready(() => {

    projectFileName = Cookies.get("project-file");

    if (Cookies.get("project-file") === "") {
        alert("Select project first!");
        window.location.replace('/');
    }

    var requestProject = $.getJSON("get/project/" + projectFileName);

    /* Event for request project success */
    requestProject.done((data) => {
        projectRootObject = data;
        initSidebar();
        $('#loading_wrap').remove(); // Remove loading screen
    });

    /* Event for request project fail */
    requestProject.fail(() => {
        alert("Request project fail, check Node.Js logs");
        window.location.replace('/');
    });
});

/* Prepare sidebar */
function initSidebar() {
    /* Setup elements */
    $("#project-title").text(projectRootObject.title);
    $("#project-url").text(projectRootObject.url);

    /* Load documentation list */
    reloadDocumentationList();

    /* Load references list */
    reloadReferenceList();

    /* Event for toggling General block */
    $("#sidebar-general-title").click(showGeneralView);

    /* Event for toggling Documentation block */
    $("#sidebar-documentation-title").click(() => {
        $("#sidebar-documentation-block").slideToggle();
    });

    /* Event for toggling Reference block */
    $("#sidebar-reference-title").click(() => {
        $("#sidebar-reference-block").slideToggle();
    });

    /* Event for adding new documentation */
    $("#sidebar-documentation-block-add-new-item").click(() => {
        addDocumentation();
        projectRootObject.documentation.push({});
    });

    /* Event for adding new section or reference */
    $("#sidebar-reference-block-add-new-item").click(() => {
        addReference();
        projectRootObject.reference.push({});
    });

    showGeneralView();
}

/* Reloads documentation list */
function reloadDocumentationList() {
    $("#sidebar-documentation-block > div[id^='sidebar-documentation-block-row-']").remove();

    if (projectRootObject.hasOwnProperty('documentation')) {
        projectRootObject.documentation.forEach((documentation, i, arr) => {
            addDocumentation(documentation.title);
        });
    }
}

/* Reloads reference list */
function reloadReferenceList() {
    $("#sidebar-reference-block > div[id^='sidebar-reference-block-row-']").remove();

    if (projectRootObject.hasOwnProperty('reference')) {
        projectRootObject.reference.forEach((reference, i, arr) => {
            addReference(reference.path);
        });
    }
}

/* Adds a new documentation with given name */
function addDocumentation(documentationName) {
    documentationName = typeof documentationName !== 'undefined' ? documentationName : "New documentation";
    var elementsCount = $('#sidebar-documentation-block > div').length - 1;

    var row = $('<div class="sidebar-row"></div>');
    row.attr("id", "sidebar-documentation-block-row-" + elementsCount);
    row.click({
        index: elementsCount
    }, showDocumentationView);

    var newItem = $('<p class="clickable sidebar-row-item">' + documentationName + '</p>');
    newItem.attr("id", "sidebar-documentation-block-row-item-" + elementsCount);

    var deleteButton = $('<a class="clickable">X</a>');
    deleteButton.attr("id", "sidebar-documentation-block-row-item-" + elementsCount + "-delete");
    deleteButton.attr("title", "Delete");
    deleteButton.css({
        "float": "right",
        "display": "none"
    });
    deleteButton.click({
        index: elementsCount
    }, removeDocumentation);

    row.hover((e) => {
        deleteButton.css({
            "display": e.type === "mouseenter" ? "inline-block" : "none"
        });
    });

    row.append(newItem, deleteButton);

    $("#sidebar-documentation-block-add-new-item").before(row);

    if (!projectRootObject.hasOwnProperty('documentation')) {
        projectRootObject.documentation = [];
    }
}

/* Adds a new reference with given name */
function addReference(referenceName) {
    referenceName = typeof referenceName !== 'undefined' ? referenceName : "New reference";
    var elementsCount = $('#sidebar-reference-block > div').length - 1;

    var row = $('<div class="sidebar-row"></div>');
    row.attr("id", "sidebar-reference-block-row-" + elementsCount);
    row.click({
        index: elementsCount
    }, showReferenceView);

    var newItem = $('<p class="clickable sidebar-row-item">' + referenceName + '</p>');
    newItem.attr("id", "sidebar-reference-block-row-item-" + elementsCount);

    var deleteButton = $('<a class="clickable">X</a>');
    deleteButton.attr("id", "sidebar-reference-block-row-item-" + elementsCount + "-delete");
    deleteButton.attr("title", "Delete");
    deleteButton.css({
        "float": "right",
        "display": "none"
    });
    deleteButton.click({
        index: elementsCount
    }, removeReference);

    row.hover((e) => {
        deleteButton.css({
            "display": e.type === "mouseenter" ? "inline-block" : "none"
        });
    });

    row.append(newItem, deleteButton);

    $("#sidebar-reference-block-add-new-item").before(row);

    if (!projectRootObject.hasOwnProperty('reference')) {
        projectRootObject.reference = [];
    }
}

/* Save project */
function saveProject() {
    var saveRequest = $.post('save/project/' + projectFileName, JSON.stringify(projectRootObject));

    /* Event for fail save */
    saveRequest.fail(() => {
        alert("Save failed, check Node.Js logs");
    });
}

/* Show general view */
function showGeneralView() {
    $("#content").empty();
    $("#content").load("view/general-view.html", (response, status, xhr) => {
        if (status == "error") alert("Somthing was wrong, check Node.Js logs");
    });
}

/* Show documentation view for specified index */
function showDocumentationView(event) {
    $("#content").empty();
    currentDocumentationIndex = event.data.index;

    if (currentDocumentationIndex < 0) return;

    $("#content").load("view/documentation-view.html", (response, status, xhr) => {
        if (status == "error") alert("Somthing was wrong, check Node.Js logs");
    });
}

/* Show reference view for specified index */
function showReferenceView(event) {
    $("#content").empty();
    currentReferenceIndex = event.data.index;

    if (currentReferenceIndex < 0) return;

    $("#content").load("view/reference-view.html", (response, status, xhr) => {
        if (status == "error") alert("Somthing was wrong, check Node.Js logs");
    });
}

/* Deletes documentation with specified index */
function removeDocumentation(event) {
    var msg = "Are you sure, you whant to delete documentation " + projectRootObject.documentation[event.data.index].title + "?";
    if (!confirm(msg)) return;

    projectRootObject.documentation.splice(event.data.index, 1);

    saveProject();
    showGeneralView();
    reloadDocumentationList();
}

/* Deletes reference with specified index */
function removeReference(event) {
    var msg = "Are you sure, you whant to delete reference " + projectRootObject.reference[event.data.index].path + "?";
    if (!confirm(msg)) return;

    projectRootObject.reference.splice(event.data.index, 1);

    saveProject();
    showGeneralView();
    reloadReferenceList();
}
