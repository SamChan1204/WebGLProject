var controlling = null, 
	cLoadModel,
	cSubdivision,
	cTexture,
	cLighting,
	cRotation,
	cTranslation,
	cScaling;

var isPressing = false;

//初始化
function init(){
	cLoadModel = $("#load");
	cSubdivision = $("#subdivision");
	cTexture = $("#texture");
	cLighting = $("#lighting");
	cRotation = $("#rotation");
	cTranslation = $("#translation");
	cScaling = $("#scaling");

	setButtonEvents();
	$("#load-btn").click();
}

//按钮绑定事件
function setButtonEvents(){
	$("#btn-bar").click(setControlEvents);

	//载入模型
	$("#loadModel-btn").click(toLoadModel);

	//曲面细分

	//贴图
	$("#texture").click(setTexture);

	//光照
	$("#lighting").click(turnLighting);
	$("#lighting").change(setLighting);

	//旋转
	$("#rotation").mousedown(function(event){
		isPressing = true;
		setRotation(event);
	});
	$("#rotation").mouseup(function(event){
		isPressing = false;	
	});

	//平移
	$("#translation").mousedown(function(event){
		isPressing = true;
		setTranslation(event);
	});
	$("#translation").mouseup(function(event){
		isPressing = false;	
	});

	//缩放
	$("#scaling").mousedown(function(event){
		isPressing = true;
		setScaling(event);
	});
	$("#scaling").mouseup(function(event){
		isPressing = false;	
	});
}

function setControlEvents(event){
	var id = event.target.id;
	var toShow;
	switch(id){
	case "load-btn":
		toShow = cLoadModel;
		break;
	case "subv-btn":
		toShow = cSubdivision;
		break;
	case "texture-btn":
		toShow = cTexture;
		break;
	case "lighting-btn":
		toShow = cLighting;
		break;
	case "rotate-btn":
		toShow = cRotation;
		break;
	case "tran-btn":
		toShow = cTranslation;
		break;
	case "scale-btn":
		toShow = cScaling;
		break;
	}

	if(controlling != null){
		$(controlling).hide();
	}
	$(toShow).show();
	controlling = toShow;
}

function setTexture(event){
	var id = event.target.id;
	switch(id){
	case "texture1":
		loadTexture("texture1");
		break;
	case "texture2":
		loadTexture("texture2");
		break;
	case "cancel-texture":
		cancelTexture();
	}
}

function turnLighting(event){
	var id = event.target.id;
	var btn, text;
	switch(id){
	case "ambient-btn":
		btn = $("#ambient-btn");
		text = btn.text();
		if(text == "开启"){
			turnLight("ambient", "on");
			btn.text("关闭");
		} else if(text == "关闭"){
			turnLight("ambient", "off");
			btn.text("开启");
		}
		break;
	case "parallel-btn":
		btn = $("#parallel-btn");
		text = btn.text();
		if(text == "开启"){
			turnLight("parallel", "on");
			btn.text("关闭");
		} else if(text == "关闭"){
			turnLight("parallel", "off");
			btn.text("开启");
		}
		break;
	case "point-btn":
		btn = $("#point-btn");
		text = btn.text();
		if(text == "开启"){
			turnLight("point", "on");
			btn.text("关闭");
		} else if(text == "关闭"){
			turnLight("point", "off");
			btn.text("开启");
		}
		break;
	case "turnoff-light-btn":
		btn = $("#ambient-btn");
		turnLight("ambient", "off");
		btn.text("开启");
		btn = $("#parallel-btn");
		turnLight("parallel", "off");
		btn.text("开启");
		btn = $("#point-btn");
		turnLight("point", "off");
		btn.text("开启");
		break;
	}
}

function setLighting(event){
	var parent = $(event.target).parent();
	var prams = $(parent).find("input");
	var id = parent.attr("id");
	if(id == "parallel-dir"){
		setParallelDir(parseFloat($(prams[0]).val()), parseFloat($(prams[1]).val()), parseFloat($(prams[2]).val()));
	} else if(id == "point-pos"){
		setPointPos(parseFloat($(prams[0]).val()), parseFloat($(prams[1]).val()), parseFloat($(prams[2]).val()));
	}
}

var timeInteval = 50;
function setRotation(event){
	var id = event.target.id;
	switch(id){
	case "rotate-up":
		rotate("up");
		break;
	case "rotate-left":
		rotate("left");
		break;
	case "rotate-right":
		rotate("right");
		break;
	case "rotate-down":
		rotate("down");
		break;
	case "rotate-acw":
		rotate("acw");
		break;
	case "rotate-cw":
		rotate("cw");
		break;
	case "cancel-rotate":
		cancelRotate();
		return;
	}

	if(isPressing){
		setTimeout(function(){
			setRotation(event);
		}, timeInteval);
	}
}

function setTranslation(event){
	var id = event.target.id;
	switch(id){
	case "tran-up":
		tran("up");
		break;
	case "tran-left":
		tran("left");
		break;
	case "tran-right":
		tran("right");
		break;
	case "tran-down":
		tran("down");
		break;
	case "tran-front":
		tran("front");
		break;
	case "tran-back":
		tran("back");
		break;
	case "cancel-tran":
		cancelTran();
		return;
	}

	if(isPressing){
		setTimeout(function(){
			setTranslation(event);
		}, timeInteval);
	}
}

function setScaling(event){
	var id = event.target.id;
	switch(id){
	case "scale-x-big":
		scale("x-big");
		break;
	case "scale-x-small":
		scale("x-small");
		break;
	case "scale-y-big":
		scale("y-big");
		break;
	case "scale-y-small":
		scale("y-small");
		break;
	case "scale-z-big":
		scale("z-big");
		break;
	case "scale-z-small":
		scale("z-small");
		break;
	case "scale-all-big":
		scale("all-big");
		break;
	case "scale-all-small":
		scale("all-small");
		break;
	case "cancel-scale":
		cancelScale();
		return;
	}

	if(isPressing){
		setTimeout(function(){
			setScaling(event);
		}, timeInteval);
	}
}

init();
webGLStart();