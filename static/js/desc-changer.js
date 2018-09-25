var desc = document.getElementById("page-description");
var currentdesc =0;
var options = [];

// Extract options
(function () {
    var opts = document.getElementById("description-options");
    opts.style.display = "none";
    for (var c=0; c < opts.childElementCount; c++){
	options.push(opts.children[c].innerHTML);
    }
})();

function changeDescription (){
    if (options.length > 1) {
	currentdesc++;
	if (currentdesc >= options.length)
	    currentdesc = 0;
	desc.innerHTML = options[currentdesc];
	setTimeout(changeDescription, 5000);
    }
}

changeDescription();
