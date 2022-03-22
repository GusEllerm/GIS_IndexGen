/* Clickable tabs */
function edit_workflow(evt, workflow) {

    // console.log(workflow)
    // Declare all variables
    var i, tabcontent, tablinks;
    tab_group = workflow.split('-')
    tab_group = tab_group[1]
    
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        if (tabcontent[i].id.split('-')[1] == tab_group) {
            tabcontent[i].style.display = "none";
        }
    }
    
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        if (tabcontent[i].id.split('-')[1] == tab_group) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
    }
    
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(workflow).style.display = "block";
    evt.currentTarget.className += " active";

}
