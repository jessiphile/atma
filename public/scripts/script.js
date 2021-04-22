// I tried to use classes as much as possible to improve performance. As such, most functions add/remove class names to elements to alter the map.
// Some change a single atribute, and others, like zooming and panning, use javascript based animations.
const menu_but_closed="/images/map/Menu_But_Closed.png"
const menu_but_open="/images/map/Menu_But_Open.png"

var loopCheck = 0;
var zoomLvl = 1;
var scale = 1024 * zoomLvl * -1;
var spot1 = 0;
var spot2 = 0;
var dot_name = null;
var dot_type = null;
var clicking = false
var clicked = false



var winX = window.innerWidth
var winY = window.innerHeight
// vv- moves the map proportionally with the screen when resized.
window.onresize = function() {
    var map = document.getElementById('background')
    var water = document.getElementById('map')
    
    if(window.innerHeight < winY) {
        var amntY = (winY - window.innerHeight) / 2
        map.style.marginTop = parseInt(map.style.marginTop) - parseInt(amntY) + 'px'
        
    } else {
        var amntY = (window.innerHeight - winY) / 2
        map.style.marginTop = parseInt(map.style.marginTop) + parseInt(amntY) + 'px'
    }

    if(window.innerWidth < winX) {
        var amntX = (winX - window.innerWidth) / 2
        map.style.marginLeft = parseInt(map.style.marginLeft) - parseInt(amntX) + 'px'
        
    } else {
        var amntX = (window.innerWidth - winX) / 2
        map.style.marginLeft = parseInt(map.style.marginLeft) + parseInt(amntX) + 'px'
    }

    water.style.backgroundPositionY =  map.style.marginTop;
    water.style.backgroundPositionX =  map.style.marginLeft;
    winY = window.innerHeight
    winX = window.innerWidth
}

var curValue = 907
var slider = document.getElementById("myRange");
var output = document.getElementById("year");

// vv- opens right hand menu panel
function toggleMenu() {
    var menu = document.getElementById("menu");
    var infoBox = document.getElementById("info");
    var button = document.getElementById('menuBut')
    if(menu.classList.contains('menuOpen')) {
        menu.classList.remove('menuOpen')
        menu.classList.add('menuClose')
        button.classList.remove("change")
    } else {
        menu.classList.remove('menuClose')
        menu.classList.add('menuOpen')
        button.classList.add("change")
        if(infoBox.classList.contains('infoOpen')) {
            toggleInfoBox(true)
        }
    }
}

// vv- If mouse is scrolled while over map, activates scrolling functions.
var map = document.getElementById('map')
map.addEventListener("wheel", event => {
    if(event.deltaY > 0) {
        zoomOut(.1)
    } else {
        zoomIn(.1)
    }
})

// Handles zooming in (duh)
function zoomIn(amnt) {
    if(zoomLvl < 3.5) {
        var myImg = document.getElementById("background");
        var top = parseInt(myImg.style.marginTop);
        var left = parseInt(myImg.style.marginLeft);
        var water = document.getElementById('map')
        var size = parseInt(myImg.children[0].clientHeight);
        var allDots = document.getElementById("allDots").children;
        var prevZoom = zoomLvl
        // amnt is used to determin if zoom is from scroll wheel or zoom button.
        if(amnt == .5) {
            // zoom button scroll. Uses interval animation
            var change = ((Math.round(zoomLvl*2) / 2) + amnt) - zoomLvl.toFixed(1)
            var goal = zoomLvl + change
            var id = setInterval(frame, 10);
            var value = 0;
            if(goal > 3.5) {
                goal = 3.5
            }
            function frame(){
                if(zoomLvl > goal){
                    zoomLvl = roundHalf(zoomLvl)
                    moveThem()
                    clearInterval(id);
                }
                else{
                    zoomLvl += .02
                    value = (1024 * zoomLvl) - size
                    if(zoomLvl > 2) {
                        shift()
                    }
                    moveThem()
                }
            }
        } else {
            // scroll wheel zoom. Just shifts everything once by changed amount, no animation.
            zoomLvl = round10(zoomLvl + amnt)
            value = (1024 * zoomLvl) - size
            if(zoomLvl > 2) {
                shift()
            }
            moveThem()
        }

        // Both zooming methods use this function the adjust the map and locations.
        function moveThem() {
            myImg.style.height = (1024 * zoomLvl) + "px";
            myImg.style.width = (1024 * zoomLvl) + "px";

            myImg.style.marginTop = (top - (value / 2)) + "px";
            myImg.style.marginLeft = (left - (value / 2)) + "px";

            water.style.backgroundPositionY =  myImg.style.marginTop;
            water.style.backgroundPositionX =  myImg.style.marginLeft;
            water.style.backgroundSize = (size + value) + "px " + (size + value) + "px";

            // Moves each location
            for(i = 0; i < allDots.length; i++) {
                allDots[i].style.left = parseInt(allDots[i].children[0].style.left) * zoomLvl + 'px'
                allDots[i].style.top = parseInt(allDots[i].children[0].style.top) * zoomLvl + 'px'
                if(!allDots[i].classList.contains('text')) {
                    if(zoomLvl > 2) {
                        allDots[i].style.height = 25 * zoomLvl +'px'
                        allDots[i].style.width = 25 * zoomLvl +'px'
                    }
                }
            }
            
            // Moves the animated ship icons.
            var ships = document.getElementById('ships').children
            for(i = 0; i < ships.length; i++) {
                var ship = ships[i]
                ship.children[0].style.top = parseInt(ship.children[1].style.top) * zoomLvl + 'px'
                ship.children[0].style.left = parseInt(ship.children[1].style.left) * zoomLvl + 'px'
                ship.children[0].style.height = 20 * zoomLvl + 'px'
                ship.children[0].style.width = 20 * zoomLvl + 'px'
            }

            scale = 1024 * zoomLvl * -1;
        }

        // if beyond a zoom level it changes the location icons.
        function shift() {
            var dots = document.getElementById('allDots').children
            for(i = 0; i < dots.length; i++) {
                var dot = dots[i]
                if(!dot.classList.contains('text')) {
                    dot.classList.remove('zoomOut')
                    dot.classList.add('zoomIn')
                }
            }
            if(zoomLvl < 2.2) {
                toggleCheck('country', false)
            }
        }
    }
}

// zoom out function (duh again)
// works the same as zoomin, just in reverse
function zoomOut(amnt) {
    if(zoomLvl > 1.1) {
        var myImg = document.getElementById("background");
        var top = parseInt(myImg.style.marginTop);
        var left = parseInt(myImg.style.marginLeft);
        var water = document.getElementById('map')
        var size = parseInt(myImg.children[0].clientHeight);
        var allDots = document.getElementById("allDots").children;
        var prevZoom = zoomLvl
        if(amnt == .5) {
            var change = zoomLvl - ((Math.round(zoomLvl*2) / 2) - amnt)
            var goal = zoomLvl - change
            var id = setInterval(frame, 10);
            var value = 0;
            if(goal < 1) {
                goal = 1
            }
            
            function frame(){
                if(zoomLvl < goal){
                    zoomLvl = roundHalf(zoomLvl)
                    moveThem()
                    clearInterval(id);
                }
                else{
                    zoomLvl = zoomLvl - .02;
                    value = (1024 * zoomLvl) - size
                    if(zoomLvl < 2.01) {
                        shift()
                    }
                    moveThem()
                }
            }
        } else {
            zoomLvl = round10(zoomLvl - amnt);
            value = (1024 * zoomLvl) - size
            if(zoomLvl < 2.01) {
                shift()
            }
            moveThem()
        }

        function moveThem() {
            var stopNumy = window.innerHeight - (260 * zoomLvl);
            var stopNumx = window.innerWidth - (250 * zoomLvl);
            
            myImg.style.height = (1024 * zoomLvl) + "px";
            myImg.style.width = (1024 * zoomLvl) + "px";

            myImg.style.marginTop = (top - (value / 2)) + "px";
            myImg.style.marginLeft = (left - (value / 2)) + "px";

            for(i = 0; i < allDots.length; i++) {
                allDots[i].style.left = (parseInt(allDots[i].children[0].style.left) * zoomLvl) + 'px'
                allDots[i].style.top = (parseInt(allDots[i].children[0].style.top) * zoomLvl) + 'px'
                if(!allDots[i].classList.contains('text')) {
                    if(zoomLvl > 2.01) {
                        allDots[i].style.height = 25 * zoomLvl +'px'
                        allDots[i].style.width = 25 * zoomLvl +'px'
                    } else {
                        allDots[i].style.height = 28 +'px'
                        allDots[i].style.width = 28 +'px'
                    }
                }
            }

            var ships = document.getElementById('ships').children
            for(i = 0; i < ships.length; i++) {
                var ship = ships[i]
                ship.children[0].style.top = parseInt(ship.children[1].style.top) * zoomLvl + 'px'
                ship.children[0].style.left = parseInt(ship.children[1].style.left) * zoomLvl + 'px'
                ship.children[0].style.height = 20 * zoomLvl + 'px'
                ship.children[0].style.width = 20 * zoomLvl + 'px'
            }
            
            // --vv-- Keeps map in the screen when zooming out.
            if(myImg.offsetTop < scale + (60 * zoomLvl)) {
                myImg.style.marginTop = (scale + (60 * zoomLvl)) + 1 + "px";
            }
            else{
                if(myImg.offsetTop > stopNumy) {
                    myImg.style.marginTop = stopNumy - 1 + "px";
                }
            }

            if(myImg.offsetLeft < scale + (260 * zoomLvl)) {
                myImg.style.marginLeft = (scale + (260 * zoomLvl)) + 1 + 'px'
            }
            else{
                if(myImg.offsetLeft > stopNumx){
                    myImg.style.marginLeft = stopNumx - 1 + "px";
                }
            }
            // --^^--

            water.style.backgroundPositionY =  myImg.style.marginTop;
            water.style.backgroundPositionX =  myImg.style.marginLeft;
            water.style.backgroundSize = (size + value) + "px " + (size + value) + "px";

            scale = 1024 * zoomLvl * -1;
        }

        function shift() {
            var dots = document.getElementById('allDots').children
            for(i = 0; i < dots.length; i++) {
                var dot = dots[i]
                if(!dot.classList.contains('text')) {
                    dot.classList.remove('zoomIn')
                    dot.classList.add('zoomOut')
                }
            }
            if(zoomLvl > 1.9) {
                toggleCheck('country', true)
            }
        }
    }
}

// Math functions for zooming.
function roundHalf(num) {
    return Math.round(num*2)/2;
}
function round10(num) {
    return Math.round(num * 10) / 10;
}

// Handles map panning. This was copied and modified from an online form, so I don't fully understand it.
function dragElement(win) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    // Move the DIV from anywhere inside the DIV:
    win.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }


    function elementDrag(e) {
        var stopNumy = window.innerHeight - (260 * zoomLvl);
        var stopNumx = window.innerWidth - (250 * zoomLvl);
        
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // set the element's new position:
        var elmnt = document.getElementById('background')
        var water = document.getElementById('map')
        
        // --vv-- Moves the map. All the if and elses are to keep the map contrained in the window.
        if(elmnt.offsetTop < scale + (60 * zoomLvl)) {
            elmnt.style.marginTop = (scale + (60 * zoomLvl)) + 1 + "px";
        }
        else{
            if(elmnt.offsetTop > stopNumy) {
                elmnt.style.marginTop = stopNumy - 1 + "px";
            } else {
                elmnt.style.marginTop = (elmnt.offsetTop - pos2) + "px";
                win.style.cursor = "grabbing";
            }
        }

        
        if(elmnt.offsetLeft < scale + (260 * zoomLvl)) {
            elmnt.style.marginLeft = (scale + (260 * zoomLvl)) + 1 + 'px'
        }
        else{
            if(elmnt.offsetLeft > stopNumx){
                elmnt.style.marginLeft = stopNumx - 1 + "px";
            }
            else{
                win.style.cursor = "grabbing";
                elmnt.style.marginLeft = (elmnt.offsetLeft - pos1) + "px";                
            }
        }
        water.style.backgroundPositionY =  elmnt.style.marginTop;
        water.style.backgroundPositionX =  elmnt.style.marginLeft;
        // --^^--
    }

    

    function closeDragElement() {
        // stop moving when mouse button is released:
        var dragElmnt = document.getElementById("map");
        dragElmnt.style.cursor = "grab";
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


// When the page is loaded it runs through this function (which runs through other functions) before hiding the splash screen.
async function loadMap() {
    var allCheck = document.getElementById('all')

    await loadImages()
    await setPos()
    allCheck.children[0].checked = false
    await setChecks()

    var window = document.getElementById('window')
    var splash = document.getElementById('splash')
    
    window.style.visibility = 'visible';
    splash.classList.add("splashAfter");
    splash.children[1].classList.remove('loadingText')
}

// Checks to ensure all images are loaded in, then triggers the next load up function.
function loadImages() {
    return new Promise(resolve => {
        var loadedImages = []

        var img0 = new Image()
        var img1 = new Image()
        var img2 = new Image()
        var img3 = new Image()
        var img4 = new Image()
        var img5 = new Image()
        var img6 = new Image()
        var img7 = new Image()
        var img8 = new Image()
        var img9 = new Image()
        var img10 = new Image()
        
        
        img0.src = '/images/icons/iconOutHover.png'
        loadedImages.push(img0)
        img1.src = '/images/icons/iconOutSelected.png'
        loadedImages.push(img1)
        img2.src = '/images/icons/city large.png'
        loadedImages.push(img2)
        img3.src = '/images/icons/city.png'
        loadedImages.push(img3)
        img4.src = '/images/icons/fortress.png'
        loadedImages.push(img4)
        img5.src = '/images/icons/land.png'
        loadedImages.push(img5)
        img6.src = '/images/icons/location.png'
        loadedImages.push(img6)
        img7.src = '/images/icons/village large.png'
        loadedImages.push(img7)
        img8.src = '/images/icons/village med.png'
        loadedImages.push(img8)
        img9.src = '/images/icons/village.png'
        loadedImages.push(img9)
        img10.src = '/images/borders.png'
        loadedImages.push(img10)

        
        var images = document.images
        var len = images.length
        var counter = 0;

        // Gets all images and checks that each is loaded then incriments a counter
        for(i = 0; i < len; i++) {
            var img = images[i]
            if(img.complete) {
                incrementCounter();
            } else {
                img.addEventListener( 'load', incrementCounter, false );
            }
        }

        // Loads the additional images that arent on the page on start up.
        for(i = 0; i < loadedImages.length; i++) {
            var img = loadedImages[i]
            if(img.complete) {
                incrementCounter();
            } else {
                img.addEventListener( 'load', incrementCounter, false );
            }
        }
        
        // Increases image load counter, then when finished resolves the funtion.
        function incrementCounter() {
            counter++;
            if ( counter === len + loadedImages.length) {
                resolve()
            }
        }
    })
}

// Ensures that all elements are in their appropriate positions.
function setPos() {
    return new Promise(resolve => {
        var elmnt = document.getElementById('background')
        var water = document.getElementById('map')
        var dots = document.getElementById('allDots').children
        var sizeX = (window.innerWidth - 1024) / 2
        var sizeY = (window.innerHeight - 1024) / 2

        elmnt.style.marginLeft = sizeX + 'px';
        elmnt.style.marginTop = sizeY + 'px';

        water.style.backgroundPositionY =  elmnt.offsetTop + 'px';
        water.style.backgroundPositionX =  elmnt.offsetLeft + 'px';

        // Ensured the placing of each dot.
        for(i = 0; i < dots.length; i++) {
            dot = dots[i]
            if(!dot.classList.contains('text')) {
                dot.children[1].style.marginLeft = (parseInt(dot.children[1].offsetWidth) / 2) * -1 + 'px'
            }
        }

        // This is the last function, so an interval here garentees that the splash screen will remain up for at least one second.
        setTimeout(resolve, 1000);
    })
}

// Sets the check boxes to the corrent setting on loadup.
function setChecks() {
    return new Promise(resolve => {
        var checkBoxes = document.getElementById('toggles').children
        for(i = 0; i < checkBoxes.length - 1; i++) {
            var box = checkBoxes[i].children[0]
            if(i > 0) {
                if(box.id != 'allCheck' && box.id != 'bordersCheck') {
                    box.checked = true
                } else {
                    box.checked = false
                }
            }
        }
        resolve()
    })
}

// Function for when a location is selected.
function select(id) {
    var loc = document.getElementById(id)
    var sel = document.getElementById(id + 'Sel')
    var off = false
    if(loc.classList.contains('selected')) {
        off = true
    }
    deSelAll()
    if(!off) {
        if(!loc.classList.contains('text') || loc.classList.contains('textSel')) {
            toggleSpecLoc(id, true)
            loc.classList.add('selected')
            loc.classList.remove('hide')
            loc.classList.add('show')
            sel.innerHTML = '(Deselect)'
            sel.style.color = 'rgb(201, 184, 36)'
        } else {
        }
    }
    toggleInfoBox(off, loc)
}

// Deselects all locations on the map.
function deSelAll() {
    var dots = document.getElementById('allDots').children
    var sels = document.getElementsByClassName('checkMain')
    for(i = 0; i < dots.length; i++) {
        var dot = dots[i]
        var sel = sels[i]
        dot.classList.remove('selected')
        if(sel.children[1]) {
            sel.children[1].innerHTML = '(Select)'
            sel.children[1].style.color ='unset'
        }
    }
}

// Opens right hand info panel.
function toggleInfoBox(close, loc) {
    var box = document.getElementById('info')
    var menu = document.getElementById('menu')
    if(box.classList.contains('infoOpen') && close) {
        box.classList.remove('infoOpen')
        box.classList.add('infoClose')
        box.children[0].style.display = 'none'
        deSelAll()
    } else {
        insertInfo(loc)
        box.classList.remove('infoClose')
        box.classList.add('infoOpen')
        box.children[0].style.display = 'block'
        if(menu.classList.contains('menuOpen')) {
            toggleMenu()
        }
    }
}

// Loads location info into right hand info panel.
function insertInfo(loc) {
    var title = loc.children[1].innerHTML
    var info = loc.children[2].innerHTML
    var box = document.getElementById('info')
    var boxImage = document.getElementById('infoImage')
    box.children[1].children[0].innerHTML = title
    box.children[1].children[2].innerHTML = info
    if(loc.children[3]) {
        if(loc.children[3].id == 'locImage') {
            boxImage.src = '/images/locations/' + loc.children[1].innerHTML + '/' + loc.children[3].innerHTML
            box.children[1].children[3].style.display = 'block';
        } else {
            if(loc.children[4]) {
                if(loc.children[4].id == 'locImage') {
                    boxImage.src = '/images/locations/' + loc.children[1].innerHTML + '/' + loc.children[4].innerHTML
                    box.children[1].children[3].style.display = 'block';
                }
                
            } else {
                box.children[1].children[3].style.display = 'none';
            }
        }
    } else {
        box.children[1].children[3].style.display = 'none';
    }
}

// Toggles checkmarks on or off
function toggleCheck(item, val) {
    var check = document.getElementById(item + 'Check')
    if(val != null) {
        check.checked = val
    } else {
        if(check.checked) {
            check.checked = false
        } else {
            check.checked = true
        }
    }
    if(item == 'city') {
        var capCheck = document.getElementById('capitalCheck')
        capCheck.checked = check.checked
    }
    if(item == 'borders') {
        var img = document.getElementById("mapImage")
        if(check.checked) {
            img.src = '/images/borders.png'
        } else {
            img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
        }
        
    } else {
        toggleLoc(item)
    }
    checkAllChecks()
}

// Toggles a location based on if its part of the category of the current checkbox
function toggleLoc(type) {
    var locs = document.getElementsByClassName(type)
    var box = document.getElementById(type + 'Check')
    for(i = 0; i < locs.length; i++) {
        var loc = locs[i]
        var specCheck = document.getElementById(loc.id + 'Check')
        if(box.checked) {
            specCheck.checked = true
            loc.classList.add('show')
            loc.classList.remove('hide')
        } else {
            specCheck.checked = false
            loc.classList.add('hide')
            loc.classList.remove('show')
        }
    }
}

// Toggles the "all" check box if all the check boxes are checked.
function checkAllChecks() {
    var checkBoxes = document.getElementById('toggles').children
    var allCheck = document.getElementById('allCheck')
    var allChecked = true
    for(i = 0; i < checkBoxes.length; i++) {
        var box = checkBoxes[i].children[0]
        if(box.id != 'allCheck') {
            if(box.checked == false) {
                allChecked = false
                break
            }
        }
    }
    if(allChecked) {
        allCheck.checked = true
    } else {
        allCheck.checked = false
    }
}

// If all check box is checked it toggles all the other check boxes and their loactions.
function toggleAllChecks(allBox) {
    var checkBoxes = document.getElementById('toggles').children
    var checked = false

    if(!allBox.children[0].checked) {
        checked = true
    }
    allBox.children[0].checked = checked
    
    for(i = 0; i < checkBoxes.length - 1; i++) {
        var box = checkBoxes[i].children[0]
        if(i > 0) {
            var locs = document.getElementsByClassName(checkBoxes[i].id)
            box.checked = checked
            for(j = 0; j < locs.length; j++) {
                var loc = locs[j]
                var specCheck = document.getElementById(loc.id + 'Check')
                if(checked) {
                    specCheck.checked = true
                    loc.classList.add('show')
                    loc.classList.remove('hide')
                } else {
                    specCheck.checked = false
                    loc.classList.add('hide')
                    loc.classList.remove('show')
                }
            }
            if(box.id == 'bordersCheck') {
                var img = document.getElementById("mapImage")
                if(checked) {
                    img.src = '/images/borders.png'
                } else {
                    img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                }
            }
        }
    }
}

// Toggles locations selected from the specific check boxes list.
function toggleSpecLoc(loc, on) {
    var specLoc = document.getElementById(loc)
    var check = document.getElementById(loc + 'Check')

    if(on || !check.checked) {
        check.checked = true
        specLoc.classList.add('show')
        specLoc.classList.remove('hide')
    } else {
        check.checked = false
        specLoc.classList.add('hide')
        specLoc.classList.remove('show')
    }
}

// Opens the credits and copyright box.
function toggleCredits(show) {
    var credits = document.getElementById('credits')
    if(show) {
        credits.style.display = 'block'
    } else {
        credits.style.display = 'none'
    }
}

// Controls the text on the lower right of the screen. Should be hidden when the map is not being worked on.
function myAlert(text){
    var errText = document.getElementById("print");
    errText.style.visibility = "visible";
    errText.innerHTML = text;
}

// Uses the MyAlert text to show mouse position for loaction placement.
function mousePos(e){
    var img = document.getElementById("background");
    var x = e.clientX - img.offsetLeft;
    var y = e.clientY - img.offsetTop;
    var text = "x = " + x + ", y = " + y + ' | zoom: ' + zoomLvl;
    myAlert(text);
}