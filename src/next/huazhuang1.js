//  模块外面不用包一层define，dev和build时工具会自动加上，遵循CommonJS规范，像node一样写就可以了，如下

'use strict';
var isHaveImg = false;
var image = null;
var imageDatas = {};
var secondShare = true;
var num = 0;
$(document).ready(function () {
  //preventScroll();
  if(isWeiXin()) {
    upload();
  }else {
    upload();
    //$("#J_home").hide();
    //$("#J_wxMark").show();
  }
});

function preventScroll() {
  $("body").on("touchstart", function () {
    event.preventDefault();
  });
  $(".J_second").on("touchstart", function () {
    event.preventDefault();
  })
}

function canvasInit(url) {
  this.init(url);
}

function upload() {
  $("#J_leftImg").on("touchstart", function () {
    $.ajax({
      url: "/m/api/anniversaryGame/uploadWeChatImg",
      type: "GET",
      dataType: 'json',
      success: function (data) {
        if(data.isSuccess) {
        }else{
          $("#J_wxMark").show();
        }
        new canvasInit(url);
      },
      error: function (error) {
        $(".J_error").addClass("show-1");
        setTimeout(function () {
          $(".J_error").removeClass("show-1");
        });
      }
    })
  });

  $("#J_uploadImg")[0].addEventListener('change',readFile,false);

  $("#J_rightImg").on("touchstart", function () {
    $("#J_uploadImg").trigger("click");
  });

  $("#J_upload").on("touchstart", function () {
    var pic = document.getElementById("J_canvas").toDataURL("image/png");
    pic = pic.replace(/^data:image\/(png|jpg);base64,/, "");

    $.ajax({
      url: '/m/api/anniversaryGame/sharePainting',
      type: 'POST',
      data: {
        imageFile: pic
      },
      //contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (msg) {
        showSuccess();

        if(secondShare) {
          new shareCanvas();
        }else{
          var mark = $(".J_shareMark");
          setTimeout(function () {
            mark.show();
            mark.on("touchstart", function () {
              mark.hide();
            })
          },1500);
        }
      },
      error: function (msg) {
        showError();

        if(secondShare) {
          new shareCanvas();
        }else{
          var mark = $(".J_shareMark");
          setTimeout(function () {
            mark.show();
            mark.on("touchstart", function () {
              mark.hide();
            })
          },1500);
        }
      }
    })
  })
}

function readFile(ev) {
  var file = this.files[0];
  if(!/image\/\w+/.test(file.type)){
    alert("文件必须为图片！");
    return false;
  }
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    new canvasInit(this.result);
  }
}


function showSuccess() {
  var success = $(".J_success")
  success.css("-webkit-transform","translateY(0)")
    .css("transform","translateY(0)");
  setTimeout(function () {
    success.css("-webkit-transform","translateY(-100px)")
      .css("transform","translateY(-100px)");
  },1000);
}

function showError() {
  var error = $(".J_error")
  error.css("-webkit-transform","translateY(0)")
    .css("transform","translateY(0)");
  setTimeout(function () {
    error.css("-webkit-transform","translateY(-100px)")
      .css("transform","translateY(-100px)");
  },1000);
}


function isWeiXin(){
  var ua = window.navigator.userAgent.toLowerCase();
  if(ua.match(/MicroMessenger/i) == 'micromessenger'){
    return true;
  }else{
    return false;
  }
}

var canvasInitPrototype = canvasInit.prototype;

canvasInitPrototype.init = function (url) {
  var self = this;
  self.initImage(url);
};

canvasInitPrototype.initImage = function (url) {
  var self = this;
  self.image = new Image();
  self.image.src = url;
  self.image.addEventListener("load",self.handleImageLoad.bind(this));
};

canvasInitPrototype.handleImageLoad = function (event) {
  console.log("image load");
  var self = this;

  var isRotate = false;
  image = self.image;

  EXIF.getData(image, function () {
    var text = EXIF.getTag(this,'Orientation');
    if(parseInt(text) === 6) {
      isRotate = true;
    }
  });

  var w = self.image.width;
  var h = self.image.height;


  self.scale = 1;

  var canvas = document.getElementById("J_canvas");
  self.stage = new createjs.Stage(canvas);
  self.stage.removeAllChildren();

  console.log("remove",self.stage);

  var bitmap = new createjs.Bitmap(self.image);

  //bitmap.regX = w/2;
  //bitmap.regY = h/2;
  //bitmap.x = 87;
  //bitmap.y = 102;
  //bitmap.rotation = 90;
  //bitmap.scaleX = 175/h;
  //bitmap.scaleY = 175/h;
  //bitmap.y = -parseInt((w*(175/h)-205)/2) + bitmap.y;
  //alert(bitmap.y);

  if(isRotate) {
    bitmap.regX = w/2;
    bitmap.regY = h/2;
    bitmap.x = 87;
    bitmap.y = 102;
    bitmap.rotation = 90;

    self.scale = 175/h;
    bitmap.scaleX = bitmap.scaleY = self.scale;
    bitmap.y = -parseInt((w*self.scale-205)/2) + bitmap.y;
  }
  else {
    if(parseFloat(h/w) >= parseFloat(205/175)) {
      self.scale = 175/w;
      bitmap.scaleX = bitmap.scaleY = self.scale;
      bitmap.y = -parseInt((h*self.scale - 205)/2);
    } else {
      self.scale = 205/h;
      bitmap.scaleX = bitmap.scaleY = self.scale;
      bitmap.x = -parseInt((w*self.scale - 175)/2);

    }
  }

  self.stage.addChild(bitmap);
  self.stage.update();


  console.log(self.stage);

  $(".share-img").show();

  isHaveImg = true;
};


function shareCanvas() {
  this.init();
}

var shareCanvasPrototype = shareCanvas.prototype;

shareCanvasPrototype.init = function () {
  this.initDatas();
  this.loadImages();
};

shareCanvasPrototype.initDatas = function () {
  var self = this;
  self.data = {
    backgroundImage: [
      'http://cdn1.showjoy.com/images/7c/7cdf5afd9012491eb09c18feef3b226f.png'
    ],
    backgroundImageContainer : [],
    decorateImages : [
      'http://cdn1.showjoy.com/images/eb/ebb20960d51445fd8893acb5f7189577.png',
      'http://cdn1.showjoy.com/images/f8/f8186f29b32d48f6ab5addc086da9d33.png',
      'http://cdn1.showjoy.com/images/46/460b7cb653324015ad8968eeb7e653be.png',
      'http://cdn1.showjoy.com/images/23/23e5755402ec4560879b475b5398c6ba.png',
      'http://cdn1.showjoy.com/images/9b/9b23f1554359404db7cefce15ce8a123.png'
    ],
    decorateImagesContainer : [],
    dresserImage : [
      'http://cdn1.showjoy.com/images/51/511b835717fb469bafdd206e23681cfe.png'
    ],
    dresserImageContainer : [],
    titleImage : [
      'http://cdn1.showjoy.com/images/0e/0e2ba4af96504d0cb770170eeede37a6.png'
    ],
    titleImageContainer : [],
    shareImage : [
      'http://cdn1.showjoy.com/images/5e/5e8d9972a8464c83b722d981724ce61b.png',
      'http://cdn1.showjoy.com/images/5e/5ea339996fe648c18fd90b6045c0f7e2.png'
    ],
    shareImageContainer : [],
    personTestImage : [
      './IMG_2721.jpg'
    ],
    personTestImageContainer : []
  }
};

shareCanvasPrototype.loadImages = function () {
  var self = this;
  var data = self.data;
  console.log(data);

  self.load(data.backgroundImage, data.backgroundImageContainer, function () {
    num++;
    console.log("backgroundImages loaded");
    imageDatas = data;
  });
  self.load(data.decorateImages, data.decorateImagesContainer, function () {
    num++;
    console.log("decorateImages loaded");
    imageDatas = data;
  });
  self.load(data.dresserImage, data.dresserImageContainer, function () {
    num++;
    console.log("dresserImage loaded");
    imageDatas = data;
  });
  self.load(data.titleImage, data.titleImageContainer, function () {
    num++;
    console.log("titleImage loaded");
    imageDatas = data;
  });
  self.load(data.shareImage, data.shareImageContainer, function () {
    num++;
    console.log("shareImage loaded");
    imageDatas = data;
  });
  self.load(data.personTestImage, data.personTestImageContainer, function () {
    num++;
    console.log("personImage loaded");
    imageDatas = data;
  });
};

shareCanvasPrototype.load = function (images, container, callback) {
  var self = this;
  var manifest = images;
  var preload = new createjs.LoadQueue(true, "");

  preload.on("fileload", function (event) { //每一张图片加载完成回调
    event.result.width = event.result.width/2;
    container.push(event.result);
  });

  preload.on("complete", function () { //所有图片加载完成回调
    callback();
    if (num === 6) {
      imageDatas = self.data;
      self.initShareCanvas();
    }
  });

  preload.setMaxConnections(1);

  preload.loadManifest(manifest, true, "");
};

shareCanvasPrototype.initShareCanvas = function () {
  var self = this;
  var canvas = document.getElementById("J_shareCanvas");
  canvas.height = document.body.clientHeight*2;
  self.stage = new createjs.Stage(canvas);

  var backgroundImage = self.data.backgroundImageContainer[0];
  var backgroundBitmap = new createjs.Bitmap(backgroundImage);
  //backgroundBitmap.scaleX = canvas.width/backgroundImage.width;
  //backgroundBitmap.scaleY = canvas.height/backgroundImage.height;

  var titleBitmap = new createjs.Bitmap(self.data.titleImageContainer[0]);
  titleBitmap.scaleX = titleBitmap.scaleY = 0.9;
  titleBitmap.y = -100;
  titleBitmap.x = 40;

  var decorateImages = self.data.decorateImagesContainer;
  var decorateBitmap_1 = new createjs.Bitmap(decorateImages[0]);
  decorateBitmap_1.x = 90;
  decorateBitmap_1.y = 45;
  var decorateBitmap_2 = new createjs.Bitmap(decorateImages[1]);
  decorateBitmap_2.x = 600;
  decorateBitmap_2.y = 45;
  var decorateBitmap_3 = new createjs.Bitmap(decorateImages[2]);
  decorateBitmap_3.x = 90;
  decorateBitmap_3.y = 550;
  var decorateBitmap_4 = new createjs.Bitmap(decorateImages[3]);
  decorateBitmap_4.x = 600;
  decorateBitmap_4.y = 550;
  var decorateBitmap_5 = new createjs.Bitmap(decorateImages[4]);
  decorateBitmap_5.x = 600;
  decorateBitmap_5.y = 750;
  var decContainer = new createjs.Container();
  decContainer.addChild(decorateBitmap_1,decorateBitmap_2,decorateBitmap_3,decorateBitmap_4,decorateBitmap_5);

  var dresserBitmap = new createjs.Bitmap(self.data.dresserImageContainer[0]);
  dresserBitmap.y = 280;

  var personImage = self.data.personTestImageContainer[0];
  var personBitmap = new createjs.Bitmap(personImage);
  personBitmap.y = 336;
  personBitmap.x = 198;
  personBitmap.scaleX = 177/personImage.width;
  personBitmap.scaleY = 410/personImage.height;

  var rect = new createjs.Shape();
  rect.graphics.setStrokeStyle(10).beginFill("#fff").beginStroke("#fff")
    .drawRect(0,0,520,240);
  rect.x = 115;
  rect.y = 880;

  var handBitmap = new createjs.Bitmap(self.data.shareImageContainer[0]);
  handBitmap.x = 385;
  handBitmap.y = 887;

  var textBitmap = new createjs.Bitmap(self.data.shareImageContainer[1]);
  textBitmap.y = 1140;
  textBitmap.x = 150;

  self.stage.addChild(backgroundBitmap,titleBitmap,personBitmap,dresserBitmap,decContainer,rect,handBitmap,textBitmap);
  self.stage.update();

  self.initQrcode();
};

shareCanvasPrototype.initDecoration = function (image,scale,top,left) {
  var decorateBitmap = new createjs.Bitmap(image);
  decorateBitmap.scaleX = decorateBitmap.scaleY = scale;
  decorateBitmap.x = left;
  decorateBitmap.y = top;
  return decorateBitmap;
};


shareCanvasPrototype.initQrcode = function () {
  var self = this;
  $(".J_code").qrcode({
    width: 222,
    height: 222,
    text: "www.showjoy.com"
  });

  var qrcodeCanvas = $(".J_code").find("canvas");
  var pic = qrcodeCanvas[0].toDataURL("image/png");
  var qrcodeImage = new Image();
  qrcodeImage.src = pic;

  qrcodeImage.onload = function () {
    var qrcodeBitmap = new createjs.Bitmap(qrcodeImage);
    qrcodeBitmap.x = 130;
    qrcodeBitmap.y = 887;
    self.stage.addChild(qrcodeBitmap);
    self.stage.update();
    self.canvasToImage();
  }
};

shareCanvasPrototype.canvasToImage = function () {
  var canvas = document.getElementById("J_shareCanvas");
  var pic = canvas.toDataURL();
  $(".J_second").show();
  var image = $(".J_canvasImg");
  image.attr("src",pic);
};


