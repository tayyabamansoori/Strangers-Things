import { useEffect, useRef } from 'react'

interface Props {
  mouseX?: number
  mouseY?: number
}

export function MindFlayer3D({ mouseX = 0, mouseY = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = canvasRef.current
    if (!canvas) return

    let THREE: typeof import('three')

    async function init() {
      THREE = await import('three')
      const { Scene, PerspectiveCamera, WebGLRenderer, Color, FogExp2,
        AmbientLight, PointLight, Group, Mesh, SphereGeometry,
        MeshPhongMaterial, CatmullRomCurve3,
        TubeGeometry, Float32BufferAttribute,
        BufferGeometry, Points, PointsMaterial, Vector3 } = THREE

      const scene = new Scene()
      scene.background = new Color(0x010105)
      scene.fog = new FogExp2(0x020108, 0.06)

      const camera = new PerspectiveCamera(60, canvas!.clientWidth / canvas!.clientHeight, 0.1, 100)
      camera.position.set(0, 0, 8)
      camera.lookAt(0, 0, 0)

      const renderer = new WebGLRenderer({ canvas: canvas as HTMLCanvasElement, antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(canvas!.clientWidth, canvas!.clientHeight)
      renderer.shadowMap.enabled = true

      // LIGHTING
      const ambient = new AmbientLight(0x0a0520, 0.5)
      scene.add(ambient)

      const redLight = new PointLight(0xcc1111, 8, 20)
      redLight.position.set(0, 3, 3)
      scene.add(redLight)

      const blueLight = new PointLight(0x1133aa, 4, 15)
      blueLight.position.set(-4, -2, 2)
      scene.add(blueLight)

      const fillLight = new PointLight(0x330011, 2, 25)
      fillLight.position.set(4, 2, -2)
      scene.add(fillLight)

      // CREATURE GROUP
      const creature = new Group()
      scene.add(creature)

      // Body - central mass
      const bodyGeo = new SphereGeometry(1.2, 32, 24)
      const bodyMat = new MeshPhongMaterial({
        color: 0x1a0a2e,
        emissive: 0x0a0518,
        specular: 0x440022,
        shininess: 20,
      })
      // Distort body vertices for organic look
      const bodyPos = bodyGeo.attributes.position
      for (let i = 0; i < bodyPos.count; i++) {
        const x = bodyPos.getX(i)
        const y = bodyPos.getY(i)
        const z = bodyPos.getZ(i)
        const noise = 0.15 * Math.sin(x * 4 + y * 3 + z * 5)
        bodyPos.setXYZ(i, x + noise * x * 0.3, y * 1.6 + noise * 0.2, z + noise * z * 0.3)
      }
      bodyGeo.computeVertexNormals()
      const body = new Mesh(bodyGeo, bodyMat)
      creature.add(body)

      // Head - top dome with petal-like openings
      const headGroup = new Group()
      headGroup.position.set(0, 1.8, 0)
      creature.add(headGroup)

      const headGeo = new SphereGeometry(0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6)
      const headMat = new MeshPhongMaterial({
        color: 0x0d0620,
        emissive: 0x080415,
        specular: 0x220011,
        shininess: 40,
      })
      const head = new Mesh(headGeo, headMat)
      headGroup.add(head)

      // Petals / face openings
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2
        const petalGeo = new SphereGeometry(0.25, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5)
        const petalMat = new MeshPhongMaterial({
          color: 0x200820,
          emissive: 0x110415,
          shininess: 60,
        })
        const petal = new Mesh(petalGeo, petalMat)
        petal.position.set(Math.cos(angle) * 0.4, 0.1 * Math.sin(i), Math.sin(angle) * 0.4)
        petal.lookAt(headGroup.position)
        headGroup.add(petal)
      }

      // EYES - glowing red
      const eyeMat = new MeshPhongMaterial({
        color: 0xff0000,
        emissive: 0xee0000,
        emissiveIntensity: 2,
      })
      const eyeGeo = new SphereGeometry(0.08, 8, 8)

      const eyeL = new Mesh(eyeGeo, eyeMat)
      eyeL.position.set(-0.2, 0.1, 0.6)
      headGroup.add(eyeL)

      const eyeR = new Mesh(eyeGeo, eyeMat)
      eyeR.position.set(0.2, 0.1, 0.6)
      headGroup.add(eyeR)

      // Eye glow points
      const eyeGlow = new PointLight(0xff0000, 3, 4)
      eyeGlow.position.set(0, 0.1, 0.8)
      headGroup.add(eyeGlow)

      // TENTACLES / LEGS
      const tentacleGroup = new Group()
      creature.add(tentacleGroup)

      for (let t = 0; t < 8; t++) {
        const angle = (t / 8) * Math.PI * 2
        const spread = 1.2 + Math.random() * 0.4
        const points: InstanceType<typeof Vector3>[] = []
        const segments = 6

        for (let s = 0; s <= segments; s++) {
          const progress = s / segments
          const x = Math.cos(angle) * (spread * progress * 1.5)
          const y = -1.2 - progress * 2.5 - Math.sin(progress * Math.PI) * 0.5
          const z = Math.sin(angle) * (spread * progress * 1.5)
          const wobble = Math.sin(progress * Math.PI * 3 + t) * 0.3
          points.push(new Vector3(x + wobble * Math.cos(angle + Math.PI / 2), y, z + wobble * Math.sin(angle + Math.PI / 2)))
        }

        const curve = new CatmullRomCurve3(points)
        const tubeGeo = new TubeGeometry(curve, 20, 0.06 - t * 0.003, 8, false)
        const tubeMat = new MeshPhongMaterial({
          color: 0x150820,
          emissive: 0x080415,
          shininess: 30,
        })
        const tube = new Mesh(tubeGeo, tubeMat)
        tentacleGroup.add(tube)
      }

      // Inner tentacles (smaller, upward)
      for (let t = 0; t < 4; t++) {
        const angle = (t / 4) * Math.PI * 2 + Math.PI / 4
        const points: InstanceType<typeof Vector3>[] = []
        for (let s = 0; s <= 5; s++) {
          const progress = s / 5
          points.push(new Vector3(
            Math.cos(angle) * progress * 1.0,
            progress * 2.5,
            Math.sin(angle) * progress * 1.0
          ))
        }
        const curve = new CatmullRomCurve3(points)
        const tubeGeo = new TubeGeometry(curve, 12, 0.04, 6, false)
        const tubeMat = new MeshPhongMaterial({ color: 0x1a0a2e, emissive: 0x050310 })
        const tube = new Mesh(tubeGeo, tubeMat)
        tentacleGroup.add(tube)
      }

      // PARTICLE SYSTEM - fog particles around creature
      const particleCount = 800
      const positions = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount; i++) {
        const r = 2 + Math.random() * 4
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = r * Math.cos(phi) - 1
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      }
      const particleGeo = new BufferGeometry()
      particleGeo.setAttribute('position', new Float32BufferAttribute(positions, 3))
      const particleMat = new PointsMaterial({
        color: 0x440022,
        size: 0.03,
        transparent: true,
        opacity: 0.5,
      })
      particleMat.blending = THREE.AdditiveBlending
      const particles = new Points(particleGeo, particleMat)
      scene.add(particles)

      // Spine / backbone
      const spinePoints: InstanceType<typeof Vector3>[] = []
      for (let i = 0; i <= 10; i++) {
        spinePoints.push(new Vector3(0, -3.5 + i * 0.5, 0))
      }
      const spineCurve = new CatmullRomCurve3(spinePoints)
      const spineGeo = new TubeGeometry(spineCurve, 20, 0.08, 8, false)
      const spineMat = new MeshPhongMaterial({ color: 0x200828, emissive: 0x0a0415 })
      const spine = new Mesh(spineGeo, spineMat)
      creature.add(spine)

      // RESIZE HANDLER
      const handleResize = () => {
        if (!canvas) return
        const w = canvas!.clientWidth
        const h = canvas!.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', handleResize)

      // ANIMATION LOOP
      function animate() {
        frameRef.current = requestAnimationFrame(animate)
        timeRef.current += 0.008

        const t = timeRef.current

        // Breathing effect
        const breathe = Math.sin(t * 0.8) * 0.05
        creature.scale.set(1 + breathe, 1 + breathe * 0.5, 1 + breathe)

        // Slow float
        creature.position.y = Math.sin(t * 0.4) * 0.15

        // React to mouse
        const targetRotY = (mouseX / window.innerWidth - 0.5) * 0.3
        const targetRotX = (mouseY / window.innerHeight - 0.5) * 0.2
        creature.rotation.y += (targetRotY - creature.rotation.y) * 0.03
        creature.rotation.x += (targetRotX - creature.rotation.x) * 0.03

        // Slow base rotation
        creature.rotation.y += 0.003

        // Animate tentacles
        tentacleGroup.children.forEach((child, i) => {
          child.rotation.y = Math.sin(t * 0.6 + i * 0.8) * 0.1
          child.rotation.x = Math.sin(t * 0.4 + i * 1.2) * 0.05
        })

        // Eye glow pulse
        eyeGlow.intensity = 2 + Math.sin(t * 2) * 1.5
        redLight.intensity = 6 + Math.sin(t * 1.3) * 3
        redLight.position.x = Math.sin(t * 0.7) * 2
        redLight.position.y = 2 + Math.sin(t * 0.5) * 1

        // Head subtle movement
        headGroup.rotation.x = Math.sin(t * 0.5) * 0.05
        headGroup.rotation.z = Math.sin(t * 0.7) * 0.03

        // Particle rotation
        particles.rotation.y += 0.001
        particles.rotation.x += 0.0005

        renderer.render(scene, camera)
      }

      animate()

      return () => {
        cancelAnimationFrame(frameRef.current)
        window.removeEventListener('resize', handleResize)
        renderer.dispose()
      }
    }

    const cleanup = init()
    return () => { cleanup.then(fn => fn?.()) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="threejs-canvas"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
