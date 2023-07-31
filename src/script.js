import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import waterVertexShader from "./shaders/water/vertex.glsl"
import waterFragmentShader from "./shaders/water/fragment.glsl"


THREE.ColorManagement.enabled = false

/**
 * Base
 */
//Loader
const textureLoader = new THREE.TextureLoader()

// Debug
const gui = new dat.GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Base environment map
const environmentMap = textureLoader.load('/environmentMap/realistic_sky_above_sea.jpg')
environmentMap.mapping = THREE.EquirectangularReflectionMapping
environmentMap.colorSpace = THREE.SRGBColorSpace

scene.background = environmentMap

// Fog
const fog = new THREE.Fog("#9797de", 1, 2)
scene.fog = fog

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(100, 100, 2048, 2048)
//const waterGeometry = new THREE.SphereGeometry(20,120,120)


// Color
debugObject.depthColor = "#043971"
debugObject.surfaceColor = "#4dc9ff"

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms:
    {
        uTime: { value: 0 },

        uBigWavesElevation: { value: 0.07 },
        uBigWavesFrequency: { value: new THREE.Vector2(3, 1.5) },
        uBigWavesSpeed: { value: 1.5 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor)},
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor)},
        uColorOffset: { value: 0.1 },
        uColorMultiplier: { value: 3 },

        uElevationMultiplier: { value: 3 },
        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesSpeed: { value: 0.4 }

    }
})



//Debug
gui.add(waterMaterial.uniforms.uBigWavesElevation, "value").min(0).max(1).step(0.01).name("uBigWavesElevation")
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, "x").min(0).max(10).step(0.01).name("uBigWavesFrequencyX")
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, "y").min(0).max(10).step(0.01).name("uBigWavesFrequencyY")
gui.add(waterMaterial.uniforms.uBigWavesSpeed, "value").min(0).max(5).step(0.01).name("uBigWavesSpeed")

gui.addColor(debugObject, "depthColor").onChange(() => {waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)})
gui.addColor(debugObject, "surfaceColor").onChange(() => {waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)})

gui.add(waterMaterial.uniforms.uColorOffset, "value").min(0).max(1).step(0.01).name("uColorOffset")
gui.add(waterMaterial.uniforms.uColorMultiplier, "value").min(0).max(10).step(0.01).name("uColorMultiplier")

gui.add(waterMaterial.uniforms.uElevationMultiplier, "value").min(0).max(20).step(0.1).name("uElevationMultiplier")
gui.add(waterMaterial.uniforms.uSmallWavesElevation, "value").min(0).max(10).step(0.1).name("uSmallWavesElevation")
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, "value").min(0).max(2).step(0.1).name("uSmallWavesSpeed")

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 50)
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.minPolarAngle = 0
controls.maxPolarAngle = Math.PI / 2.1
controls.maxDistance = 10

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Water update
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()