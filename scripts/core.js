function httpGetAsync(action, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", action, true); // true for asynchronous 
    xmlHttp.send(null);
}
function httpPostAsync(action, data)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", action, true); // true for asynchronous
    xmlHttp.setRequestHeader("Access-Control-Request-Method", "POST");
    xmlHttp.setRequestHeader("Access-Control-Request-Headers", "X-PINGOTHER, Content-Type");
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.send(data);
}
function updateTimeout(reset) {
    var now = new Date();
    var diffSec = Math.floor(reset - now.valueOf() / 1000);
    if (diffSec > 0) {
        var diffMin = Math.floor(diffSec/60);
        diffSec = diffSec % 60;
        document.getElementById("quota_time").innerHTML =
            ((diffMin > 0)? diffMin + " min, " : "")
            + diffSec + " sec";
        setTimeout(() => updateTimeout(reset), 1000);
    } else {
        document.getElementById("quota_display").style.display = "none";
    }
}

// GitHub API commands
function checkQuota(callback) {
    httpGetAsync("https://api.github.com/rate_limit", reply => {
        var result = JSON.parse(reply);
        var low = result.resources.core.remaining < 60;
        var available = result.resources.core.remaining > 0;
        callback(available, low);
        if (!available) {
            document.getElementById("quota_display").style.display = "block";
            updateTimeout(result.resources.core.reset);
        }
    });
}
function getContents(owner, repo, ref, path, callback) {
    // https://developer.github.com/v3/repos/contents/#get-contents
    /*checkQuota(available => {
        console.log(available);
    });
    httpGetAsync("http://philserver.bplaced.net/fbe/statelib_cache/index.php?cmd=getContents&owner="+owner+"&repo="+repo+"&ref="+ref+"&path="+path, result => {
        if (result == "") {
            console.log("!!!!");
        } else {
            callback(result);
        }
    });
    // var testresult = [];
    // ['calculation_state.py', '__init__.py', 'decision_state.py', 'log_state.py', 'wait_state.py'].forEach(name => {
    //     testresult.push({'name': name, 'path': path.replace(/\d/g, '') + "/" + name});
    // });
    // httpPostAsync(
    //     "http://philserver.bplaced.net/fbe/statelib_cache/index.php",
    //     "set=setContents&owner="+owner+"&repo="+repo+"&ref="+ref+"&path="+path+"&data="+JSON.stringify(testresult)
    // );
    // callback(JSON.stringify(testresult));
    return;
    //*/
    var getFromGithub = function() {
        httpGetAsync("https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path + "?ref=" + ref, result => {
            httpPostAsync(
                "http://philserver.bplaced.net/fbe/statelib_cache/index.php",
                "set=setContents&owner="+owner+"&repo="+repo+"&ref="+ref+"&path="+path+"&data="+result
            );
            callback(result);
        });
    }
    checkQuota((available, low) => {
        if (low) {
            httpGetAsync("http://philserver.bplaced.net/fbe/statelib_cache/index.php?cmd=getContents&owner="+owner+"&repo="+repo+"&ref="+ref+"&path="+path, result => {
                if (result != "") {
                    console.log("get from server");
                    callback(result);
                } else if(available) {
                    console.log("failed from server, try github");
                    getFromGithub();
                }
            });
        } else {
            console.log("get from github");
            getFromGithub();
        }
    });
}
function getRaw(owner, repo, ref, path, callback) {
    httpGetAsync("https://raw.githubusercontent.com/" + owner + "/" + repo + "/" + ref + "/" + path, callback);
}
function listCommits(owner, repo, ref, path, callback) {
    // https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
    /*callback(JSON.stringify([
        {'commit': {'author': {'name': 'Test', 'date': new Date()}, 'message': 'testmessage'}},
        {'commit': {'author': {'name': 'Test', 'date': new Date()}, 'message': 'testmessage'}},
        {'commit': {'author': {'name': 'Test', 'date': new Date()}, 'message': 'testmessage'}},
        {'commit': {'author': {'name': 'Test', 'date': new Date()}, 'message': 'testmessage'}},
        {'commit': {'author': {'name': 'Test', 'date': new Date()}, 'message': 'testmessage'}},
        {'commit': {'author': {'name': 'Test', 'date': new Date()}, 'message': 'testmessage'}}
    ]));
    return;
    //*/
    checkQuota((available, low) => {
        if (!available) return;
        httpGetAsync("https://api.github.com/repos/" + owner + "/" + repo + "/commits" + "?path=" + path + "&sha=" + ref, callback);
    });
}

// Cache server updates

function displayCommitHistory(history, div) {
    var formatEntry = function(entry) {
        var entryDate = new Date(entry.commit.author.date);
        var dateString = entryDate.toDateString() + " (" + entryDate.toLocaleTimeString() + ")";
        return '<small style="color: #999;">'+ dateString +" <i>by "+ entry.commit.author.name +"</i></small>"
            + "<br />" + entry.commit.message;
    }
    div.innerHTML = "";
    var numEntries = Math.min(history.length, 4);
    for (let index = 0; index < numEntries; index++) {
        const entry = history[index];
        var element = document.createElement("li");
        element.setAttribute("class", "commit_entry");
        element.innerHTML = formatEntry(entry);
        div.appendChild(element);
    }
    if (numEntries < history.length - 1) {
        var element = document.createElement("li");
        element.setAttribute("class", "commit_entry");
        element.innerHTML = "(...)";
        div.appendChild(element);
    }
    if (numEntries < history.length) {
        const entry = history[history.length - 1];
        var element = document.createElement("li");
        element.setAttribute("class", "commit_entry");
        element.innerHTML = formatEntry(entry);
        div.appendChild(element);
    }
}

function displayStateDetails(stateDef, owner, repo, ref, path, history, historyHandler) {
    document.getElementById("state_details").style.display = "inline-block";
    document.getElementById("state_details_class").innerText = stateDef.getStateClass();
    document.getElementById("state_details_description").innerText = stateDef.getStateDesc();
    document.getElementById("state_details_package").innerText = stateDef.getStatePackage();
    // if (!history || history.length == 0) {
    //     document.getElementById("state_details_author").innerHTML = '<i>unknown</i> <a href="#">(check commits)</a>';
    //     document.getElementById("state_details_date").innerHTML = '<i>unknown</i> <a href="#">(check commits)</a>';
    //     if (historyHandler) {
    //         document.getElementById("state_details_author").addEventListener("click", historyHandler);
    //         document.getElementById("state_details_date").addEventListener("click", historyHandler);
    //     }
    // } else {
    //     document.getElementById("state_details_author").innerText = history[history.length-1].commit.author.name;
    //     var last_date = new Date(history[0].commit.author.date);
    //     document.getElementById("state_details_date").innerText = last_date.toDateString();
    // }
    document.getElementById("state_details_url").href = "https://github.com/" + owner + "/" + repo + "/tree/" + ref + "/" + path;
    document.getElementById("state_details_url").innerText = "View on GitHub";
    
    // Parameters
    var stateParameters = stateDef.getParameters();
    var stateParameterDocs = stateDef.getParamDesc();
    var stateParameterDefaults = stateDef.getDefaultParameterValues();
    var parameterDiv = document.getElementById("state_details_parameters");
    if (stateParameters.length > 0) {
        parameterDiv.style.display = "block";
        var content = document.getElementById("state_details_parameters_content");
        content.innerHTML = "";
        for (let i = 0; i < stateParameters.length; i++) {
            var doc = stateParameterDocs.findElement(element => {
                return element.name == stateParameters[i]
            });
            var contentRow = document.createElement("li");
            contentRow.innerHTML = "<tt>" +
                  (doc? "<i>" + doc.type + " </i>" : "")
                + "<b>"+ stateParameters[i] +"</b>"
                + ((stateParameterDefaults[i] != "")? " = " + stateParameterDefaults[i] : "")
                + "</tt>"
                + (doc? "<br />" + doc.desc : "");
            content.appendChild(contentRow);
        }
    } else {
        parameterDiv.style.display = "none";
    }
    // Outcomes
    var stateOutcomes = stateDef.getOutcomes();
    var stateOutcomeDocs = stateDef.getOutcomeDesc();
    var outcomeDiv = document.getElementById("state_details_outcomes");
    if (stateOutcomes.length > 0) {
        outcomeDiv.style.display = "block";
        var content = document.getElementById("state_details_outcomes_content");
        content.innerHTML = "";
        for (let i = 0; i < stateOutcomes.length; i++) {
            var doc = stateOutcomeDocs.findElement(element => {
                return element.name == stateOutcomes[i]
            });
            var contentRow = document.createElement("li");
            if (stateOutcomes[i].startsWith("$")) {
                contentRow.innerHTML = "Will be generated from the parameter <tt><b>"+ stateOutcomes[i].slice(1) +"</b></tt>.";
            } else {
                contentRow.innerHTML = "<tt>" +
                    "<b>"+ stateOutcomes[i] +"</b>"
                    + "</tt>"
                    + (doc? " - " + doc.desc : "");
            }
            content.appendChild(contentRow);
        }
    } else {
        outcomeDiv.style.display = "none";
    }
    // Input
    var stateInputs = stateDef.getInputKeys();
    var stateInputDocs = stateDef.getInputDesc();
    var inputDiv = document.getElementById("state_details_input");
    if (stateInputs.length > 0) {
        inputDiv.style.display = "block";
        var content = document.getElementById("state_details_input_content");
        content.innerHTML = "";
        for (let i = 0; i < stateInputs.length; i++) {
            var doc = stateInputDocs.findElement(element => {
                return element.name == stateInputs[i]
            });
            var contentRow = document.createElement("li");
            if (stateInputs[i].startsWith("$")) {
                contentRow.innerHTML = "Will be generated from the parameter <tt><b>"+ stateInputs[i].slice(1) +"</b></tt>.";
            } else {
                contentRow.innerHTML = "<tt>" +
                    (doc? "<i>" + doc.type + " </i>" : "")
                    + "<b>"+ stateInputs[i] +"</b>"
                    + "</tt>"
                    + (doc? "<br />" + doc.desc : "");
            }
            content.appendChild(contentRow);
        }
    } else {
        inputDiv.style.display = "none";
    }
    // Output
    var stateOutputs = stateDef.getOutputKeys();
    var stateOutputDocs = stateDef.getOutputDesc();
    var outputDiv = document.getElementById("state_details_output");
    if (stateOutputs.length > 0) {
        outputDiv.style.display = "block";
        var content = document.getElementById("state_details_output_content");
        content.innerHTML = "";
        for (let i = 0; i < stateOutputs.length; i++) {
            var doc = stateOutputDocs.findElement(element => {
                return element.name == stateOutputs[i]
            });
            var contentRow = document.createElement("li");
            if (stateOutputs[i].startsWith("$")) {
                contentRow.innerHTML = "Will be generated from the parameter <tt><b>"+ stateOutputs[i].slice(1) +"</b></tt>.";
            } else {
                contentRow.innerHTML = "<tt>" +
                    (doc? "<i>" + doc.type + " </i>" : "")
                    + "<b>"+ stateOutputs[i] +"</b>"
                    + "</tt>"
                    + (doc? "<br />" + doc.desc : "");
            }
            content.appendChild(contentRow);
        }
    } else {
        outputDiv.style.display = "none";
    }

    if (!history || history.length == 0) {
        //document.getElementById("state_details_history").innerHTML = '<a href="#">(check commits)</a>';
        if (historyHandler) {
            //document.getElementById("state_details_history").addEventListener("click", historyHandler);
        }
    } else {
        //displayCommitHistory(history, document.getElementById("state_details_history"));    
    }
}

function displayState(state) {
    var package = stateLibrary.findElement(package => package.name == state.package);
    var stateDiv = document.createElement("li");
    stateDiv.setAttribute("class", "state_entry");
    var regEx = new RegExp(searchString, "ig");
    stateDiv.innerHTML = 
          "<b>" + state.name.replace(regEx, str => '<font class="name_hit">'+ str +'</font>') + "</b><br />"
        + "<i>" + state.desc.replace(regEx, str => '<font class="desc_hit">'+ str +'</font>') + "</i>";
    var clickCallback = function(state, package) {
        return function(evt) {
            if (!state.history) {
                displayStateDetails(state.def, package.owner, package.repo, package.ref, state.path, state.history, function() {
                    console.log("Fetch commit data for " + package.owner + "/" + package.repo + "/" + state.path);
                    listCommits(package.owner, package.repo, package.ref, state.path, history => {
                        state.history = JSON.parse(history);
                        displayStateDetails(state.def, package.owner, package.repo, package.ref, state.path, state.history);
                    });
                });
            } else {
                displayStateDetails(state.def, package.owner, package.repo, package.ref, state.path, state.history);
            }
        };
    }
    stateDiv.addEventListener("click", clickCallback(state, package));
    document.getElementById(package.name + "_state_list").appendChild(stateDiv);
}

function displayPackageDetails(owner, repo, packageName, path, div) {
    div.innerHTML = `
        <h2>`+ packageName +`</h2>
        <table>
            <tr><td>Owner:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
            <td><a href="https://github.com/`+ owner +`" target="_blank" title="View on GitHub">`+ owner +`</a></td></tr>
            <tr><td>Repo:</td>
            <td><a href="https://github.com/`+ owner +`/`+ repo +`" target="_blank" title="View on GitHub">`+ repo +`</a></td></tr>
        </table>
    `;
}

function displayPackage(package) {
    var filtered_states = package.states.filter(state => {
        return searchString == ""
            || state.name.toLowerCase().includes(searchString)
            || state.desc.toLowerCase().includes(searchString);
    });
    if (filtered_states.length == 0)
        return;
    var pkgDiv = document.createElement("div");
    pkgDiv.setAttribute("class", "package_entry");
    document.getElementById("package_list").appendChild(pkgDiv);
    displayPackageDetails(package.owner, package.repo, package.name, package.path, pkgDiv);
    var stateListDiv = document.createElement("ul");
    stateListDiv.id = package.name + "_state_list";
    stateListDiv.setAttribute("class", "state_list");
    pkgDiv.appendChild(stateListDiv);
    filtered_states.forEach(displayState);
}

function processState(package, content) {
    try {
        var stateDef = IO.StateParser.parseState(content, package);
        stateDef.getStateClass();
        return stateDef;
    } catch (error) {
        console.error(error);
        console.log(content);
        return;
    }
}

function processPackage(owner, repo, ref, path, callback) {
    var packageName = path.split("/").pop();
    getContents(owner, repo, ref, path, files => {
        var fileEntries = JSON.parse(files).filter(fileEntry => {
            return (fileEntry.name != "__init__.py")
                && (fileEntry.name.endsWith(".py"));
        });
        var todo = fileEntries.length;
        var states = [];
        fileEntries.forEach(fileEntry => {
            getRaw(owner, repo, ref, fileEntry.path, content => {
                var stateDef = processState(packageName, content);
                if (stateDef) {
                    states.push({
                        'name': stateDef.getStateClass(),
                        'desc': stateDef.getShortDesc(),
                        'path': fileEntry.path,
                        'history': undefined,
                        'def': stateDef,
                        'package': packageName
                    });
                }
                todo -= 1;
                if (todo == 0) {
                    states.sort((s1, s2) => {
                        return s1.name.localeCompare(s2.name);
                    });
                    stateLibrary.push({
                        'name': packageName,
                        'owner': owner,
                        'repo': repo,
                        'ref': ref,
                        'path': path,
                        'states': states
                    });
                    callback();
                }
            });
        });
    });
}

function updateView() {
    document.getElementById("package_list").innerHTML = "";
    searchString = document.getElementById("search_field").value.toLowerCase();
    stateLibrary.forEach(displayPackage);
}

var searchString = "";
var stateLibrary = [];

window.onload = function() {
    packages.reverse();
    var nextPackage = function(package, callback)  {
        processPackage(package.owner, package.repo, package.ref, package.path, callback);
    }
    var callback = function() {
        updateView();
        if (packages.length == 0) {
            document.getElementById("search_field").addEventListener("keyup", updateView);
        } else {
            nextPackage(packages.pop(), callback);
        }
    }
    nextPackage(packages.pop(), callback);
}
