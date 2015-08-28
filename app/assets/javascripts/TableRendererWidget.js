function TableRenderer(primaryDataKey, templateSelector, renderHost, navigationBarSelector) {
    // Create the table renderer widget, specify the name of the primary data key
    this.primaryDataKey = primaryDataKey;
    // Specify where to find the template, CSS ID Selector
    this.templateSelector = templateSelector;
    // Specify where the template is rendered, CSS ID selector
    this.renderHost = renderHost;
    // Navigation bar selector, used for updating navigation bar state
    // after each render
    if (navigationBarSelector) {
        this.hasNavigation = true;
        this.navigationBarSelector = navigationBarSelector; // Selector, example: ".ridershipNavigation"  
    } else {
        this.hasNavigation = false;
    }
};

TableRenderer.prototype.renderTable = function (dataToRender, page, totalPages, counterStart) {

    // Render the specified table using MustacheJS

    var counter,
        data,
        template,
        rendered,
        pageNavigatorSelector,
        previousNavSelector,
        nextNavSelector,
        data_key;

    data_key = this.primaryDataKey; 
    counter = counterStart;
    data = {
        count : function () {
            return function (text, render) {
                // note that counter is in the enclosing scope
                return counter++;
            }
        },
        ridesWithSeparator: function () {
            var numberOfRides = this.rides;
            numberOfRides = numeral(numberOfRides).format('0,0');
            return numberOfRides;
        }
    };

    // Add data last using supplied key
    data[data_key] = dataToRender;

    template = $(this.templateSelector).html();
    rendered = Mustache.render(template, data);
    $(this.renderHost).html(rendered);

    if (this.hasNavigation) {
        // Set page navigator to reflect current navigation state
        pageNavigatorSelector = this.navigationBarSelector + " .page-" + page;
        $(pageNavigatorSelector).addClass("active");

        previousNavSelector = this.navigationBarSelector + " .previous-nav";
        nextNavSelector = this.navigationBarSelector + " .next-nav";

        // Toggle previous/next buttons based on current page
        if (page === 1){
            $(previousNavSelector).addClass("disabled");
            $(nextNavSelector).removeClass("disabled");
        } else if (page === totalPages) {
            $(previousNavSelector).removeClass("disabled");
            $(nextNavSelector).addClass("disabled");
        } else {
            $(previousNavSelector).removeClass("disabled");
            $(nextNavSelector).removeClass("disabled");
        }
    }

};