jQuery(document).ready(function() {
    jQuery('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = jQuery(this).attr('href');
 
        // Show/Hide Tabs
        jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
 
        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
 
        e.preventDefault();
    });

    $('#tab_2_selectall').click(function(event) {  //on click 
        
            $('.tab_2_check').each(function() { //loop through each checkbox
                this.checked = true;  //select all checkboxes with class "tab_2_check"               
            });       
    });

    $('#tab_2_unselect').click(function(event) {  //on click 
        
            $('.tab_2_check').each(function() { //loop through each checkbox
                this.checked = false;  //unselect all checkboxes with class "tab_2_check"               
            });
       
    });
});



    

