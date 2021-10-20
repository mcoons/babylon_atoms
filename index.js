(() => {

let _scene;
let _atomList = new Map();
let _renderCanvas = document.getElementById("renderCanvas");
let _engine = new BABYLON.Engine(_renderCanvas, true);

var _dataLoaded = false;
var _intervalID = null;
var _jsonData;

var _theta = 0;

let randomRange = (min, max) => Math.floor(Math.random() * (max - min)) + min;

let fixDpi = (p_canvas) => {
    let dpi = window.devicePixelRatio;
    let styles = window.getComputedStyle(p_canvas);
    let style = {
        height() {
            return +styles.height.slice(0, -2);
        },
        width() {
            return +styles.width.slice(0, -2);
        }
    };
    p_canvas.setAttribute('width', (style.width() * dpi).toString());
    p_canvas.setAttribute('height', (style.height() * dpi).toString());
}

let createScene = (options) => {
    let scene = new BABYLON.Scene(_engine, false);
    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    let camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 3, BABYLON.Vector3.Zero(), scene);
    camera.minZ = 0.1;
    camera.attachControl(_renderCanvas, true);

    let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    if (options.mouseInput === true) {
        // see if a click hits a cube or the selector
        let clickEvent = () => {
            let dpi = window.devicePixelRatio;
            var pickResult = _scene.pick(_scene.pointerX * dpi, _scene.pointerY * dpi);

            if (pickResult.hit === true) { console.log(pickResult) } 
            else { console.log("Nothing was clicked") }
        }

        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    console.log("POINTER DOWN");
                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    console.log("POINTER UP");
                    break;
                case BABYLON.PointerEventTypes.POINTERMOVE:
                    console.log("POINTER MOVE");
                    break;
                case BABYLON.PointerEventTypes.POINTERWHEEL:
                    console.log("POINTER WHEEL");
                    break;
                case BABYLON.PointerEventTypes.POINTERPICK:
                    console.log("POINTER PICK");
                    break;
                case BABYLON.PointerEventTypes.POINTERTAP:
                    console.log("POINTER TAP");
                    if (options.clickable3D === true)
                        clickEvent();
                    break;
                case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
                    console.log("POINTER DOUBLE-TAP");
                    break;
            }
        });
    }

    if (options.kbInput === true) {
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    console.log("KEY DOWN: ", kbInfo.event.key);
                    switch (kbInfo.event.key) {
                        case 'ArrowDown':
                            break;
                        case 'ArrowUp':
                            break;
                        case 'ArrowRight':
                            break;
                        case 'ArrowLeft':
                            break;
                        case ' ':
                            break;
                        default:
                            break;
                    }
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    // console.log("KEY UP: ", kbInfo.event.keyCode);
                    switch (kbInfo.event.key) {
                        case ' ':
                            break;
                    }
                    break;
            }
        });
    }

    window.addEventListener("resize", () => {
        _engine.resize();
        let windowW, windowH;

        windowW = visualViewport.innerWidth;
        windowH = visualViewport.innerHeight;
        console.log("listener : " + windowW + " , " + windowH);

        fixDpi(_renderCanvas);
    });

    return scene;
}

let moveAtoms = () => {
    _atomList.forEach( a => {
        a.position.z += .01;
        if (a.position.z > 0) { a.position.y += .0001 * a.position.z * 10 }
        if (a.position.z > 4) { a.material.alpha -= .002 }
    });

    if (_atomList.size >= 20) {
        _atomList.get(_atomList.keys().next().value).dispose();
        _atomList.delete(_atomList.keys().next().value);
    }
}

let spawnAtom = () => {

    let r = randomRange(0, _jsonData.length - 5);
    while (_atomList.has(r)) { r = randomRange(0, _jsonData.length - 5) }
    
    let textureCard = new BABYLON.DynamicTexture("dynamic texture", { width: 512, height: 256 }, _scene);
    let textureContext = textureCard.getContext();
    textureContext.textAlign = "center";

    let color = "#1affff";
    if (_jsonData[r].cpkHexColor != "" && _jsonData[r].cpkHexColor.length === 6) {
        color = "#" + _jsonData[r].cpkHexColor;
    }

    let font = "bold 50px Monaco";
    textureCard.drawText(_jsonData[r].atomicNumber, 120, 50, font, color, "transparent", true, true);
    textureCard.drawText(_jsonData[r].symbol, 256, 150, font, color, "transparent", true, true);
    font = "bold 32px Monaco";
    textureCard.drawText(_jsonData[r].name, 256, 90, font, color, "transparent", true, true);
    textureCard.drawText(_jsonData[r].atomicMass, 256, 190, font, color, "transparent", true, true);
    font = "bold 24px Monaco";
    textureCard.drawText(_jsonData[r].electronicConfiguration, 256, 230, font, color, "transparent", true, true);

    let materialCard = new BABYLON.StandardMaterial("Mat", _scene);
    materialCard.diffuseTexture = textureCard;
    materialCard.diffuseTexture.hasAlpha = true;
    materialCard.useAlphaFromDiffuseTexture = true;
    
    let card = BABYLON.MeshBuilder.CreatePlane("plane", { height: .5, width: .75 }, _scene); 
    card.hasVertexAlpha = true;
    card.material = materialCard;
    card.material.alpha = 1.0;


    let radius = .35;
    let x_pos = radius * Math.cos(_theta);
    let y_pos = radius * Math.sin(_theta); // * Math.cos(_theta);
    _theta += Math.PI / 2.5;
    //_theta = _theta%(Math.PI*2);
    if (_theta > Math.PI*2) {
        _theta = _theta - Math.PI *2;
    }
    card.position = new BABYLON.Vector3(x_pos, y_pos, -3);

    // card.position = new BABYLON.Vector3(randomRange(-4, 4) / 4, randomRange(-2, 2) / 5, -3);

    _atomList.set(r, card);
}

_scene = createScene({ kbInput: false, mouseInput: false, clickable3D: false });

_engine.runRenderLoop(() => {
    fixDpi(_renderCanvas);
    moveAtoms();
    _scene.render();
});

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        _jsonData = JSON.parse(this.responseText);
        // console.log(_jsonData);
        _dataLoaded = true;

        if (_dataLoaded && !_intervalID) {
            _intervalID = setInterval(spawnAtom, 1500);
        }
    }
};
xmlhttp.open("GET", "./atoms.json", true);
xmlhttp.send();

})();