## 尚妆周年庆化妆游戏开发文档
**开发目的**：为尚妆周年庆引流，增加尚妆的关注度<br/>
**开发简介**：

-  限制用户微信登录，获取用户头像昵称信息。
-  用户选择要化妆的图片，第一为用户微信头像，第二为拍照或者本地图片，选择好后保存图片。
-  用户把保存好图片的页面分享到朋友圈。
-  用户的朋友在朋友圈里点开分享的链接，到达为用户化妆的界面
-  化妆完成后用后的朋友保存化妆完图片，用户及用户的所有朋友都可见。

**开发所需**

-  createJS，一个h5游戏引擎
-  Jquery

**开发流程以及碰到的难点和坑**

- 判断是否微信浏览器，判断是否已经微信登录，微信浏览器判断通过`window.navigator.userAgent`，是否已经微信登录通过后台在页面内置的一个标签来判断。
- 用户通过第三方登录后进入首页，用户可以选择上传自己微信头像，或者拍照或者自己本地图片。然后将图片渲染进canvas。这时候碰到了第一个难点，我们的化妆台长宽比例是固定的，但是用户上传图片的长宽比例是不确定的。便做了如下判断：

```
	if(parseFloat(h/w) >= parseFloat(205/175)) {
      self.scale = 175/w;
      bitmap.scaleX = bitmap.scaleY = self.scale;
      bitmap.y = -parseInt((h*self.scale - 205)/2);
    } else {
      self.scale = 205/h;
      bitmap.scaleX = bitmap.scaleY = self.scale;
      bitmap.x = -parseInt((w*self.scale - 175)/2);
    }
```
便是，如果图片宽比高大于化妆台宽比高，则图片的缩放比例为`image.height/dresser.height`,然后裁剪掉左右溢出的部分，取中间渲染进canvas，反之同理。解决了比例的问题，接着就遇到了第一个坑，便是手机拍照上传，ios的手机竖直拍照后图片会向左旋转90度，上网搜了一下后发现，通过手机拍照获得的图片可以获取其基本信息，其中`Orientation`属性标志了图片的旋转方向，分别为1，3，6，9，其中左旋90度的标志位为6.然后根据标志位再旋转一定角度将图片正立。但在Android中，无论什么方向拍照，都会给你正立过来，比如你横向拍照的，但是在渲染的时候会自动的右旋90度正立过来,而且旋转标志位都一样，暂时没找到合适的解决方法，就酱紫忽略过去了，就很尴尬(⊙o⊙)…。这种旋转问题只在拍照时发现，用户选择已有图片并不会出现这种状况。

-  用户选择好要化妆的图片之后，便需要点击上传保存图片，调用canvas的`toDataUrl()`方法，将canvas转换为base64编码的格式,然后存储到服务器，这时候巨坑来了，因为忘记了Google用了百度，再加上微信调试的困难，熬夜到三点都没解决这个问题，恐怖如斯。当使用微信头像，然后调用`toDataUrl`时，会提示图片跨域，禁止调用此方法。虽然这是canvas的安全措施，但还是一阵阵的蛋疼。网上的解决办法是，先设置图片的属性`img.crossOrigin = "Anonymous";`然后在服务器那边设置允许跨域。我的解决办法是：因为图片地址是后台提供的，就让后台处理图片为base64编码，然后传给我，然后顺利解决。本地图片也属于跨域，所以在读取本地图片的时候用了js的fileReader对象,直接将图片读取为base64编码格式：

```
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
```  

-  然后便是用户分享，普通的分享很容易实现，通过微信提供的接口便ok。但是现在微信禁止这种游戏推广分享。然后便是通过这种方:
	![image](http://cdn1.showjoy.com/images/cf/cfb934b73f134d75b7422f72be5af4d0.jpg)<br/>
	用户通过长按保存分享图片，自己分享到朋友圈，用户的朋友通过识别图中二维码来打开化妆链接。二维码生成用了jquery的qrcode插件。图片的生成过程为：先通过canvas拼接成整张图片，然后将canvas转换为图片展示在浏览器内，用户便可以通过长按保存。
	
-  用户的朋友点开链接开始为用户化妆，整个化妆页面分为两个部分：
	![image](http://cdn1.showjoy.com/images/12/128a92bbec9b4d7ca089d0cb91fdb543.jpg) ![image](http://cdn1.showjoy.com/images/a0/a0081c52f0614bd795513da94a305167.jpg) <br/>
	其中间有loading页面。整个页面的流程如下：
	*  判断用户是否微信登录
	*  登录后调用入口函数`startHome()`;绑定跳转动画`changeAnimation()`;
	*  用户点击开始化妆，调用`changeAnimation()`进行转场动画，进入loading页面
	*  调用转场动画后进行所有所需图片加载，通过`new ImageLoader()`实现.当所有图片加载完成后,进行画布初始化绘制，再次调用`changeAnimation`函数进行转场动画到化妆主界面
	*  用户选择所需画笔，通过不同的标志将不同的化妆配置信息(粗细，透明等)填入myDraw()对象中。然后用户便可进行绘制。
	*  绘制完成后，用户点击保存，绘制完成的图片便存入分享用户的库里。为了避免图片跨域导致`toDataUrl()`被禁用。化妆主图在加载时便直接让后台传过来base64编码。

-  `changeAnimation()`动画用了creates的`DOMElement`方法，将整个页面当做一个画布元素来处理，可以更加方便的执行绚丽的动画……不过设计嫌太闪了，就让我用简单的动画(⊙o⊙)…就很尴尬。

-  一个必须提的是图片加载，一个很难解决的问题是图片加载次序的问题，同时加载多张图片，并不能确定哪张图片先加载完，这就对后面的引用造成了很大的影响。一个很low的解决办法是加载完一张再一张，一层一层的回调，想想就恐怖。或者给每张需要加载的图片一个标志，通过标志来引用。不过对于成组的元素来说很麻烦。我在这里使用的`createjs`的`preloader.js`,一个专门用于预加载的库，设置`preload.setMaxConnections(1)`，这样就可以按顺序加载了，优雅很多。 

-  有一个很蛋疼的问题。设计给的化妆台是这样的：
	![image](http://cdn1.showjoy.com/images/95/95d0088f5f284134871494f98feef857.png)<br/>留的化妆的区域并不是长方形，这就造成了很大的困扰。为了效果好的话，将canvas元素放到化妆台图片的下面![image](http://cdn1.showjoy.com/images/a0/a0081c52f0614bd795513da94a305167.jpg)<br/>但这样就进行不了绘制，事件会被化妆台image阻挡。不让它挡住将canvas放到image的上方![image](http://cdn1.showjoy.com/images/8f/8f74a7de0ef64e028c995ae47feab6fa.jpg)<br/>但这样就很丑。一开始想到的解决方案是，在图片的底下放一个canvas，然后在图片的上方放一个透明的canvas进行绘制。想法是好的，但现实是骨感的，不知道是我的代码的问题还是canvas本身的问题，在透明的背景上不能绘制有透明度的元素，所有透明度设置都无效。最后想到了一个曲折的解决方案，还是先将一个背景canvas放到图片下面，然后再在上方放一个canvas，对这个canvas做如下处理，首先先绘制一个这样的图形：![image](http://cdn1.showjoy.com/images/bc/bccc8a875103439f852873d4ea8228ef.jpg)<br/>然后将这个图形缓存，将这个图形作为绘制图片的蒙版滤镜：
	
	```
	var alphaMaskFilter = new createjs.AlphaMaskFilter(alphaMask.cacheCanvas);
  data.bitmap.filters = [alphaMaskFilter];
	```	
	这样图片便只会渲染在这个图形的缓存区域，便不会覆盖住左下和右下的化妆瓶区域。这样的解决方案还是有一个小瑕疵，就是左下和右下的区域画笔还是能画上去的，这个是真的想不出办法了，恐怖。

-  撤销的实现方法如下：<br/>
	首先是每当mouseDown，新建一个`Container`用来存储此次绘制的内容，当点击撤销的时候，便从后先前删除Container.

-  橡皮擦功能的实现：<br/>
	橡皮擦其实并不是真正的擦掉绘制的内容，而是在已经绘制的画布上面再绘制一层图片，实现方法和化妆台的解决方法类似，显示绘制一个shape，然后将这个图形作为图片的蒙版滤镜，不停绘制，不停刷新，就搞定了。
	
-  最后一步，将化妆完后的canvas保存为图片上传，因为之前蒙版的原因导致背景图是不规则形状的，解决这个的办法是，`stage.removeChildAt(0)`，然后新建一张被背景图,再`addChildAt(bitmap,0)`，这样完整的图片便搞定了。在图片上传完执行success回调的时候，刷新这个页面，并定位到用户画的图片的位置。最后的三个bug，第一个是，android执行reload()方法后并不能真正的刷新页面，解决这个问题的方法是在url后面拼一个无关紧要的时间戳，然后刷新页面成功了，刷新完页面之后锚点定位的判别是：先取当前url判断是否存在时间戳，有的话就定位到card最上方。第二个bug是在时间戳后面加上#id锚点定位以后，再加时间戳并不能继续刷新页面，解决方法是对url进行处理，删除id之后的所有内容。第三个bug是微信会在分享的链接后面自动拼接上`&from=singlemessage&isappinstalled=0`，最坑爹的是你把分享发到mac上在浏览器里打开的链接是没有这个链接的，是真的蛋疼。解决方法如下，对url进行处理。
