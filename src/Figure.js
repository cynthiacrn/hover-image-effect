import * as THREE from 'three'
import gsap from 'gsap'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

export default class Figure {
  constructor(scene) {
    this.$image = document.querySelector('.tile__image')
    this.$image2 = document.querySelector('.tile__image_2')
    this.scene = scene

    this.loader = new THREE.TextureLoader()

    this.image = this.loader.load(this.$image.src)
    this.hoverImage = this.loader.load(this.$image2.src)
    this.sizes = new THREE.Vector2(0, 0)
    this.offset = new THREE.Vector2(0, 0)

    this.mouse = new THREE.Vector2(0, 0)
    window.addEventListener('mousemove', (ev) => { this.onMouseMove(ev) })

    this.getSizes()

    this.createMesh()

    this.clock = new THREE.Clock()

    this.tick()
  }

  getSizes() {
    const { width, height, top, left } = this.$image.getBoundingClientRect()

    this.sizes.set(width, height)
    this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2)
  }

  createMesh() {
    this.uniforms = {
      uImage: { type: 't', value: this.image },
      uImagehover: { type: 't', value: this.hoverImage },
      uMouse: { value: this.mouse },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    }

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      defines: {
        PR: window.devicePixelRatio.toFixed(1)
      }
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.mesh.position.set(this.offset.x, this.offset.y, 0)
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1)

    this.scene.add(this.mesh)
  }

  onMouseMove(event) {
    gsap.to(this.mouse, 0.5, {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1
    })

    gsap.to(this.mesh.rotation, 0.5, {
      x: -this.mouse.y * 0.3,
      y: this.mouse.x * (Math.PI / 6)
    })
  }

  tick() {
    const elapsedTime = this.clock.getElapsedTime()

    // Update materials
    this.uniforms.uTime.value = elapsedTime

    // Call tick again on the next frame
    window.requestAnimationFrame(() => this.tick())
  }
}
