/*globals getRouteTo,_gaq*/
var originalInput,
    originalSearchInput,
    sendToFriendTemplate = "mailto:?subject=Job Opening: {0} &body=I came across this job on the internet and I thought that you or someone you know might be interested. {1}",
    catsoneUrl,
    linkType,
    jsonData;

function scrollToID(id, speed) {
    "use strict";
    var offSet = 70,
        targetOffset = $(id).offset().top - offSet,
        mainNav = $('#main-nav');
    $('html,body').animate({ scrollTop: targetOffset }, speed);
    if (mainNav.hasClass("open")) {
        mainNav.css("height", "1px").removeClass("in").addClass("collapse");
        mainNav.removeClass("open");
    }
}

// Remove watermark on focus
function watermarktext_focus(obj) {
    "use strict";
    $(obj).removeClass("maqwatermark requiredInput");
    if (obj.value === obj.title) {
        obj.value = "";
    }
    $(obj).removeClass("helpText");
}

// Set original watermark on blur
function watermarktext_blur(obj) {
    "use strict";
    if (obj.value === "") {
        obj.value = originalInput;
        obj.title = originalInput;
        $(obj).addClass("maqwatermark");
        $(obj).removeClass("textBoxFocus");
        $(obj).addClass("helpText");
    }
}

// Set the watermark text on search input
function setWaterMarkText() {
    "use strict";
    $('.maqwatermark').each(function () {
        if (($(this)[0].value === "" || $(this)[0].value === $(this)[0].title)) {
            $(this).val($(this)[0].title);
        }
        $(this).bind("focus", function () { watermarktext_focus($(this)[0]); });
        $(this).bind("click", function () { watermarktext_focus($(this)[0]); });
        $(this).bind("blur", function () { watermarktext_blur($(this)[0]); });
    });

}
function getJobListings(dataParams, successCallback) {
    "use strict";
    if (-1 === dataParams.getListings.indexOf('http://maqconsulting.catsone.com/careers/undefined')) {
        catsoneUrl = dataParams.getListings;
    } else {
        catsoneUrl = 'http://maqconsulting.catsone.com/careers/index.php?m=portal&a=listings&sort=posted&sortDir=desc&page=' + $('.active.pageSelector > a:nth(0)').text();
    }
    linkType = dataParams.linkType;
    $.ajax({
        url: 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + catsoneUrl + '"') + '&format=html',
        type: 'GET',
        contentType: 'text/html; charset=UTF-8',
        dataType: 'jsonp',
        success: function (data) {
            data = data.results[0].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace('src=\"/images/portal/rssIcon.png\"', '').replace('src=\"/images/dialogPointer.gif\"', '').replace('src=\"/images/datagrid/sortDesc.gif\"', '').replace('src=\"/images/icons/magnifier_medium.png\"', '').replace('src=\"/images/v3/poweredByCATS.png\"', '').replace('magnifier_medium.png ', '');
            data = data.replace('http://www.maqconsulting.com/Static/Images/Inc500.png', ' ').replace('http://www.maqconsulting.com/Static/Images/header_doubleSquareEnding.png', ' ').replace(new RegExp('http://www.maqconsulting.com/Static/Images/facebook_large.png', 'g'), ' ').replace(new RegExp('http://maqconsulting.com/Static/Images/MAQConsulting_logo.png', 'g'), ' ').replace(new RegExp('http://www.maqconsulting.com/Static/Images/linkedin_large.png', 'g'), ' ').replace(new RegExp('http://www.maqconsulting.com/Static/Images/twitter_large.png', 'g'), ' ').replace(new RegExp('images/icons/magnifier_medium.png', 'g'), '');
            data = data.replace(new RegExp('http://www.maqconsulting.com/Static/Images/MAQConsulting_logo.png', 'g'), ' ');
            $("#jobListingContainer").append('<div class="hidden">' + data + '</div>');
            if ("pagination" === linkType) {
                $(".hidden").html($(".hidden #jobListingsContent"));
            } else if ("jobTitle" === linkType) {
                var htmlNode = $(".hidden #stepJobDetails").html();
                htmlNode = htmlNode.replace("<table", "<div").replace("</table>", "</div>").replace("<tbody", "<div").replace("</tbody>", "</div>").replace("<tr", "<div").replace("</tr>", "</div>").replace("<td", "<div").replace("</td>", "</div>").replace("<ul", "<ol").replace("</ul>", "</ol>").replace(("MSJobs@maqconsulting.com"), "<a class='mailLink' href='mailto:MSJobs@MAQConsulting.com'>MSJobs@MAQConsulting.com</a>").replace("MSJobs@maqsoftware.com", "<a class='mailLink' href='mailto:MSJobs@maqsoftware.com'>MSJobs@maqsoftware.com</a>");
                $(".hidden").html(htmlNode);
            } else {
                $(".hidden").html($(".hidden #jobListingsContent"));
            }

            successCallback($(".hidden").html());
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function successFunction(data) {
    "use strict";
    var iCount, title, value, html = '<ul>';
    $(".hidden").remove();
    $("#dumpData").html(data);
    $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
    $(".loadingIcon").hide();
    if ($("#dumpData #jobListings").length) {
        $("#jobListingContainer").show();
        $("#jobListingsData").html(data);
    } else if ($("#dumpData #jobDetails").length) {
        $("#jobDescriptionContainer").after($("#jobActionBtnContainer"));
        $("#jobDescriptionContainer").html(data).show();
        $("#jobDetailPosted").after($("#jobActionBtnContainer"));
        $("#jobActionBtnContainer").show();
        sendToFriendTemplate = sendToFriendTemplate.replace("{0}", $("#dumpData #jobTitle").html());
    }

    for (iCount = 0; iCount < $('.detailsJobDescription table:nth(0) tbody tr').length; iCount++) {
        title = $('.detailsJobDescription table:nth(0) tbody tr:nth(' + iCount + ') td:nth(0) strong').text();
        value = $('.detailsJobDescription table:nth(0) tbody tr:nth(' + iCount + ') td:nth(1)').text();
        if (title && value) {
            html += '<li><span class="jobHead">' + title + '</span> : <span> ' + value + '</span></li>';
        }
    }
    html += '</ul>';
    $('.detailsJobDescription table:nth(0)').parent().append(html);
    $('.detailsJobDescription table:nth(0)').remove();
    if (0 !== $('#jobActionBtnContainer > div:nth(2)').length) {
        $('#jobDetails').prepend($('#jobActionBtnContainer > div:nth(2)'));
    } else {
        $('#jobDetails').prepend("<div class='col-lg-12 col-xs-12'><input type='button' value='BACK TO JOBS' class='titleMessage buttonStyle' id='backToJobsBtn' /></div>");
        $("#backToJobsBtn").bind("click", function () {
            // Get Job listings
            jsonData = {
                getListings: "http://maqconsulting.catsone.com/careers/index.php?m=portal&portalID=850"
            };

            getJobListings(jsonData, successFunction);
            $(".loadingIcon").show();
            $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
        });
    }
    $(".pageSelector").bind("click", function (e) {
        e.preventDefault();
        jsonData = {
            getListings: "http://maqconsulting.catsone.com/careers/" + $(this).attr("href"),
            linkType: "pagination"
        };
        getJobListings(jsonData, successFunction);
        $(".loadingIcon").show();
        $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
    });

    $("#jobListings .rowEven, #jobListings .rowOdd").bind("click", function (e) {
        e.preventDefault();
        jsonData = {
            getListings: $(this).find(".jobTitle").attr("href"),
            linkType: "jobTitle"
        };
        getJobListings(jsonData, successFunction);
        sendToFriendTemplate = sendToFriendTemplate.replace("{1}", $(this).find(".jobTitle").attr("href"));
        $(".loadingIcon").show();
        $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
    });

    if ($(window).width() <= 674) {
        $(".detailsJobDescription").after($("#jobActionBtnContainer"));
    } else {
        $("#jobDetailPosted").after($("#jobActionBtnContainer"));
    }
}

// JQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    "use strict";
    $('body').scrollspy(
        {
            target: '.navbar-fixed-top',
            offset: 92
        }
    );


    $('a.page-scroll').on('click', function (event) {
        event.preventDefault();
        var sectionID = $(this).attr("href");
        $('#siteNavigationContainer').removeClass('in');
        scrollToID(sectionID, 750);
    });

    // Mobile nav toggle
    $('#nav-toggle').on('click', function (event) {
        event.preventDefault();
        $('#main-nav').toggleClass("open");
    });

    // To set the placeholder for search input on load
    setWaterMarkText();
    originalInput = document.getElementById("directionInput").title;
    originalSearchInput = document.getElementById("searchJobListing").title;
    // Get Job listings
    jsonData = {
        getListings: "http://maqconsulting.catsone.com/careers/index.php?m=portal&a=listings&sort=posted&sortDir=desc&page=1"
    };

    getJobListings(jsonData, successFunction);
    $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
    $(".contactLoadingIcon").hide();

    $("#backToJobsBtn").bind("click", function () {
        // Get Job listings
        jsonData = {
            getListings: "http://maqconsulting.catsone.com/careers/index.php?m=portal&portalID=850"
        };

        getJobListings(jsonData, successFunction);
        $(".loadingIcon").show();
        $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
    });
    $(window).resize(function () {
        if ($(window).width() <= 674) {
            $(".detailsJobDescription").after($("#jobActionBtnContainer"));
        } else {
            $("#jobDetailPosted").after($("#jobActionBtnContainer"));
        }
    });
    $("#searchJobListing").keypress(function (e) {
        if (e.which === 13) {
            jsonData = {
                getListings: "http://maqconsulting.catsone.com/careers/index.php?search=" + $(this).val() + "&categories=%5B%5D"
            };
            getJobListings(jsonData, successFunction);
            $(".loadingIcon").show();
            $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
            return false;
        }
    });
    $("#searchJobListing").bind("focus", function () {
        $(this).removeClass("helpText");
        $(this).val("");
    });
    $("#searchJobListing").bind("blur", function () {
        if ($(this).val() === "") {
            $(this).val(originalSearchInput);
            $(this).title = originalSearchInput;
            $(this).addClass("helpText");
        }
    });

    $("#sendToFriendBtn").click(function () {
        window.location = sendToFriendTemplate;
        _gaq.push(['_trackEvent', 'Send to friend', 'Click', 'On Send to friend Button click']);
    });
});

// Get the locations for redmond on load
function getLocation() {
    "use strict";
    var directionInputData,
        latitude = 47.633087,
        longitude = -122.133202,
        eDirectionInput = $("#directionInput");
    document.getElementById('directions').innerHTML = "";
    if (eDirectionInput.hasClass("helpText") && eDirectionInput.hasClass("maqwatermark")) {
        eDirectionInput.addClass("requiredInput");
        eDirectionInput.val("REQUIRED");
        eDirectionInput.attr("title", "REQUIRED");
    } else {
        eDirectionInput.removeClass("requiredInput");
        directionInputData = document.getElementById("directionInput").value;
        $('#directionInput').attr('title', directionInputData);
        getRouteTo(latitude, longitude, directionInputData);
        $(".contactLoadingIcon").show();
        $("html, body").animate({ scrollTop: $(document).height() }, 750);
        $(".contactLoadingIcon").hide();
    }
}

// Handler to show directions on enter
function handleEnter_direction(args) {
    "use strict";
    if (args) {
        var e = window.event || args,
            keyunicode = e.charCode || e.keyCode;
        if (keyunicode === 13) {
            $('#show').focus();
        }
    }
}

function resetSearchBox() {
    "use strict";
    $("#searchJobListing").val("");
    $("#searchJobListing").val(originalSearchInput);
    $("#searchJobListing").title = originalSearchInput;
    $("#searchJobListing").addClass("helpText");
    jsonData = {
        getListings: "http://maqconsulting.catsone.com/careers/index.php?m=portal&a=listings&sort=posted&sortDir=desc&page=1"
    };
    getJobListings(jsonData, successFunction);
}