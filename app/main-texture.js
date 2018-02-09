/**
 * Created by lee on 2018/1/22.
 */
//const matrixUtil = require('./util/gl-matrix');
import {
    mat4
} from "./util/gl-matrix"

//
// Start here
//
var rotationX = 0.0;
var rotationY = 0.0;
const canvas = document.querySelector('#glcanvas');
const gl = canvas.getContext('webgl');

var start = {x:0,y:0};
var leftDown = false;
var rotationStart = {X:0,Y:0};
function onMouseDown(e){
    start.x=e.clientX;
    start.y=e.clientY;
    leftDown = true;
}
function onMouseUp(e){
    if(leftDown){
        var dx = e.clientX - start.x;
        var dy = e.clientY - start.y;
        rotationStart.X = rotationStart.X + dy/100;
        rotationStart.Y = rotationStart.Y - dx/100;
        if(rotationStart.X>Math.PI/2){
            rotationStart.X = Math.PI/2
        }
        if(rotationStart.X<-Math.PI/2){
            rotationStart.X = -Math.PI/2
        }
    }
    leftDown = false;
}
function onMouseMove(e){
    if(leftDown){
        var dx = e.clientX - start.x;
        var dy = e.clientY - start.y;
        rotationX = rotationStart.X + dy/100;
        rotationY = rotationStart.Y - dx/100;
        if(rotationX>Math.PI/2){
            rotationX = Math.PI/2
        }
        if(rotationX<-Math.PI/2){
            rotationX = -Math.PI/2
        }
    }
}

function bindEvent(){
    canvas.addEventListener("mousedown",onMouseDown,false);
    canvas.addEventListener("mouseup",onMouseUp,false);
    canvas.addEventListener("mousemove",onMouseMove,false);
}

function main() {


    // If we don't have a GL context, give up now

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Vertex shader program

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying highp vec2 vTextureCoord;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

    // Fragment shader program

    const fsSource = `
    varying highp vec2 vTextureCoord;
    uniform sampler2D uSampler;
    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aTextureCoord and also
    // look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl);

    const texture_f = loadTexture(gl, 'img/pano/mobile_f.jpg');
    const texture_b = loadTexture(gl, 'img/pano/mobile_b.jpg');
    const texture_l = loadTexture(gl, 'img/pano/mobile_r.jpg');
    const texture_r = loadTexture(gl, 'img/pano/mobile_l.jpg');
    const texture_u = loadTexture(gl, 'img/pano/mobile_u.jpg');
    const texture_d = loadTexture(gl, 'img/pano/mobile_d.jpg');
    const textures = {
        f: texture_f,
        b: texture_b,
        l: texture_l,
        r: texture_r,
        u: texture_u,
        d: texture_d
    };

    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, textures, deltaTime);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

    // Create a buffer for the cube's vertex positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the cube.

    const positions = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face

        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Now set up the texture coordinates for the faces.

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    var textureCoordinatesMax = 0.999;
    var textureCoordinatesMin = 0.001;
    const textureCoordinates = [
        // Front
        textureCoordinatesMax, textureCoordinatesMax,
        textureCoordinatesMin, textureCoordinatesMax,
        textureCoordinatesMin, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMin,


        // Back
        textureCoordinatesMin, textureCoordinatesMax,
        textureCoordinatesMin, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMax,

        // Top
        textureCoordinatesMax, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMax,
        textureCoordinatesMin, textureCoordinatesMax,
        textureCoordinatesMin, textureCoordinatesMin,


        // Bottom
        textureCoordinatesMin, textureCoordinatesMax,
        textureCoordinatesMin, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMax,

        // Right
        textureCoordinatesMin, textureCoordinatesMax,
        textureCoordinatesMin, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMax,

        // Left
        textureCoordinatesMin, textureCoordinatesMax,
        textureCoordinatesMin, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMin,
        textureCoordinatesMax, textureCoordinatesMax,

    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
        gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23,   // left
    ];

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
    };
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn of mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, textures, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 50 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 10000.0;
    const projectionMatrix = mat4.create();


    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // //out, eye, center, up
    //mat4.lookAt(lookMatrix, [0,0,0],[0,-1,1],[0,1,0]);
    // mat4.multiply(projectionMatrix,lookMatrix,projectionMatrix);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const lookMatrix = mat4.create();
    mat4.lookAt(lookMatrix, [0,0,0],[0,0,1],[0,1,0]);

    const modelViewMatrix = mat4.create();
    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [0.0, 0.0, 0.0]);  // amount to translate

    mat4.multiply(modelViewMatrix,lookMatrix,modelViewMatrix);

    mat4.rotate(modelViewMatrix,  // destination matrix
        modelViewMatrix,  // matrix to rotate
        rotationX,     // amount to rotate in radians
        [1, 0, 0]);       // axis to rotate around (Z)
    mat4.rotate(modelViewMatrix,  // destination matrix
        modelViewMatrix,  // matrix to rotate
        rotationY,// amount to rotate in radians
        [0, 1, 0]);       // axis to rotate around (X)

    mat4.scale(modelViewMatrix,modelViewMatrix,[1000,1000,1000]);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    for (var i = 0; i < 6; i++) {
        // Tell WebGL how to pull out the texture coordinates from
        // the texture coordinate buffer into the textureCoord attribute.
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
            gl.vertexAttribPointer(
                programInfo.attribLocations.textureCoord,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.textureCoord);
        }

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // Tell WebGL to use our program when drawing

        gl.useProgram(programInfo.program);

        // Set the shader uniforms

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        // Specify the texture to map onto the faces.

        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        var bytePerVertex = 2;
        switch (i) {
            case 0://f
                gl.bindTexture(gl.TEXTURE_2D, textures.f);
                // Tell the shader we bound the texture to texture unit 0
                gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
            {
                const vertexCount = 6;
                const type = gl.UNSIGNED_SHORT;
                const offset = 6*i*bytePerVertex;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
                break;
            case 1://b
                gl.bindTexture(gl.TEXTURE_2D, textures.b);
                // Tell the shader we bound the texture to texture unit 0
                gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
            {
                const vertexCount = 6;
                const type = gl.UNSIGNED_SHORT;
                const offset = 6*i*bytePerVertex;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
                break;
            case 2://u
                gl.bindTexture(gl.TEXTURE_2D, textures.u);
                // Tell the shader we bound the texture to texture unit 0
                gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
            {
                const vertexCount = 6;
                const type = gl.UNSIGNED_SHORT;
                const offset = 6*i*bytePerVertex;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
                break;
            case 3://d
                gl.bindTexture(gl.TEXTURE_2D, textures.d);
                // Tell the shader we bound the texture to texture unit 0
                gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
            {
                const vertexCount = 6;
                const type = gl.UNSIGNED_SHORT;
                const offset = 6*i*bytePerVertex;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
                break;
            case 4://r
                gl.bindTexture(gl.TEXTURE_2D, textures.r);
                // Tell the shader we bound the texture to texture unit 0
                gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
            {
                const vertexCount = 6;
                const type = gl.UNSIGNED_SHORT;
                const offset = 6*i*bytePerVertex;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
                break;
            case 5://l
                gl.bindTexture(gl.TEXTURE_2D, textures.l);
                // Tell the shader we bound the texture to texture unit 0
                gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
            {
                const vertexCount = 6;
                const type = gl.UNSIGNED_SHORT;
                const offset = 6*i*bytePerVertex;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
                break;
        }


    }


    // Update the rotation for the next draw

    //cubeRotation += deltaTime;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

bindEvent();
main();
