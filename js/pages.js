let pages = [window.location.pathname];
let switchDirectionWindowWidth = 900;
let animationLength = 200;
// UTILS

function wrap(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    return wrapper;
}

function elementWithId(tag, id) {
    const el = document.createElement(tag);
    el.id = id;
    return el;
}

function elementWithClass(tag, clazz) {
    const el = document.createElement(tag);
    el.classList.add(clazz)
    return el;
}

function clThread(obj, ...funcs) {
    let res = obj;
    for(const f of funcs) {
        res = f(res);
    }
    return res;
}

/// STACK

function stackNote(href, level) {
    level = Number(level) || pages.length;
    if (href) {
        href = URI(href);
        pages.push(href.path());
    }

    uri = URI(window.location);
    uri.setQuery("stackedNotes", pages.slice(1, pages.length));

    old_pages = pages.slice(0, level - 1);
    state = { pages: old_pages, level: level };
    window.history.pushState(state, "", uri.href());

    if (!href && level === 1) return;
    if (level >= 1) {
        document.querySelector("body").classList.add('body-multipage');
    }
}

function unstackNotes(level) {
    let container = document.querySelector("#grid");
    let children = container.children;

    let toRemove = []
    for (let i = level; i < children.length; i++) {
        toRemove.push(children[i]);
    }

    toRemove.forEach(el => container.removeChild(el));
    pages = pages.slice(0, level);
    if (level <= 1) {
        document.querySelector("body").classList.remove('body-multipage')
    }
}

function updateLinkStatuses() {
    links = Array.prototype.slice.call(document.querySelectorAll("a"));
    links.forEach(function (e) {
        if (pages.indexOf(e.getAttribute("href")) > -1) {
            e.classList.add("active");
        } else {
            e.classList.remove("active");
        }
    });
}

function wrapContent(content, level) {
    const el = wrap(content, elementWithClass('div', 'page'));
    if (level > 1) {
        const toolbar = elementWithClass('div', 'toolbar');
        toolbar.innerHTML = `<span onClick='unstackNotes(${level - 1}); stackNote(false)'><img class='toolbar-close-button' src="/img/close.svg" width=20 height=20 /></span>`;
        el.insertBefore(toolbar, content);
    }
    return el;
}

function getPageContent(page) {
    let date = page.querySelector("#preamble");
    let content = page.querySelector("#content");
    let postamble = page.querySelector("#postamble");
    let parent = document.createElement('div');
    let element = document.createElement('div');
    if (date) element.appendChild(date)
    element.appendChild(content);
    if (postamble) element.appendChild(postamble);
    parent.appendChild(element);
    return element;
}

// Fetches note at href, and then removes all notes up to level, and inserts the new note
function fetchNote(href, level) {
    if (pages.indexOf(href) > -1) return;
    level = Number(level) || pages.length;

    const request = new Request(href);
    fetch(request)
        .then((response) => response.text())
        .then((text) => {
            unstackNotes(level);
            let container = document.querySelector("#grid");
            let fragment = document.createElement("template");
            fragment.innerHTML = text;
            let element = getPageContent(fragment.content);
            console.log(element);
            container.appendChild(wrapContent(element, level + 1));
            stackNote(href, level);

            setTimeout(
                function (element, level) {
                    element.dataset.level = level + 1;
                    initializePage(element, level + 1);
                    element.scrollIntoView();
                    if (window.MathJax) {
                        window.MathJax.typeset();
                    }
                }.bind(null, element, level),
                10
            );
        });
}

function initializePage(page, level) {
    // Replace all relevant links to use stack navigation
    level = level || pages.length;

    links = Array.prototype.slice.call(page.querySelectorAll("a"));
    const doPrefetch = (links.length <= 10) ? true : false;
    links.forEach(async function (element) {
        var rawHref = element.getAttribute("href");
        element.dataset.level = level;

        if (
            rawHref &&
                rawHref.includes('.html') &&
                !(
                    // Internal Links Only
                    (
                        rawHref.indexOf("http://") === 0 ||
                            rawHref.indexOf("https://") === 0 ||
                            rawHref.indexOf("#") === 0
                    )
                )
        ) {
            var prefetchLink = element.href;
            async function myFetch() {
                element.addEventListener("click", function (e) {
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        fetchNote(element.getAttribute("href"), this.dataset.level);
                    }
                });

                // The commented code did prefetching
                if (doPrefetch){
                    let response = await fetch(prefetchLink);
                    let fragment = document.createElement("template");
                    fragment.innerHTML = await response.text();
                }
                updateLinkStatuses();
            }

            return myFetch();
        }
    });
}

window.addEventListener("popstate", function (event) {
    // TODO: check state and pop pages if possible, rather than reloading.
    window.location = window.location; // this reloads the page.
});

function setupPages() {
    // Wrap content with grid div
    // const pageContent = document.querySelector("#content")
    const pageContent = getPageContent(document);
    document.querySelector("body").appendChild(pageContent);

    clThread(pageContent,
             (e) => wrapContent(e, 1),
             (e) => wrap(e, elementWithId('div', 'grid')),
             (e) => wrap(e, elementWithId('div', 'grid-container')));

    // prevent default link action
    initializePage(pageContent);

    // render stacked pages from url
    let stacks = [];
    uri = URI(window.location);
    if (uri.hasQuery("stackedNotes")) {
        stacks = uri.query(true).stackedNotes;
        if (!Array.isArray(stacks)) {
            stacks = [stacks];
        }
        for (let i = 0; i < stacks.length; i++) {
            fetchNote(stacks[i], i + 1);
        }
    }
};

function setup() {
    if (typeof draw_graph != 'undefined') {
        draw_graph(graph_name).then(() => {
            setupPages();
        });
    } else {
        setupPages();
    }
}

window.onload = setup;

window.MathJax = {
    tex: {
        ams: {
            multlineWidth: '85%'
        },
        tags: 'ams',
        tagSide: 'right',
        tagIndent: '.8em'
    },
    chtml: {
        scale: 1.0,
        displayAlign: 'center',
        displayIndent: '0em'
    },
    svg: {
        scale: 1.0,
        displayAlign: 'center',
        displayIndent: '0em'
    },
    output: {
        font: 'mathjax-modern',
        displayOverflow: 'overflow'
    }
};
