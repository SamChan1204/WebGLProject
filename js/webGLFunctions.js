
var gl;
//初始化上下文
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


var shaderProgram;

//初始化着色器
function initShaders() {
    var fragmentShader = getShader(gl, "per-fragment-lighting-fs"); //片元着色器
    var vertexShader = getShader(gl, "per-fragment-lighting-vs");  //顶点着色器

    //绑定着色程序
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    //模型的顶点坐标
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    //模型的顶点法线
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    //模型的贴图坐标
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    //变换矩阵
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");

    //若干标志值
    shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
    shaderProgram.useAmbientUniform = gl.getUniformLocation(shaderProgram, "uUseAmbient");
    shaderProgram.useParallelUniform = gl.getUniformLocation(shaderProgram, "uUseParallel");
    shaderProgram.usePointUniform = gl.getUniformLocation(shaderProgram, "uUsePoint");

    //光照的各种材质设定
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.parallelLightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uParallelLightingDirection");
    shaderProgram.parallelLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uParallelLightingDiffuseColor");
    shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
}
//获取着色器
function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

var mvMatrix ;
var mvMatrixStack = [];
var pMatrix ;

//将矩阵压栈
function mvPushMatrix() {
    var copy = new okMat4();
    mvMatrix.clone(copy);
    mvMatrixStack.push(copy);
}
//将矩阵出栈
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//将矩阵操作推送到显卡
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix.toArray());
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix.toArray());
    var normalMatrix = mvMatrix.inverse().transpose();
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, normalMatrix.toArray());
}

var pi = 3.1415927;
//根据顶点坐标生成纹理坐标，采用圆柱体映射
function generateVertexTextureCoords(vertexPositions){
    var texcoord = [];
    var x, y, z, theta, s, t;
    var ss = [],  //贴图坐标的s分量数组
        ts = [];  //贴图坐标的t分量数组
    for(var i = 0, len = vertexPositions.length; i < len; i += 3){
        x = vertexPositions[i];
        y = vertexPositions[i + 1];
        z = vertexPositions[i + 2];
        //计算柱坐标的角度
        if(x == 0){
            if(y > 0){
                theta = pi / 2;
            }else if(y < 0){
                theta = -pi / 2;
            }
        }else{
            theta = Math.atan(getRightArc(y/x));
        }
        //计算贴图坐标的s分量和t分量
        s = theta / (2 * pi);
        t = z;
        ss.push(s);
        ts.push(t);
    }
    //归一化s分量和t分量
    ss = nomarlize(ss);
    ts = nomarlize(ts);
    //合并s和t分量
    for(var i = 0, len = ss.length; i < len; i++){
        texcoord.push(ss[i]);
        texcoord.push(ts[i]);
    }
    return texcoord;
}
//限制弧度值
function getRightArc(arc){
    while((arc < -0.5 * pi) || (arc > 0.5 * pi)){
        if(arc < -0.5 * pi){
            arc += pi;
        }else if(arc > 0.5 * pi){
            arc -= pi;
        }
    }
    return arc;
}
//将数组归一化
function nomarlize(array){
    var max = Math.max.apply(null, array);
    var min = Math.min.apply(null, array);
    var range = max - min;
    var result = [];
    for(var i = 0, len = array.length; i < len; i++){
        result[i] = (array[i] - min) / range;
    }
    return result;
}

var modelVertexPositionBuffer;
var modelVertexNormalBuffer;
var modelVertexTextureCoordBuffer;
var modelVertexIndexBuffer;

//根据模型数据设定顶点坐标、贴图坐标、顶点法线和索引
function handleLoadedModel(modelData) {

    //设置顶点坐标
    modelVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexPositions), gl.STATIC_DRAW);
    modelVertexPositionBuffer.itemSize = 3;
    modelVertexPositionBuffer.numItems = modelData.vertexPositions.length / 3;

    //设置顶点法线
    modelVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelData.vertexNormals), gl.STATIC_DRAW);
    modelVertexNormalBuffer.itemSize = 3;
    modelVertexNormalBuffer.numItems = modelData.vertexNormals.length / 3;

    //设置贴图坐标
    var texcoord = generateVertexTextureCoords(modelData.vertexPositions);
    modelVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoord), gl.STATIC_DRAW);
    modelVertexTextureCoordBuffer.itemSize = 2;
    modelVertexTextureCoordBuffer.numItems = texcoord.length / 2;

    //设置索引
    modelVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), gl.STATIC_DRAW);
    modelVertexIndexBuffer.itemSize = 1;
    modelVertexIndexBuffer.numItems = modelData.indices.length;
}

//根据文件名载入模型
function loadModel(modelName) {
    var request = new XMLHttpRequest();
    request.open("GET", modelName);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            handleLoadedModel(JSON.parse(request.responseText));
        }
    }
    request.send();
}

//设置贴图
function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}

var texture1;
var texture2;

//初始化贴图
function initTextures() {
    texture1 = gl.createTexture();
    texture1.image = new Image();
    texture1.image.onload = function () {
        handleLoadedTexture(texture1)
    }
    texture1.image.src = "images/texture1.jpg";

    texture2 = gl.createTexture();
    texture2.image = new Image();
    texture2.image.onload = function () {
        handleLoadedTexture(texture2)
    }
    texture2.image.src = "images/texture2.jpg";
}

var pos = {x: 0, y: 0, z: -2},  //位置
    rot = {x: 0, y: 0, z: 0},  //旋转角度
    sca = {x: 1, y: 1, z: 1},  //缩放大小
    parallelDir = {x: 1, y: 1, z: 1}, //平行光源方向
    pointPos = {x: 3, y: 3, z: 3};  //点光源位置
var isAmbient = false,  //是否有全局光照
    isParallel = false,  //是否有平行光源
    isPoint = false;  //是否有点光源
var textureName = "none";

//画出模型
function drawScene() {

	//设定视角
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    pMatrix = okMat4Proj(45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    if (modelVertexPositionBuffer == null || modelVertexNormalBuffer == null || modelVertexTextureCoordBuffer == null || modelVertexIndexBuffer == null) {
        return;
    }

    //设置全局光照
    gl.uniform1i(shaderProgram.useAmbientUniform, isAmbient);
    gl.uniform3f(shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);

    //设置平行光源
    gl.uniform1i(shaderProgram.useParallelUniform, isParallel);
    gl.uniform3f(shaderProgram.parallelLightingDirectionUniform, parallelDir.x, parallelDir.y, parallelDir.z);
    gl.uniform3f(shaderProgram.parallelLightingDiffuseColorUniform, 0.8, 0.8, 0.8);

    //设置点光源
    gl.uniform1i(shaderProgram.usePointUniform, isPoint);
    gl.uniform3f(shaderProgram.pointLightingLocationUniform, pointPos.x, pointPos.y, pointPos.z);
    gl.uniform3f(shaderProgram.pointLightingDiffuseColorUniform, 0.8, 0.8, 0.8);

    //设置贴图
    gl.uniform1i(shaderProgram.useTexturesUniform, textureName != "none");

    mvMatrix = new okMat4();
    mvPushMatrix();

    //平移
    mvMatrix.translate(OAK.SPACE_WORLD, pos.x, pos.y, pos.z, true);
    //旋转
    mvMatrix.rotX(OAK.SPACE_LOCAL, rot.x, true);
    mvMatrix.rotY(OAK.SPACE_LOCAL, rot.y, true);
    mvMatrix.rotZ(OAK.SPACE_LOCAL, rot.z, true);
    //缩放
    mvMatrix.scale(OAK.SPACE_LOCAL, sca.x, sca.y, sca.z, true);

    //绑定贴图
    gl.activeTexture(gl.TEXTURE0);
    if (textureName == "texture1") {
        gl.bindTexture(gl.TEXTURE_2D, texture1);
    } else if (textureName == "texture2") {
        gl.bindTexture(gl.TEXTURE_2D, texture2);
    }
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    //将数据写入缓存
    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, modelVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, modelVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, modelVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
    setMatrixUniforms();

    //显示模型
    gl.drawElements(gl.TRIANGLES, modelVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

//描绘帧
function tick() {
    okRequestAnimationFrame(tick);
    drawScene();
}

//初始化各种器件
function webGLStart() {
    var canvas = document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initTextures();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}