import * as THREE from 'three';

export class SpaceBackground {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'space-background';
        document.body.insertBefore(this.container, document.body.firstChild);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;

        // Create starfield
        this.createStars();
        this.createDistantStars();

        // Animation
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);

        window.addEventListener('resize', this.handleResize);
        this.animate();
    }

    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1500;

        const positions = new Float32Array(starCount * 3);
        const velocities = new Float32Array(starCount);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;

            // Random position in a box around camera
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;

            // Random velocity for depth movement
            velocities[i] = Math.random() * 0.5 + 0.1;

            // Random size
            sizes[i] = Math.random() * 2 + 0.5;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.starVelocities = velocities;
        this.scene.add(this.stars);
    }

    createDistantStars() {
        const distantGeometry = new THREE.BufferGeometry();
        const distantCount = 800;

        const positions = new Float32Array(distantCount * 3);
        const colors = new Float32Array(distantCount * 3);

        for (let i = 0; i < distantCount; i++) {
            const i3 = i * 3;

            // Spread out more
            const radius = 80 + Math.random() * 40;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Slight color variation for distant stars
            const colorVariation = 0.7 + Math.random() * 0.3;
            colors[i3] = colorVariation;
            colors[i3 + 1] = colorVariation;
            colors[i3 + 2] = 1;
        }

        distantGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        distantGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const distantMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        this.distantStars = new THREE.Points(distantGeometry, distantMaterial);
        this.scene.add(this.distantStars);
    }

    animate() {
        requestAnimationFrame(this.animate);

        // Move stars toward camera
        const positions = this.stars.geometry.attributes.position.array;

        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;

            // Move star toward camera
            positions[i3 + 2] += this.starVelocities[i];

            // Reset star position if it passes camera
            if (positions[i3 + 2] > 5) {
                positions[i3 + 2] = -50;
                positions[i3] = (Math.random() - 0.5) * 100;
                positions[i3 + 1] = (Math.random() - 0.5) * 100;
            }
        }

        this.stars.geometry.attributes.position.needsUpdate = true;

        // Rotate distant stars slowly
        this.distantStars.rotation.y += 0.0001;
        this.distantStars.rotation.x += 0.00005;

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
        this.renderer.dispose();
        this.container.remove();
    }
}