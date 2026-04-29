import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth, H = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.setClearColor(0x07080f);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0b14, 0.045);

    const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 80);
    camera.position.set(0, 4.5, 11);
    camera.lookAt(0, 1.5, 0);

    // Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x1a1c24, roughness: 0.95, metalness: 0.05 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

    // Wet road
    const road = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 40),
      new THREE.MeshStandardMaterial({ color: 0x1e2030, roughness: 0.3, metalness: 0.6 }));
    road.rotation.x = -Math.PI / 2; road.position.y = 0.01; road.receiveShadow = true; scene.add(road);

    // Sidewalks
    const swMat = new THREE.MeshStandardMaterial({ color: 0x2a2c38, roughness: 0.9 });
    [-4.5, 4.5].forEach(x => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 40), swMat);
      sw.position.set(x, 0.06, 0); sw.receiveShadow = true; scene.add(sw);
    });

    // Road markings
    const markMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.8 });
    for (let i = -8; i <= 8; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.8), markMat);
      m.rotation.x = -Math.PI / 2; m.position.set(0, 0.02, i * 3); scene.add(m);
    }
    [-2.6, 2.6].forEach(x => {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 40),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }));
      l.rotation.x = -Math.PI / 2; l.position.set(x, 0.02, 0); scene.add(l);
    });

    // Buildings
    function building(x: number, z: number, w: number, d: number, h: number, col: number) {
      const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.85, metalness: 0.1 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      b.position.set(x, h / 2, z); b.castShadow = true; b.receiveShadow = true; scene.add(b);
      const cols = Math.floor(w / 1.1), rows = Math.floor(h / 1.4);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const lit = Math.random() > 0.35;
        const wm = new THREE.MeshStandardMaterial({
          color: lit ? 0xffe8a0 : 0x1a2240,
          emissive: lit ? 0xffcc44 : 0x000000,
          emissiveIntensity: lit ? 0.6 : 0,
          roughness: 0.1, metalness: 0.5
        });
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.55), wm);
        win.position.set(x - w / 2 + 0.6 + c * 1.05, 0.9 + r * 1.35, z + d / 2 + 0.01);
        scene.add(win);
      }
    }
    building(-7, -2, 4.5, 3, 10, 0x1e2035);
    building(-7.5, 3, 3.5, 3, 14, 0x181a2a);
    building(-8, -6, 3, 2.5, 8, 0x222438);
    building(7, -1, 4, 3, 12, 0x1c1e30);
    building(7.5, 4, 3.5, 3, 9, 0x202234);
    building(7, -6, 3, 2.5, 11, 0x191b2c);

    // Street lights
    function streetLight(x: number, z: number) {
      const pm = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.6, metalness: 0.8 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5.5, 8), pm);
      pole.position.set(x, 2.75, z); pole.castShadow = true; scene.add(pole);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), pm);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(x + (x > 0 ? -0.6 : 0.6), 5.5, z); scene.add(arm);
      const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.15, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.5, metalness: 0.9 }));
      hood.position.set(x + (x > 0 ? -1.2 : 1.2), 5.45, z); scene.add(hood);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xfff0aa, emissive: 0xffdd66, emissiveIntensity: 2, roughness: 0.1 }));
      bulb.position.set(x + (x > 0 ? -1.2 : 1.2), 5.35, z); scene.add(bulb);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.8, 5.2, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffe566, transparent: true, opacity: 0.04, side: THREE.DoubleSide }));
      cone.position.set(x + (x > 0 ? -1.2 : 1.2), 2.8, z); scene.add(cone);
      const pl = new THREE.PointLight(0xffdd88, 1.2, 9, 2);
      pl.position.set(x + (x > 0 ? -1.2 : 1.2), 5.2, z); pl.castShadow = true; scene.add(pl);
    }
    streetLight(3.2, -3); streetLight(-3.2, 0); streetLight(3.2, 3);
    streetLight(-3.2, -6); streetLight(3.2, 6);

    // Lighting
    scene.add(new THREE.AmbientLight(0x101828, 2.5));
    const moon = new THREE.DirectionalLight(0x4466aa, 0.4);
    moon.position.set(-8, 15, 5); moon.castShadow = true; scene.add(moon);

    // Girl character
    const girl = new THREE.Group();
    const jacketCol = 0x1a3a99, pantCol = 0x111828, shoeCol = 0x0a0a0a;
    const skinCol = 0xf5c9a0, hairCol = 0x0d0400, glovCol = 0x112266;

    [-0.1, 0.1].forEach((ox, i) => {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.26),
        new THREE.MeshStandardMaterial({ color: shoeCol, roughness: 0.8, metalness: 0.1 }));
      shoe.position.set(ox, 0.045, i === 0 ? 0.05 : -0.02); girl.add(shoe);
    });
    const legMat = new THREE.MeshStandardMaterial({ color: pantCol, roughness: 0.85 });
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.58, 10), legMat);
    leg1.position.set(-0.1, 0.37, 0); girl.add(leg1);
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.58, 10), legMat);
    leg2.position.set(0.1, 0.37, 0); girl.add(leg2);
    const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.22, 10),
      new THREE.MeshStandardMaterial({ color: pantCol, roughness: 0.85 }));
    hips.position.y = 0.72; girl.add(hips);
    const jacketMat = new THREE.MeshStandardMaterial({ color: jacketCol, roughness: 0.8, metalness: 0.05 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.27), jacketMat);
    torso.position.y = 1.03; girl.add(torso);
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x0f2266, roughness: 0.7 }));
    collar.position.y = 1.35; girl.add(collar);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x091444, roughness: 0.9 }));
    pack.position.set(0, 1.02, -0.2); girl.add(pack);
    [-0.3, 0.3].forEach((ox, i) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.58, 10), jacketMat);
      arm.position.set(ox, 0.9, 0); arm.rotation.z = (i === 0 ? 1 : -1) * 0.2; girl.add(arm);
      const glove = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 8),
        new THREE.MeshStandardMaterial({ color: glovCol, roughness: 0.7 }));
      glove.position.set(ox * 1.04, 0.64, 0); girl.add(glove);
    });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: skinCol, roughness: 0.7 }));
    neck.position.y = 1.41; girl.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 16),
      new THREE.MeshStandardMaterial({ color: skinCol, roughness: 0.65 }));
    head.scale.set(1, 1.06, 0.94); head.position.y = 1.63; girl.add(head);
    const hairMat = new THREE.MeshStandardMaterial({ color: hairCol, roughness: 0.95 });
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.225, 14, 14), hairMat);
    hairTop.position.y = 1.72; hairTop.scale.set(1.04, 0.78, 1.04); girl.add(hairTop);
    [-0.21, 0.21].forEach(hx => {
      const hs = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.22), hairMat);
      hs.position.set(hx, 1.6, 0); girl.add(hs);
    });
    const hairBack = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.07, 0.5, 8), hairMat);
    hairBack.position.set(0, 1.47, -0.16); hairBack.rotation.x = 0.28; girl.add(hairBack);
    const eyeM = new THREE.MeshBasicMaterial({ color: 0x0a0500 });
    [-0.075, 0.075].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 6), eyeM);
      eye.position.set(ex, 1.65, 0.18); girl.add(eye);
    });
    const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f2266, roughness: 0.95 }));
    beanie.position.y = 1.78; beanie.scale.set(1.02, 0.65, 1.02); girl.add(beanie);
    girl.position.set(-0.5, 0, 1); girl.castShadow = true; scene.add(girl);

    // Shield
    const shieldRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.03, 10, 60),
      new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.75 }));
    shieldRing.rotation.x = Math.PI / 2; shieldRing.position.set(-0.5, 0.05, 1); scene.add(shieldRing);
    const shieldRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.015, 8, 60),
      new THREE.MeshBasicMaterial({ color: 0x88ffcc, transparent: true, opacity: 0.4 }));
    shieldRing2.rotation.x = Math.PI / 2; shieldRing2.position.set(-0.5, 1.2, 1); scene.add(shieldRing2);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(1.1, 32),
      new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.07 }));
    glow.rotation.x = -Math.PI / 2; glow.position.set(-0.5, 0.015, 1); scene.add(glow);

    // SOS particles
    const sosParts: THREE.Mesh[] = [];
    for (let i = 0; i < 18; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0.85 }));
      p.position.set(-0.5 + (Math.random() - 0.5) * 2, 2.2 + Math.random() * 2, 1 + (Math.random() - 0.5) * 1.5);
      p.userData = { spd: 0.008 + Math.random() * 0.015, off: Math.random() * Math.PI * 2 };
      scene.add(p); sosParts.push(p);
    }

    // Route line
    const rpts = [];
    for (let i = -10; i <= 10; i++) rpts.push(new THREE.Vector3(-0.5, 0.03, i * 1.5));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rpts),
      new THREE.LineBasicMaterial({ color: 0x00ff66 })));

    // Rain
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(2400);
    for (let i = 0; i < 2400; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 30;
      rainPos[i + 1] = Math.random() * 18;
      rainPos[i + 2] = (Math.random() - 0.5) * 20;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.Points(rainGeo,
      new THREE.PointsMaterial({ color: 0x8899cc, size: 0.04, transparent: true, opacity: 0.35 }));
    scene.add(rain);

    let t = 0;
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      t += 0.014;
      girl.position.z = Math.sin(t * 0.35) * 2.5;
      girl.rotation.y = Math.sin(t * 0.12) * 0.12;
      leg1.position.y = 0.37 + Math.sin(t * 3) * 0.09;
      leg2.position.y = 0.37 - Math.sin(t * 3) * 0.09;
      shieldRing.position.z = girl.position.z;
      shieldRing2.position.z = girl.position.z;
      glow.position.z = girl.position.z;
      const sp = 1 + Math.sin(t * 2.2) * 0.07;
      shieldRing.scale.set(sp, sp, sp);
      shieldRing.material.opacity = 0.5 + Math.sin(t * 2.2) * 0.25;
      shieldRing2.material.opacity = 0.2 + Math.sin(t * 2.2 + 1) * 0.2;
      sosParts.forEach(p => {
        p.position.y += p.userData.spd;
        p.position.x += Math.sin(t * 1.5 + p.userData.off) * 0.006;
        if (p.position.y > 5.5) { p.position.y = 2.0; p.position.z = girl.position.z + (Math.random() - 0.5) * 1.5; }
        p.material.opacity = 0.3 + Math.sin(t * 3 + p.userData.off) * 0.5;
      });
      const rp = rain.geometry.attributes.position;
      for (let i = 1; i < rp.count * 3; i += 3) { rp.array[i] -= 0.12; if (rp.array[i] < -1) rp.array[i] = 17; }
      rp.needsUpdate = true;
      camera.position.x = Math.sin(t * 0.12) * 2.5;
      camera.position.y = 4.5 + Math.sin(t * 0.08) * 0.3;
      camera.position.z = 11 + Math.sin(t * 0.09) * 1.5;
      camera.lookAt(0, 1.8, girl.position.z * 0.25);
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      const W2 = mount.clientWidth, H2 = mount.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
}
