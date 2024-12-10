var baseUrl = "/php/";
var url = window.location.pathname;

var claps = 0;
var visits = 0;
var uclaps = 0;
var uvisits = 0;
var visitor_clapped = false;

function generateUUID() {
    // Public Domain/MIT
    // from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
    var d = new Date().getTime(); //Timestamp
    var d2 =
        (typeof performance !== "undefined" &&
            performance.now &&
            performance.now() * 1000) ||
        0; //Time in microseconds since page-load or 0 if unsupported
    return "xxxxxxxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
            //Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return r.toString(16);
    });
}

function uuid() {
    id = localStorage.getItem("uuid");
    if (id == null) {
        id = generateUUID();
        localStorage.setItem("uuid", id);
    }
    return id;
}

function clap() {
    fetch(baseUrl + "clap.php?uuid=" + uuid() + "&url=" + url).then(
        (response) => {
            if (response.ok) {
                response.json().then((data) => {
                    claps = data.claps;
                    uclaps = data.unique_claps;
                    visitor_clapped = true;
                    updateUi();
                });
            }
        },
    );
}

function pingAccess() {
    fetch(baseUrl + "record_access.php?uuid=" + uuid() + "&url=" + url).then(
        (response) => {
            if (response.ok) {
                response.json().then((data) => {
                    visits = data.visits;
                    claps = data.claps;
                    uvisits = data.unique_visits;
                    uclaps = data.unique_claps;
                    visitor_clapped = data.visitor_clapped;

                    updateUi();
                });
            }
        },
    );
}

function updateUi() {
    document.getElementById("visits").innerHTML =
        " | " + visits + " (" + uvisits + ")" + " Visits | ";
    document.getElementById("claps").innerHTML =
        '<button onclick="clap()">' +
        claps +
        " (" +
        uclaps +
        ")" +
        " Claps 👏</button>";
    if (visitor_clapped == true) {
        document.getElementById("claps-message").innerHTML = "";
    } else {
        document.getElementById("claps-message").innerHTML =
            "Send me some claps if you liked the article ☝";
    }
}


//// GA

function setupGA() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-PPT2M4RPSQ');

  var script = document.createElement('script');
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-PPT2M4RPSQ";
  script.async = true; // Set to false if you need to guarantee execution order
  document.head.appendChild(script);
}

setupGA();
