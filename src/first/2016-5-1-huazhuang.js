"use strict";

var num = 0;
var imageDatas = {};
var imgUrl = "";
var userId = "";
var isDrawing = false;

$(document).ready(function () {
  userId = $("#J_userId").attr("value");
  console.log(userId);
  startHome();
});

function startHome() {
  startInit();
  }

function startInit() {
  var height = document.body.clientHeight;
  var advertisement = $(".advertisement");
  var a_top = height-90;
  advertisement.css("margin-top",a_top)
    .css("position","absolute");j
  advertisement.removeClass('add');

  $("#J_startButton").on("click", function () {
    changeAnimation(".home","J_animationContainer",".loading",true);
  })
}


function paint() {
  var self = this;
  self.init();
}

var paintPrototype = paint.prototype;

paintPrototype.init = function () {
  var self = this;
  imgUrl = $("#J_userImg").attr("src");
  self.stage = new createjs.Stage("J_canvas");
  self.stage.alpha = 1;
  self.bottomStage = new createjs.Stage("J_bottomCanvas");
  createjs.Touch.enable(self.stage);
  self.stage.enableMouseOver();
  self.stage.autoClear = false;

  self.image = new Image();
  self.image.src = imgUrl;
  self.image.addEventListener("load", self.handleImageLoad.bind(self))
};

paintPrototype.handleImageLoad = function (event) {
  var self = this;
  self.data = {};
  var data = self.data;
  data.bitmap = new createjs.Bitmap(self.image);
  data.bitmap.scaleX = 233/self.image.width;
  data.bitmap.scaleY = 277/self.image.height;
  var container = new createjs.Container();

  var alphaMask = new createjs.Shape();
  alphaMask.graphics.setStrokeStyle(10,"round","round").beginStroke("rgba(0,0,0,0)").beginFill("#555")
    .moveTo(0,0)
    .lineTo(0,225)
    .lineTo(40,225)
    .lineTo(40,277)
    .lineTo(200,277)
    .lineTo(200,225)
    .lineTo(233,225)
    .lineTo(233,0)
    .closePath();
  alphaMask.cache(0,0,233,277);
  var alphaMaskFilter = new createjs.AlphaMaskFilter(alphaMask.cacheCanvas);

  data.bitmap.filters = [alphaMaskFilter];
  data.bitmap.cache(0,0,233,277);

  container.addChild(alphaMask,data.bitmap);

  data.bottomBitmap = new createjs.Bitmap(self.image);

  self.stage.addChild(container);
  self.bottomStage.addChild(data.bottomBitmap);
  self.stage.update();
  self.bottomStage.update();

  new makeUp(self);
};



function makeUp(container) {
  console.log(container);
  var self = this;
  self.init(container);
}

var makeUpPrototype = makeUp.prototype;

makeUpPrototype.init = function (container) {
  var self = this;
  self.method = 0;
  var imgSelector = $("#J_selector .icon");
  var clickImages = $("#J_selector .icon-click");
  imgSelector.on("touchstart", function (event) {
    console.log(self.method);
    self.method = event.target.attributes[0].value;
    if(self.method) {
      self.paint(self.method,container);
    }
    imgSelector.forEach(function (img,index) {
      if(index <= 7){
        if(img === event.target) {
          $(img).hide();
          $(clickImages[index]).show();
        }else {
          $(img).show();
          $(clickImages[index]).hide();
        }
      }
    })
  })
};

makeUpPrototype.paint = function (method,container) {
  var self = this;
  switch (parseInt(method)) {
    case 1:
      self.myDraw(container,{
        thickness: 5,
        opacity: 1,
        color: "#dd1b48"
      });
      break;
    case 2:
      self.myDraw(container,{
        thickness: 2,
        opacity: 1,
        color: "#232323"
      });
      break;
    case 3:
      self.myDraw(container,{
        thickness: 4,
        opacity: 1,
        color: "#5f492f"
      });
      break;
    case 4:
      self.myDraw(container,{
        thickness: 20,
        opacity: 0.5,
        color: "#f0d8b3"
      });
      break;
    case 5:
      self.myDraw(container,{
        thickness: 5,
        opacity: 0.5,
        color: "#fff9f0"
      });
      break;
    case 6:
      self.myDraw(container,{
        thickness: 20,
        opacity: 0.5,
        color: "#ff66a3"
      });
      break;
    case 7:
      self.myDraw(container,{
        thickness: 7,
        opacity: 0.5,
        color: "#884dff"
      });
      break;
    case 8:
      self.eraser(container);
      break;
    case 9:
      self.revoke(container.stage);
      break;
    case 10:
      self.delete(container.stage);
      break;
  }
};

makeUpPrototype.myDraw = function (container,configuration) {
  var self = this;
  self.oldPt = {};
  self.oldMidPt = {};
  self.isDrawing = false;

  console.log(container);
  var stage = container.stage;

  stage.removeAllEventListeners();

  stage.addEventListener("stagemousedown", function () {
    var shape = new createjs.Shape();
    var container = new createjs.Container();

    shape.cache(0,0,233,277);

    container.addChild(shape);
    stage.addChild(container);

    shape.alpha = configuration.opacity;
    self.oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
    self.oldMidPt = self.oldPt;
    self.isDrawing = true;

    stage.addEventListener("stagemouseup",handleMouseUp);

    stage.addEventListener("stagemousemove", handleMouseMove);

    function handleMouseMove() {
      if(!self.isDrawing) {
        return;
      }
      var midPoint = new createjs.Point(self.oldPt.x + stage.mouseX >> 1, self.oldPt.y + stage.mouseY >> 1);

      shape.graphics
        .setStrokeStyle(configuration.thickness,"round","round")
        .beginStroke(configuration.color)
        .moveTo(midPoint.x, midPoint.y)
        .curveTo(self.oldPt.x, self.oldPt.y, self.oldMidPt.x, self.oldMidPt.y);

      self.oldPt.x = stage.mouseX;
      self.oldPt.y = stage.mouseY;

      self.oldMidPt.x = midPoint.x;
      self.oldMidPt.y = midPoint.y;

      //bitmap.alpha = bitmap.alpha/5;
      shape.updateCache("source-over");
      stage.update();
    }

    function handleMouseUp() {
      //container.alpha = shape.alpha/2;
      stage.update();
      self.isDrawing = false;
      stage.removeEventListener("stagemouseup",handleMouseUp);
      stage.removeEventListener("stagemousemove",handleMouseMove);
    }
  });
};

makeUpPrototype.eraser = function (container) {

  var self = this;
  self.oldPt = {};
  self.oldMidPt = {};
  self.isDrawing = false;



  container.stage.removeAllEventListeners();
  container.stage.addEventListener("stagemousedown", function () {

    var shape = new createjs.Shape();
    var bitmapContainer = new createjs.Container();
    var maskBitmap = new createjs.Bitmap(container.image);
    bitmapContainer.addChild(maskBitmap);
    container.stage.addChild(bitmapContainer);

    shape.cache(0,0,233,233);
    var maskFilter = new createjs.AlphaMaskFilter(shape.cacheCanvas);
    maskBitmap.filters = [maskFilter];
    maskBitmap.cache(0,0,233,233);

    container.stage.update();


    self.oldPt = new createjs.Point(container.stage.mouseX, container.stage.mouseY);
    self.oldMidPt = self.oldPt;
    self.isDrawing = true;

    container.stage.addEventListener("stagemouseup",handleMouseUp);

    container.stage.addEventListener("stagemousemove", handleMouseMove);

    function handleMouseMove() {
      if(!self.isDrawing) {
        return;
      }
      var midPoint = new createjs.Point(self.oldPt.x + container.stage.mouseX >> 1, self.oldPt.y + container.stage.mouseY >> 1);

      shape.graphics
        .setStrokeStyle(30,"round","round")
        .beginStroke("rgba(0,0,0,1)")
        .moveTo(midPoint.x, midPoint.y)
        .curveTo(self.oldPt.x, self.oldPt.y, self.oldMidPt.x, self.oldMidPt.y);

      self.oldPt.x = container.stage.mouseX;
      self.oldPt.y = container.stage.mouseY;

      self.oldMidPt.x = midPoint.x;
      self.oldMidPt.y = midPoint.y;

      maskFilter = new createjs.AlphaMaskFilter(shape.cacheCanvas);

      maskBitmap.filters = [maskFilter];

      shape.updateCache();
      maskBitmap.updateCache(0,0,233,233);
      container.stage.update();
    }

    function handleMouseUp() {
      isDrawing = true;
      bitmapContainer.cache(0,0,233,233);
      container.stage.update();
      self.isDrawing = false;
      container.stage.removeEventListener("stagemouseup",handleMouseUp);
      container.stage.removeEventListener("stagemousemove",handleMouseMove);
    }
  });
};

makeUpPrototype.revoke = function (stage) {
  console.log(stage);
  if(stage.getNumChildren()>1) {
    stage.removeChildAt(stage.getNumChildren()-1);
    stage.update();
  }
  return;
};

makeUpPrototype.delete = function (stage) {
  var n = stage.getNumChildren();
  for(var i = 0;i < n;i++) {
    stage.removeChildAt(n-i);
    stage.update();
  }
};


function imageLoader() {
  var self = this;
  self.initDatas();
  self.loadImages();
}

var imageLoaderPrototype = imageLoader.prototype;

imageLoaderPrototype.initDatas = function () {
  var self = this;
  self.data = {
    methodFirstImages:[
      {src:"http://cdn1.showjoy.com/images/92/92e6e2c1961e4bf5ad6ec001f3440464.png"},
      {src:"http://cdn1.showjoy.com/images/d7/d7c7827a04f64ddf9cf2023713eeb9ec.png"},
      {src:"http://cdn1.showjoy.com/images/8b/8b99985342fb43d3b4a032cb2d90bede.png"},
      {src:"http://cdn1.showjoy.com/images/8a/8aa651ff02ac415896261c1b4acc6c53.png"},
      {src:"http://cdn1.showjoy.com/images/cf/cfeed456dd51409aadec9bca8b206985.png"},
      {src:"http://cdn1.showjoy.com/images/68/68d9d544a4ad4c39b4f2496ec60e31cf.png"},
      {src:"http://cdn1.showjoy.com/images/e5/e578d0d19da144ad8a7e5859198b16fb.png"},
      {src:"http://cdn1.showjoy.com/images/9b/9bf6a88fee274d8ba95a667467c6a5a5.png"},
      {src:"http://cdn1.showjoy.com/images/34/34ae1cab033c4864bd9a1db97bd8f954.png"},
      {src:"http://cdn1.showjoy.com/images/25/255b50c49f844e7d80f54b993cdf36a4.png"}
    ],
    methodFirstImagesContainer:[],
    methodClickImages: [
      {src: "http://cdn1.showjoy.com/images/ee/ee2492856c7643ea9931cee4e4b423c4.png"},
      {src: "http://cdn1.showjoy.com/images/cc/cc8ee082235c408d8cc24040f96a1d5f.png"},
      {src: "http://cdn1.showjoy.com/images/f9/f93f6d1ea9d14ff98166fb6b3d8aa258.png"},
      {src: "http://cdn1.showjoy.com/images/4a/4a54db27884e4c418664ab4e441fede1.png"},
      {src: "http://cdn1.showjoy.com/images/fe/fe417d5b7ecb450f9fc7af480aec49a5.png"},
      {src: "http://cdn1.showjoy.com/images/fc/fcd5ba696bfe48478da86b01fccba8b9.png"},
      {src: "http://cdn1.showjoy.com/images/60/60462414988c4b7b917c08fdf085baff.png"},
      {src: "http://cdn1.showjoy.com/images/98/98885a7d284e438297669f505a040a80.png"}
    ],
    methodClickImagesContainer: [],
    dresser:[
      {src:"http://cdn1.showjoy.com/images/80/8078fb3a6bf84586bb19fbb4c4a273da.png"}
    ],
    dresserContainer:[]
  }
};

imageLoaderPrototype.loadImages = function () {
  var self = this;
  var data = self.data;

  self.load(data.methodFirstImages, data.methodFirstImagesContainer, function () {
    num++;
    console.log("methodFirstImages loaded");
    imageDatas = data;
  });
  self.load(data.methodClickImages, data.methodClickImagesContainer, function () {
    num++;
    console.log("methodClickImages loaded")
  });
  self.load(data.dresser, data.dresserContainer, function () {
    num++;
    console.log("timeImages loaded");
  });
};

imageLoaderPrototype.load = function (images, container, callback) {
  var self = this;
  var manifest = images;
  var preload = new createjs.LoadQueue(true, "");

  preload.on("fileload", function (event) { //每一张图片加载完成回调
    container.push(event.result);
  });

  preload.on("complete", function () { //所有图片加载完成回调
    callback();
    if (num === 3) {
      imageDatas = self.data;
      gameStart();
    }
  });

  preload.setMaxConnections(1);

  preload.loadManifest(manifest, true, "");
};

function gameStart() {
  changeAnimation(".makeup","J_makeupAnimationContainer",null,false);
  bodyInit();
  new paint();
}

function bodyInit() {
  var height = document.body.clientHeight;
  var m_top = height - 196 - 60;
  var c_top = height - 70;
  $(".selector").css("margin-top",m_top);
  $(".complete").css("margin-top",c_top);

  var selector = $("#J_selector");
  var images = imageDatas.methodFirstImages;
  var clickImages = imageDatas.methodClickImages;
  var html = "";
  images.forEach(function (image, index) {
    if(clickImages[index]){
      html+='<div class="icon-container">' +
        '<img data-id="' + (index+1) + '" class="icon" src="' + image.src+ '"> ' +
        '<img data-id="' + (index+1) + '" class="icon-click" src="' + clickImages[index].src+ '"> ' +
        '</div>';
    }
    else {
      html+='<div class="icon-container">' +
        '<img data-id="' + (index+1) + '" class="icon" src="' + image.src+ '"> ' +
        '</div>';
    }
  });
  selector.append(html);

  $(".loading").hide();
  $(".makeup").show();
}


function changeAnimation(containerId,animationId,showId,judge) {
  var height = $(containerId).css("height");
  var canvas = document.getElementById("J_homeCanvas");

  canvas.height = height;

  var stage = new createjs.Stage(canvas);

  var container = new createjs.Container();
  stage.addChild(container);

  var context = new createjs.DOMElement(animationId);
  container.addChild(context);

  if(judge) {
    //container.regX = 187;
    //container.x = 187;
    //container.scaleX = 1;
    //container.alpha = 1;

    createjs.Tween.get(container,{loop: false},true).to({
      //scaleX : -1,
      x: -375,
      alpha: 0
    },1000,createjs.Ease.backOut);

    setTimeout(function () {
      $(containerId).hide();
      if(showId) {
        $(showId).show();
      }
      stage.removeAllChildren();
      new imageLoader();
    },1000);
  }else {
    //container.regX = 187;
    //container.x = 187;
    //container.scaleX = -1;
    container.alpha = 0;
    container.x = 375;

    $(".loading").hide();
    $(".makeup").show();

    createjs.Tween.get(container,{loop: false},true).to({
      //scaleX : 1,
      x: 0,
      alpha: 1
    },1500,createjs.Ease.bounceOut);

    setTimeout(function () {
      stage.removeAllChildren();
    },1500);
  }


  createjs.Ticker.addEventListener("tick", stage);

  stage.update();
}

function uploadDrawingImage() {
  if(isDrawing) {
    var pic = document.getElementById("J_canvas").toDataURL("image/png");
    pic = pic.replace(/^data:image\/(png|jpg);base64,/, "");
    $("#J_upload").src = pic;
    console.log(pic.length);

    $.ajax({
      url: '/m/api/anniversaryGame/sharePainting',
      type: 'POST',
      data: {
        imageFile: pic
      },
      //contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (msg) {
        window.location.reload();
        showSuccess();
      },
      error: function (msg) {
        console.log("error");
        showError();
      }
    })
  }
}





