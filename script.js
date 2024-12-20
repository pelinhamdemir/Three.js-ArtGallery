
// Students: Ahmet Efe Ersoy - Pelin Hamdemir
//ID:25673197932 - 11596296166
//CMPE 360
// Project: 8 



import * as THREE from 'three';
import { OBJLoader } from './node_modules/three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
document.body.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.enablePan = true;

// Load Skybox Texture
const loader = new THREE.CubeTextureLoader();
const skyboxTexture = loader.load([
  'dark/right.png',  // Positive X
  'dark/left.png',   // Negative X
  'dark/top.png',    // Positive Y
  'dark/bottom.png', // Negative Y
  'dark/front.png',  // Positive Z
  'dark/back.png'    // Negative Z
]);
scene.background = skyboxTexture;

// Lights
// Ambient Light
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Bright ambient light
scene.add(ambientLight);

// Spot Light
const spotlight = new THREE.SpotLight(0xffffff, 500); // Increased intensity
spotlight.position.set(0, 20, 0);
spotlight.angle = Math.PI / 6;
spotlight.penumbra = 0.4;
spotlight.decay = 2;
spotlight.distance = 50;
spotlight.castShadow = true;
scene.add(spotlight);

// Ground Plane with Wood Texture
const woodTextureLoader = new THREE.TextureLoader();
const woodTexture = woodTextureLoader.load('tiled-stones.jpg');
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ map: woodTexture }) // Apply wood texture
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true; // Receive shadows
scene.add(plane);
// Custom shaders for ground effect
const vertexShader = `
  varying vec2 vUv;
  uniform float time;

  void main() {
    vUv = uv;

    vec3 pos = position;
    pos.z += sin(pos.x * 5.0 + time) * 0.2;
    pos.z += cos(pos.y * 5.0 + time) * 0.2;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float time;

  void main() {
    vec3 color = vec3(0.5 + 0.5 * sin(vUv.x * 10.0 + time),
                      0.5 + 0.5 * cos(vUv.y * 10.0 + time),
                      0.8);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Ground Plane with ShaderMaterial
const groundGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
const groundMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: { value: 0.0 },
  },
  side: THREE.DoubleSide,
  wireframe: false,
});

const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
groundPlane.rotation.x = -Math.PI / 2;
groundPlane.position.y = -1;
groundPlane.receiveShadow = true; // Receive shadows
scene.add(groundPlane);

// Global array to store spheres
const spheres = [];
// Global reference for the male object
let maleObject = null;

// Load Object from OBJ File
function loadObjectFromOBJ(objPath, materialColor, position, scale) {
  const objLoader = new OBJLoader();
  objLoader.load(
    objPath,
    (loadedObject) => {
      loadedObject.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: materialColor }); // Use MeshStandardMaterial
          child.castShadow = true; // Enable shadow casting
          child.receiveShadow = true; // Enable receiving shadows
          child.geometry.computeVertexNormals();
        }
      });

      loadedObject.scale.set(scale, scale, scale);
      loadedObject.position.set(...position);

      // Store a reference to the male object if this is the male.obj
      if (objPath.includes('male.obj')) {
        maleObject = loadedObject;
      }

      scene.add(loadedObject);
    },
    undefined,
    (error) => {
      console.error(`Error loading ${objPath}:`, error);
    }
  );
}

// Load Cubes, Spheres, and Objects on Top
function loadCubesAndObjects() {
  const cubePositions = [
    [-3.5, 0, 3],
    [-1.5, 0, 3],
    [0.5, 0, 3],
    [2.5, 0, 3],
    [-3.5, 0, 1.5],
    [-1.5, 0, 1.5],
    [0.5, 0, 1.5],
    [2.5, 0, 1.5],
  ];

  const objects = [
    { path: 'models/female.obj', scale: 0.015 },
    { path: 'models/male.obj', scale: 0.009 },
    { path: 'models/spaceship.obj', scale: 0.1 },
    { path: 'models/helicopter.obj', scale: 0.1 },
    null, // Replace this with a picture
    { path: 'models/car.obj', scale: 0.3 },
    { path: 'models/tie.obj', scale: 0.01 },
    { path: 'models/plane.obj', scale: 0.1 },
  ];

  cubePositions.forEach((position, index) => {
    const cubeScale = 0.5; // Adjust scale for cubes
    loadObjectFromOBJ(
      'models/cube.obj',
      0xff0000, // Red color for cubes
      position,
      cubeScale
    );
    
    
    
      function addCornerCones() {
        const conePositions = [
          [-10, 0, -10], // Bottom-left corner
          [10, 0, -10],  // Bottom-right corner
          [-10, 0, 10],  // Top-left corner
          [10, 0, 10],   // Top-right corner
        ];
      
        const coneTexture = new THREE.TextureLoader().load('conetexture.jpg'); // Load the texture
        const objLoader = new OBJLoader();
      
        conePositions.forEach((position) => {
          objLoader.load(
            'models/cone.obj', // Path to the cone.obj file
            (loadedObject) => {
              loadedObject.traverse((child) => {
                if (child.isMesh) {
                  child.material = new THREE.MeshStandardMaterial({
                    map: coneTexture, // Apply the texture
                  });
                  child.castShadow = true; // Enable shadow casting
                  child.receiveShadow = true; // Enable receiving shadows
                }
              });
      
              loadedObject.scale.set(1, 1, 1); // Adjust scale if needed
              loadedObject.position.set(position[0], 0, position[2]); // Place on the ground
              scene.add(loadedObject);
            },
            undefined,
            (error) => {
              console.error(`Error loading cone.obj:`, error);
            }
          );
        });
      }
      
    
    // Add the corner cones
    addCornerCones();

    const obj = objects[index];
    if (obj) {
      const { path, scale } = obj;
      const objectHeight = position[1] + cubeScale * 1 + scale * 0.5; // Adjust height
      const objectPosition = [position[0], objectHeight, position[2]];

      loadObjectFromOBJ(path, 0x808080, objectPosition, scale);
    } else {
      const pictureTexture = new THREE.TextureLoader().load('picture.jpg');
      const pictureMaterial = new THREE.MeshBasicMaterial({ 
      map: pictureTexture,
      side: THREE.DoubleSide // Render on both sides
});
     const picture = new THREE.Mesh(
     new THREE.PlaneGeometry(0.8, 0.8),
     pictureMaterial
);
picture.position.set(position[0], position[1] + cubeScale * 1.5, position[2]);
picture.rotation.y = Math.PI / 4; // Rotate slightly for better view
scene.add(picture);
    }
  });

  // Add Spheres
  const spherePositions = [
    [0, 3, 0],
    [2, 4, -2],
    [3, 6, -3],
    [-3, 3, 2],
  ];

  const planetTextures = [
    'earth.jpg',
    'mars.jpg',
    'venus.jpg',
    'saturn.jpg',
  ];

  spherePositions.forEach((position, index) => {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(planetTextures[index % planetTextures.length]);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      material
    );
    sphere.position.set(...position);
    scene.add(sphere);
    spheres.push(sphere); // Add spheres to global array
  });
}

// Load cubes, spheres, and objects
loadCubesAndObjects();

// Camera Setup
camera.position.set(0, 5, 15);

// Movement Variables
const moveSpeed = 0.2;
const moveDirection = { forward: 0, right: 0 };

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
      moveDirection.forward = 1;
      break;
    case 's':
      moveDirection.forward = -1;
      break;
    case 'd':
      moveDirection.right = -1;
      break;
    case 'a':
      moveDirection.right = 1;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
    case 's':
      moveDirection.forward = 0;
      break;
    case 'a':
    case 'd':
      moveDirection.right = 0;
      break;
  }
});

let spotlightAngle = 0;
const spotlightRadius = 10;

// Animation Loop
function animate() {
  controls.update(); // Update controls

  // Update time uniform for shaders
  groundMaterial.uniforms.time.value += 0.01;

  // Camera movement
  const forwardVector = new THREE.Vector3();
  camera.getWorldDirection(forwardVector);
  forwardVector.y = 0; // Prevent vertical movement
  forwardVector.normalize();

  const rightVector = new THREE.Vector3();
  rightVector.crossVectors(camera.up, forwardVector).normalize();

  const moveStep = new THREE.Vector3();
  moveStep.addScaledVector(forwardVector, moveDirection.forward * moveSpeed);
  moveStep.addScaledVector(rightVector, moveDirection.right * moveSpeed);
  camera.position.add(moveStep);

  // Rotate spheres
  spheres.forEach((sphere) => {
    sphere.rotation.x += 0.01; // Adjust rotation speed
  });

  // Spotlight movement
  spotlightAngle += 0.01; // Adjust speed of movement
  spotlight.position.x = spotlightRadius * Math.cos(spotlightAngle);
  spotlight.position.z = spotlightRadius * Math.sin(spotlightAngle);

  // Rotate the male object
  if (maleObject) {
    maleObject.rotation.y += 0.02; // Rotate around its own Y-axis
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();