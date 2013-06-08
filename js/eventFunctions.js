//模型载入
function toLoadModel(event){
	var filename = $("#model-name").val();
	var temp = filename.split("\\");
	var name = "model\\" + temp[temp.length - 1];
	loadModel(name);
	cancelTexture();
	cancelRotate();
	cancelTran();
	cancelScale();
}


//贴图
function loadTexture(texName){
	textureName = texName;
}
function cancelTexture(){
	textureName = "none";
}


//光照
function turnLight(type, state){
	if(type == "ambient"){
		if(state == "on"){
			isAmbient = true;
		} else{
			isAmbient = false;
		}
	} else if(type == "parallel"){
		if(state == "on"){
			isParallel = true;
		} else{
			isParallel = false;
		}
	} else if(type == "point"){
		if(state == "on"){
			isPoint = true;
		} else{
			isPoint = false;
		}
	}
}
function setParallelDir(x, y, z){
	parallelDir.x = x;
	parallelDir.y = y;
	parallelDir.z = z;
}
function setPointPos(x, y, z){
	pointPos.x = x;
	pointPos.y = y;
	pointPos.z = z;
}

var angle = 3;  //每次旋转的角度
//旋转
function rotate(dir){
	switch(dir){
	case "up":
		rot.x -= angle;
		break;
	case "down":
		rot.x += angle;
		break;
	case "left":
		rot.y -= angle;
		break;
	case "right":
		rot.y += angle;
		break;
	case "acw":
		rot.z += angle;
		break;
	case "cw":
		rot.z -= angle;
		break;
	}
}
function cancelRotate(){
	rot = {x: 0, y: 0, z: 0};
}

var dis = 0.1;  //每次平移的距离
//平移
function tran(dir){
	switch(dir){
	case "up":
		pos.y += dis;
		break;
	case "down":
		pos.y -= dis;
		break;
	case "left":
		pos.x -= dis;
		break;
	case "right":
		pos.x += dis;
		break;
	case "front":
		pos.z += dis;
		break;
	case "back":
		pos.z -= dis;
		break;
	}
}
function cancelTran(){
	pos = {x: 0, y: 0, z: -2};
}

var add = 0.1;  //每次缩放的大小
//缩放
function scale(type){
	switch(type){
	case "x-big":
		sca.x += add;
		break;
	case "x-small":
		sca.x -= add;
		break;
	case "y-big":
		sca.y += add;
		break;
	case "y-small":
		sca.y -= add;
		break;
	case "z-big":
		sca.z += add;
		break;
	case "z-small":
		sca.z -= add;
		break;
	//等比例缩放
	case "all-big":
		sca.x += add * sca.x / sca.z;
		sca.y += add * sca.y / sca.z;
		sca.z += add;
		break;
	case "all-small":
		sca.x -= add * sca.x / sca.z;
		sca.y -= add * sca.y / sca.z;
		sca.z -= add;
		break;
	}
	if(sca.x <= 0){
		sca.x = 0.1;
	}
	if(sca.y <= 0){
		sca.y = 0.1;
	}
	if(sca.z <= 0){
		sca.z = 0.1;
	}
}
function cancelScale(){
	sca = {x: 1, y: 1, z: 1};
}
