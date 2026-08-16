import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-three-background',
  standalone: true,
  imports: [CommonModule],
  template: `<div #canvasContainer class="three-container"></div>`,
  styles: [`
    .three-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      overflow: hidden;
      pointer-events: none; /* Let clicks pass through */
      opacity: 0.15; /* subtle background effect */
    }
  `]
})
export class ThreeBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationId!: number;
  private objects: THREE.Group[] = [];

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.initThreeJs();
    }
  }

  ngOnDestroy(): void {
    if (this.animationId && typeof window !== 'undefined') {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.clear();
    }
  }

  private initThreeJs(): void {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup
    this.scene = new THREE.Scene();

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 40;
    this.camera.position.y = 10;
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);
    
    // Add point light for vibrant color accents (purple/blue to match theme)
    const pointLight = new THREE.PointLight(0x8a2be2, 2, 50);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);

    // Create objects
    this.createSupplyChainObjects();

    // Resize listener
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Animation loop
    this.animate();
  }

  private createSupplyChainObjects(): void {
    const boxMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4f46e5, // Indigo matching the theme
      roughness: 0.3,
      metalness: 0.2
    });
    
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan
      roughness: 0.2,
      metalness: 0.5
    });

    // Create floating boxes
    for (let i = 0; i < 20; i++) {
      const size = Math.random() * 2 + 1;
      const geometry = new THREE.BoxGeometry(size, size, size);
      
      // Wireframe overlay for a "tech" look
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
      
      const mesh = new THREE.Mesh(geometry, Math.random() > 0.8 ? highlightMaterial : boxMaterial);
      
      const group = new THREE.Group();
      group.add(mesh);
      group.add(line);

      // Random position
      group.position.x = (Math.random() - 0.5) * 80;
      group.position.y = (Math.random() - 0.5) * 40;
      group.position.z = (Math.random() - 0.5) * 40 - 10;

      // Random rotation
      group.rotation.x = Math.random() * Math.PI;
      group.rotation.y = Math.random() * Math.PI;

      // Custom data for animation
      group.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        initialY: group.position.y,
        timeOffset: Math.random() * Math.PI * 2
      };

      this.objects.push(group);
      this.scene.add(group);
    }
    
    // Create simple abstract trucks
    this.createAbstractTrucks(boxMaterial, highlightMaterial);
  }
  
  private createAbstractTrucks(mainMat: THREE.Material, highlightMat: THREE.Material) {
    for (let i = 0; i < 6; i++) {
        const truckGroup = new THREE.Group();
        
        // Cab
        const cabGeo = new THREE.BoxGeometry(2, 2.5, 2);
        const cab = new THREE.Mesh(cabGeo, highlightMat);
        cab.position.set(2, 0, 0);
        truckGroup.add(cab);
        
        // Trailer
        const trailerGeo = new THREE.BoxGeometry(5, 3, 2.5);
        const trailer = new THREE.Mesh(trailerGeo, mainMat);
        trailer.position.set(-1.5, 0.25, 0);
        truckGroup.add(trailer);
        
        // Abstract Wheels (cylinders)
        const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16);
        wheelGeo.rotateX(Math.PI / 2);
        const wheelMat = new THREE.MeshStandardMaterial({color: 0x111111});
        
        const w1 = new THREE.Mesh(wheelGeo, wheelMat);
        w1.position.set(2, -1.25, 1.25);
        truckGroup.add(w1);
        
        const w2 = new THREE.Mesh(wheelGeo, wheelMat);
        w2.position.set(2, -1.25, -1.25);
        truckGroup.add(w2);
        
        const w3 = new THREE.Mesh(wheelGeo, wheelMat);
        w3.position.set(-3, -1.25, 1.25);
        truckGroup.add(w3);
        
        const w4 = new THREE.Mesh(wheelGeo, wheelMat);
        w4.position.set(-3, -1.25, -1.25);
        truckGroup.add(w4);
        
        // Position truck
        truckGroup.position.x = (Math.random() - 0.5) * 80;
        truckGroup.position.y = (Math.random() - 0.5) * 40 - 10;
        truckGroup.position.z = (Math.random() - 0.5) * 20 - 5;
        
        // Add movement data
        truckGroup.userData = {
            isTruck: true,
            speed: (Math.random() * 0.05) + 0.02,
            direction: Math.random() > 0.5 ? 1 : -1,
            bounds: 50
        };
        
        if (truckGroup.userData['direction'] === -1) {
            truckGroup.rotation.y = Math.PI;
        }
        
        this.objects.push(truckGroup);
        this.scene.add(truckGroup);
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    const time = Date.now() * 0.001;

    this.objects.forEach(obj => {
      if (obj.userData['isTruck']) {
         obj.position.x += obj.userData['speed'] * obj.userData['direction'];
         if (obj.position.x > obj.userData['bounds']) {
             obj.position.x = -obj.userData['bounds'];
         } else if (obj.position.x < -obj.userData['bounds']) {
             obj.position.x = obj.userData['bounds'];
         }
      } else {
          // Floating boxes
          obj.rotation.x += obj.userData['rotationSpeed'].x;
          obj.rotation.y += obj.userData['rotationSpeed'].y;
          obj.rotation.z += obj.userData['rotationSpeed'].z;
          
          obj.position.y = obj.userData['initialY'] + Math.sin(time * obj.userData['floatSpeed'] * 50 + obj.userData['timeOffset']) * 3;
      }
    });

    // Slow camera pan
    this.camera.position.x = Math.sin(time * 0.05) * 10;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    if (!this.canvasContainer || !this.camera || !this.renderer) return;
    
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
