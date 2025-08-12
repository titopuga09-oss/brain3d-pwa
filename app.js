let scene, camera, renderer, clock;
let mixer;
let studyMode = true;
let score = 0;
let timerValue = 15;
let timerInterval;
let targetRegion;

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
    document.getElementById('viewer').appendChild(renderer.domElement);

    camera.position.z = 5;

    // Luz
    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 1, 0);
    scene.add(light);

    // Placeholder: Esferas representando regiones
    const regions = [
        { name: "Lóbulo frontal", color: 0xff0000, position: [-1, 0, 0] },
        { name: "Lóbulo parietal", color: 0x00ff00, position: [1, 0, 0] },
        { name: "Lóbulo temporal", color: 0x0000ff, position: [0, -1, 0] },
        { name: "Lóbulo occipital", color: 0xffff00, position: [0, 1, 0] }
    ];

    regions.forEach(r => {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: r.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...r.position);
        mesh.userData = { name: r.name };
        scene.add(mesh);
    });

    // Eventos botones
    document.getElementById('studyModeBtn').onclick = () => {
        studyMode = true;
        document.getElementById('quizPanel').classList.add('hidden');
        stopQuiz();
    };
    document.getElementById('quizModeBtn').onclick = startQuiz;

    // Subir modelo
    document.getElementById('modelUpload').addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
            const loader = new THREE.GLTFLoader();
            const url = URL.createObjectURL(file);
            loader.load(url, gltf => {
                scene.clear();
                scene.add(gltf.scene);
            });
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / (window.innerHeight * 0.8);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function startQuiz() {
    studyMode = false;
    score = 0;
    timerValue = 15;
    document.getElementById('quizPanel').classList.remove('hidden');
    newQuestion();
    timerInterval = setInterval(() => {
        timerValue--;
        document.getElementById('timer').innerText = "Tiempo: " + timerValue;
        if (timerValue <= 0) {
            stopQuiz();
        }
    }, 1000);
}

function stopQuiz() {
    clearInterval(timerInterval);
    document.getElementById('quizQuestion').innerText = "Fin del quiz";
}

function newQuestion() {
    const meshes = scene.children.filter(obj => obj.isMesh);
    targetRegion = meshes[Math.floor(Math.random() * meshes.length)];
    document.getElementById('quizQuestion').innerText = "Haz clic en: " + targetRegion.userData.name;
    renderer.domElement.onclick = (e) => {
        const mouse = new THREE.Vector2(
            (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
            -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            if (intersects[0].object === targetRegion) {
                score++;
                document.getElementById('score').innerText = "Puntos: " + score;
                newQuestion();
            } else {
                stopQuiz();
            }
        }
    };
}
