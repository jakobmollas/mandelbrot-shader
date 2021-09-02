import * as Shaders from "./shaders";
import { GameTime } from "./gametime";
import * as PIXI from 'pixi.js';

window.onload = () => {
    new App();
}

class App {
    stage = new PIXI.Container();
    renderer: PIXI.Renderer;
    gameTime = new GameTime();
    stats: HTMLElement;
    uniformsData = new Shaders.Uniforms();

    constructor() {
        this.stats = document.getElementById("stats") as HTMLElement;

        this.renderer = this.createPixiRenderer();
        this.addCanvasToDocument(this.renderer.view);
        this.initializeShaders(this.stage, this.renderer);

        window.addEventListener("resize", this.resize.bind(this), false);

        requestAnimationFrame(this.animate.bind(this));
    }

    createPixiRenderer() {
        return new PIXI.Renderer({
            width: document.body.clientWidth,
            height: document.body.clientHeight,
            autoDensity: true,
            powerPreference: "high-performance",
            backgroundColor: 0x000
        });
    }

    addCanvasToDocument(canvas: HTMLCanvasElement) {
        document.body.appendChild(canvas);
    }

    initializeShaders(stage: PIXI.Container, renderer: PIXI.Renderer) {
        const mandelbrot = Shaders.createMandelbrot(this.uniformsData);
        const bloom = Shaders.createBloomFilter();
        stage.filters = [mandelbrot, bloom];
        stage.filterArea = renderer.screen;
    }

    resize() {
        this.renderer.resize(document.body.clientWidth, document.body.clientHeight);
    }

    animate() {
        this.gameTime.update();
        this.uniformsData.aspectRatio = document.body.clientWidth / document.body.clientHeight;
        this.uniformsData.time += this.gameTime.deltaTime / 1000;
        this.renderer.render(this.stage);

        requestAnimationFrame(this.animate.bind(this));
    }
}