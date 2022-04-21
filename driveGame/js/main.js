(function () {
    var script = document.createElement('script'); script.onload = function () {
        var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() {
            stats.update(); requestAnimationFrame(loop)
        });
    }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';
    document.head.appendChild(script);
})()

window.addEventListener('resize', function () {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
})

var gui = new dat.GUI();

const renderer = new THREE.WebGLRenderer({
    logarithmicDepthBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new THREE.GLTFLoader();
var goal, follow;
var angel = new THREE.Vector3;
var dir = new THREE.Vector3;
var a = new THREE.Vector3;
var b = new THREE.Vector3;
var SafetyDistance = 0.3;
var velocity = 0.0;
var speed = 0.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.lookAt(scene.position);

goal = new THREE.Object3D;
follow = new THREE.Object3D;

const light = new THREE.AmbientLight("white", 1);
gui.add(light, "intensity", 0, 9.0);
scene.add(light);

const light2 = new THREE.DirectionalLight("white", 2);
gui.add(light2, "intensity", 0, 9.0);
scene.add(light2);

var cityModel;
class City {
    constructor() {
        loader.load("driveGame/models/track.glb", (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(10, 10, 10);
            gltf.scene.rotation.set(0, -1.56, 0);
            gltf.scene.position.set(-200, -16, -100);
            cityModel = gltf.scene;
        });
    }
}
var gallery = new City();

let keys = {};
function keyDown(event) {
    keys[event.key] = true;
};
function keyUp(event) {
    delete keys[event.key]
};

document.onkeydown = keyDown;
document.onkeyup = keyUp;

const fbxloader = new THREE.FBXLoader();
let player = [];
let mixer = new THREE.AnimationMixer();
let clock = new THREE.Clock();
var playerCamera = new THREE.Object3D();
var carModel;
var carModels = {};
var modelaction = false;

function playSound(engineSound, time) {
    if (time) {
        engineSound.currentTime = time;
    }
    engineSound.play()
};

class CarModel {
    constructor() {
        this.visitorModel("current")
    }

    visitorModel(id) {
        fbxloader.load("driveGame/models/car anim.fbx", (object) => {
            object.scale.set(.003, .0028, .003);
            object.rotation.set(0, -3.1, 0);
            object.position.set(1, -8, 2);
            carModel = object;
            carModel.children[0].material[5].specular.r = 1
            carModel.children[0].material[5].specular.g = 1
            carModel.children[0].material[5].specular.b = 1
            scene.add(carModel);
            carModel.add(follow);
            carModels[id] = object;
        })
    }

    forward(carModel) {
        speed = 0;
        window.addEventListener("keydown", (event) => {
            if (event.key == "w") {
                speed = 1.0;
                if (!modelaction) {
                    modelaction = true;
                    mixer = new THREE.AnimationMixer(carModel);
                    const animateAction1 = mixer.clipAction(carModel.animations[3]).play();
                    const animateAction2 = mixer.clipAction(carModel.animations[9]).play();
                    const animateAction3 = mixer.clipAction(carModel.animations[5]).play();
                    const animateAction4 = mixer.clipAction(carModel.animations[10]).play();
                    player.push(animateAction1, animateAction2, animateAction3, animateAction4);
                    scene.add(carModel);
                }
            }
        })

        window.addEventListener("keyup", (event) => {
            if (event.key == "w") {
                modelaction = false;
                mixer = new THREE.AnimationMixer(carModel);
                const animateAction = mixer.clipAction(carModel.animations[2]);
                animateAction.paused = true;
                player.push(animateAction);
                scene.add(carModel);
                var driveSound = new Audio('driveGame/audios/handbrake.mp3')
                playSound(driveSound, 0)

            }
        })
    }
    reverse(carModel) {
        speed = -0.7;
        window.addEventListener("keydown", (event) => {
            if (speed != 0) {
                if (event.key == "s") {
                    if (!modelaction) {
                        modelaction = true;
                        mixer = new THREE.AnimationMixer(carModel);
                        const animateAction1 = mixer.clipAction(carModel.animations[3])
                        const animateAction2 = mixer.clipAction(carModel.animations[9])
                        const animateAction3 = mixer.clipAction(carModel.animations[5])
                        const animateAction4 = mixer.clipAction(carModel.animations[10])

                        if (animateAction1.time || animateAction2 || animateAction3 || animateAction4 == 0) {
                            animateAction1.time = animateAction1.getClip().duration;
                            animateAction2.time = animateAction2.getClip().duration;
                            animateAction3.time = animateAction3.getClip().duration;
                            animateAction4.time = animateAction4.getClip().duration;
                        }
                        animateAction1.paused = false;
                        animateAction1.setLoop(THREE.LoopOnce);
                        animateAction1.timeScale = -0.8;
                        animateAction1.play();
                        animateAction2.paused = false;
                        animateAction2.setLoop(THREE.LoopOnce);
                        animateAction2.timeScale = -0.8;
                        animateAction2.play();
                        animateAction3.paused = false;
                        animateAction3.setLoop(THREE.LoopOnce);
                        animateAction3.timeScale = -0.8;
                        animateAction3.play();
                        animateAction4.paused = false;
                        animateAction4.setLoop(THREE.LoopOnce);
                        animateAction4.timeScale = -0.8;
                        animateAction4.play();

                        player.push(animateAction1, animateAction2, animateAction3, animateAction4);
                        scene.add(carModel);
                    }
                }
            }
        })

        window.addEventListener("keyup", (event) => {
            if (speed != 0) {
                if (event.key == "s") {
                    modelaction = false;
                    mixer = new THREE.AnimationMixer(carModel);
                    const animateAction = mixer.clipAction(carModel.animations[2]);
                    animateAction.paused = true;
                    player.push(animateAction);
                    scene.add(carModel);
                }
            }
        })
    }
    turnLeft(carModel) {
        window.addEventListener("keydown", (event) => {
            if (speed != 0) {
                if (event.key == "a") {
                    if (!modelaction) {
                        modelaction = true;
                        mixer = new THREE.AnimationMixer(carModel);
                        const animateAction1 = mixer.clipAction(carModel.animations[1]).play();
                        const animateAction2 = mixer.clipAction(carModel.animations[6]).play();
                        const animateAction3 = mixer.clipAction(carModel.animations[5]).play();
                        const animateAction4 = mixer.clipAction(carModel.animations[9]).play();
                        player.push(animateAction1, animateAction2, animateAction3, animateAction4);
                        scene.add(carModel);
                    }
                }
            }
        })

        window.addEventListener("keyup", (event) => {
            if (speed != 0) {
                if (event.key == "a") {
                    modelaction = false;
                    mixer = new THREE.AnimationMixer(carModel);
                    const animateAction1 = mixer.clipAction(carModel.animations[3]).play();
                    const animateAction2 = mixer.clipAction(carModel.animations[9]).play();
                    const animateAction3 = mixer.clipAction(carModel.animations[5]).play();
                    const animateAction4 = mixer.clipAction(carModel.animations[10]).play();
                    player.push(animateAction1, animateAction2, animateAction3, animateAction4);
                    scene.add(carModel);
                }
            }
        })
    }
    turnRight(carModel) {
        window.addEventListener("keydown", (event) => {
            if (speed != 0) {
                if (event.key == "d") {
                    if (!modelaction) {
                        modelaction = true;
                        mixer = new THREE.AnimationMixer(carModel);
                        const animateAction1 = mixer.clipAction(carModel.animations[7]).play();
                        const animateAction2 = mixer.clipAction(carModel.animations[8]).play();
                        const animateAction3 = mixer.clipAction(carModel.animations[5]).play();
                        const animateAction4 = mixer.clipAction(carModel.animations[9]).play();
                        player.push(animateAction1, animateAction2, animateAction3, animateAction4);
                        scene.add(carModel);
                    }
                }
            }
        })

        window.addEventListener("keyup", (event) => {
            if (speed != 0) {
                if (event.key == "d") {
                    modelaction = false;
                    mixer = new THREE.AnimationMixer(carModel);
                    const animateAction1 = mixer.clipAction(carModel.animations[3]).play();
                    const animateAction2 = mixer.clipAction(carModel.animations[9]).play();
                    const animateAction3 = mixer.clipAction(carModel.animations[5]).play();
                    const animateAction4 = mixer.clipAction(carModel.animations[10]).play();
                    player.push(animateAction1, animateAction2, animateAction3, animateAction4);
                    scene.add(carModel);
                }
            }
        })
    }
    handBrake(carModel) {
        window.addEventListener("keydown", (event) => {
            if (speed != 0) {
                if (event.key == " ") {
                    if (!modelaction) {
                        modelaction = true;
                        mixer = new THREE.AnimationMixer(carModel);
                        const animateAction1 = mixer.clipAction(carModel.animations[3]).play();
                        const animateAction2 = mixer.clipAction(carModel.animations[10]).play();
                        player.push(animateAction1, animateAction2);
                        scene.add(carModel);
                    }
                }
            }
        })

        window.addEventListener("keyup", (event) => {
            if (speed != 0) {
                if (event.key == " ") {
                    modelaction = false;
                    mixer = new THREE.AnimationMixer(carModel);
                    const animateAction1 = mixer.clipAction(carModel.animations[3]).play();
                    const animateAction2 = mixer.clipAction(carModel.animations[9]).play();
                    const animateAction3 = mixer.clipAction(carModel.animations[5]).play();
                    const animateAction4 = mixer.clipAction(carModel.animations[10]).play();
                    player.push(animateAction1, animateAction2, animateAction3, animateAction4);
                    scene.add(carModel);
                }
            }
        })
    }
}

var car = new CarModel();
setTimeout(() => {
    car.forward(carModel);
    car.reverse(carModel);
    car.turnLeft(carModel)
    car.turnRight(carModel)
    car.handBrake(carModel)
}, 130);

camera.position.set(0, 0, 5);
playerCamera.add(camera)
playerCamera.position.set(0.2, 5, 3)
gui.add(playerCamera.position, 'x', -20, 20)
gui.add(playerCamera.position, 'y', -20, 20)
gui.add(playerCamera.position, 'z', -20, 20)
goal.add(playerCamera);
scene.add(goal);

function updatePosition(event) {
    camera.rotation.order = 'YZX'
    let { movementX, movementY } = event
    let rotateSpeed = 0.002
    playerCamera.rotation.y -= movementX * rotateSpeed
    camera.rotation.x -= movementY * rotateSpeed
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(camera.rotation.x, Math.PI / 2))
    camera.rotation.order = 'XYZ'
}
function update() {

    speed = 0.0;

    if (keys["w"]) {
        if (keys["b"]) {
            speed = 1.0 * 2.5
            var driveSound = new Audio('driveGame/audios/engine.mp3')
            playSound(driveSound, 0.6)
        }
        else {
            speed = 1.0
            var driveSound = new Audio('driveGame/audios/engine.mp3')
            playSound(driveSound, 1.1)
        }

        velocity += (speed - velocity) * 0.3;
        carModel.translateZ(velocity);
    };

    if (keys["s"]) {
        speed = -0.7;
        velocity += (speed - velocity) * 0.3;
        carModel.translateZ(velocity);
        var driveSound = new Audio('driveGame/audios/engine.mp3')
        playSound(driveSound, 1.2)
    };

    if (keys["d"]) {
        if (speed != 0) {
            if (keys["s"]) {
                carModel.rotateY(+0.03);
            }
            else {
                carModel.rotateY(-0.03);
            }
        }
    };
    if (keys[" "]) {
        if (speed != 0) {
            speed = -0.4
            velocity += (speed - velocity) * 0.3;
            carModel.translateZ(velocity);
            var driveSound = new Audio('driveGame/audios/handbrake.mp3')
            playSound(driveSound, 0.35)
        }
    }

    if (keys["a"]) {
        if (speed != 0) {
            if (keys["s"]) {
                carModel.rotateY(-0.03);
            } else {
                carModel.rotateY(0.03);
            }
        }
    }

    setTimeout(() => {
        goal.position.lerp(angel, 0.06);
        angel.setFromMatrixPosition(follow.matrixWorld);
        camera.lookAt(carModel.position);
    }, 120);

    mixer.update(clock.getDelta());
};
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    update();
};
animate();