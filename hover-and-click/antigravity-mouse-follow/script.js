/**
 * Antigravity.js - A modular particle interaction library
 * High-performance, customizable, and easy to drop into any project.
 */

window.Antigravity = (function () {

    class AntigravityEffect {
        /**
         * @param {Object} options 
         * @param {HTMLElement} options.container - The DOM element to attach the canvas to.
         * @param {number} [options.particleCount=30000] - Total number of particles.
         * @param {number} [options.influenceRatio=0.8] - Percentage of particles affected by mouse (0-1).
         * @param {string[]} [options.colors] - Array of hex colors for the particles.
         * @param {number} [options.range=2.5] - Influence radius of the mouse.
         * @param {number} [options.size=0.02] - Particle size.
         */
        constructor(options = {}) {
            this.container = options.container || document.body;
            this.particleCount = options.particleCount || 30000;
            this.influenceRatio = options.influenceRatio !== undefined ? options.influenceRatio : 0.8;
            this.range = options.range || 2.5;
            this.size = options.size || 0.025;
            this.colors = options.colors || ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];

            // Core Three.js components
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.z = 6;

            try {
                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            } catch (e) {
                console.error("Antigravity: WebGL not supported.");
                return;
            }

            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.container.appendChild(this.renderer.domElement);

            // Interaction state
            this.mouse = new THREE.Vector2(-100, -100);
            this.targetMouse = new THREE.Vector2(-100, -100);
            this.raycaster = new THREE.Raycaster();
            this.trackingPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(30, 30),
                new THREE.MeshBasicMaterial({ visible: false })
            );
            this.scene.add(this.trackingPlane);

            this.init();
            this.addListeners();
            this.animate();
        }

        /**
         * Generate a smooth circular texture for particles
         */
        createCircleTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);

            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        }

        init() {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.particleCount * 3);
            const originalPositions = new Float32Array(this.particleCount * 3);
            const velocities = new Float32Array(this.particleCount * 3);
            const colors = new Float32Array(this.particleCount * 3);
            const influence = new Float32Array(this.particleCount); // 1 = affected, 0 = static

            const colorObjects = this.colors.map(c => new THREE.Color(c));

            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;

                // WIDER DISTRIBUTION: Use a mix of sphere and box for edge coverage
                let x, y, z;
                if (Math.random() > 0.3) {
                    // Wide box for screen coverage
                    x = (Math.random() - 0.5) * 15;
                    y = (Math.random() - 0.5) * 10;
                    z = (Math.random() - 0.5) * 4;
                } else {
                    // Dense center sphere
                    const r = Math.random() * 5;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    x = r * Math.sin(phi) * Math.cos(theta);
                    y = r * Math.sin(phi) * Math.sin(theta);
                    z = r * Math.cos(phi);
                }

                positions[i3] = x;
                positions[i3 + 1] = y;
                positions[i3 + 2] = z;

                originalPositions[i3] = x;
                originalPositions[i3 + 1] = y;
                originalPositions[i3 + 2] = z;

                // Velocity init
                velocities[i3] = 0;
                velocities[i3 + 1] = 0;
                velocities[i3 + 2] = 0;

                // Color assignment
                const color = colorObjects[Math.floor(Math.random() * colorObjects.length)];
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;

                // Influence: not all particles react
                influence[i] = Math.random() < this.influenceRatio ? 1 : 0;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            this.originalPositions = originalPositions;
            this.velocities = velocities;
            this.influence = influence;

            const material = new THREE.PointsMaterial({
                size: this.size,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                map: this.createCircleTexture(), // Circle texture
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            this.points = new THREE.Points(geometry, material);
            this.scene.add(this.points);
        }

        addListeners() {
            const updateMouse = (x, y) => {
                this.targetMouse.x = (x / window.innerWidth) * 2 - 1;
                this.targetMouse.y = -(y / window.innerHeight) * 2 + 1;
            };

            window.addEventListener('mousemove', (e) => updateMouse(e.clientX, e.clientY));
            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
            }, { passive: true });

            window.addEventListener('resize', () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }

        animate() {
            requestAnimationFrame(() => this.animate());

            // Simple LERP for mouse
            this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.1;
            this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.trackingPlane);

            const positions = this.points.geometry.attributes.position.array;
            const original = this.originalPositions;
            const vels = this.velocities;
            const influence = this.influence;
            const rangeSq = this.range * this.range;

            let mX = -100, mY = -100, mZ = -100;
            if (intersects.length > 0) {
                mX = intersects[0].point.x;
                mY = intersects[0].point.y;
                mZ = intersects[0].point.z;
            }

            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                const i31 = i3 + 1;
                const i32 = i3 + 2;

                const x = positions[i3];
                const y = positions[i31];
                const z = positions[i32];

                // Only apply interaction if particle is "influenced"
                if (influence[i] === 1) {
                    const dx = x - mX;
                    const dy = y - mY;
                    const dz = z - mZ;
                    const distSq = dx * dx + dy * dy + dz * dz;

                    if (distSq < rangeSq) {
                        const dist = Math.sqrt(distSq);
                        const force = (this.range - dist) / this.range;
                        vels[i3] += dx * force * 0.04;
                        vels[i31] += dy * force * 0.04;
                        vels[i32] += dz * force * 0.04;
                    }
                }

                // Attraction force back to origin
                vels[i3] += (original[i3] - x) * 0.012;
                vels[i31] += (original[i31] - y) * 0.012;
                vels[i32] += (original[i32] - z) * 0.012;

                // Friction
                vels[i3] *= 0.88;
                vels[i31] *= 0.88;
                vels[i32] *= 0.88;

                positions[i3] += vels[i3];
                positions[i31] += vels[i31];
                positions[i32] += vels[i32];
            }

            this.points.geometry.attributes.position.needsUpdate = true;
            this.points.rotation.y += 0.0003; // Subtle global drift

            this.renderer.render(this.scene, this.camera);
        }
    }

    return AntigravityEffect;

})();
