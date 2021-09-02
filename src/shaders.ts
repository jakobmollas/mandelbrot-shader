import * as PIXI from 'pixi.js';
import * as Filters from 'pixi-filters';

export class Uniforms {
    time: number = 0;
    aspectRatio: number = 1;
}

export function createBloomFilter(): PIXI.Filter {
    const filter = new Filters.BloomFilter();
    filter.blur = 10;

    return filter;
}

export function createMandelbrot(uniformsData: any): PIXI.Filter {
    const fragSource = `
            precision mediump float;
            varying vec2 vTextureCoord;
            uniform float time;
            uniform float aspectRatio;

            #define ZOOM_LENGTH 8.0

            float mandelbrot(vec2 p) 
            {
                int iterations = 0;
                int max = 1000;
                vec2 c = vec2(p.x, p.y);
                
                for (int i = 0; i < 1000; i++)
                {
                    p = vec2(p.x*p.x - p.y*p.y, 2.*p.x*p.y) + c;
                    if (length(p) > 2.0)
                        break;

                    iterations++;
                }

                // Normalize to 0. -> 1.
                return iterations == max ? 0.0 : float(iterations) / float(max);
            }

            void main(void) {
                // map uv to [-1, 1]
                vec2 uv = vTextureCoord  * 2.0 - 1.0;
                uv.x *= aspectRatio;
                uv.y *= -1.0;   // match shadertoy coords
                
                // calculate zoom
                float fzoom = 0.65 + 0.38*cos(time/ZOOM_LENGTH);
                float zoom = pow(fzoom, ZOOM_LENGTH) * 1.0;
                
                vec2 center = vec2(-.737472,.18570);
                uv *= zoom;
                uv += center;
                
                float c = mandelbrot(uv);
                
                vec3 color = vec3(c); 
                color.x = c*9.;
                color.y = c*3.;
                //color.z = c*1.;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

    const thresholdFilter = new PIXI.Filter("", fragSource, uniformsData);
    return thresholdFilter;
}