angular.module("modelingApp", [])
.controller("MainCtrl", ['$scope', function($scope) {
	$scope.fileName = "";
	$scope.imgData;
	$scope.binaryData;
	$scope.ready = false;

	/* 
		Pick File, Draw Image and obtain image data
	*/
	$scope.convertImageToData = function() {
		var fileInput = document.getElementById('fileInput');
		fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0];
			var textType = /png.*/;
			if (file.type.match(textType)) {
					
				var ctx = document.getElementById('canvas').getContext('2d');
				var img = new Image();
				img.onload = function() {
					ctx.canvas.width = img.width;
					ctx.canvas.height = img.height;
				    ctx.drawImage(img, 0,0, img.width, img.height);
				    //Retrieve data
				    $scope.imgData = ctx.getImageData(0, 0, img.width, img.height);
				    $scope.fileName = file.name;
				    //Convert to binary format
				    $scope.convertDataToBinaryArray($scope.imgData);
				    $scope.$apply();
				}
				img.src = URL.createObjectURL(file);
				
			} else {
				console.log("File not supported!");
			}
			
		});	
	};
	/*
		Convert RGBA data into binary array
	*/
	$scope.convertDataToBinaryArray = function(data){
		var pixels = data.data;
      	var width = data.width;
      	var height = data.height;
		var pixelLength = 4;
		var result = new Array(height);
		result[0] = new Array(width);
		for (var pixel = 0, row = 0, col = 0; pixel < pixels.length; pixel += pixelLength) {
			var argb = 0;
			/*
			argb += (pixels[pixel] & 0xff) << 24; // alpha
			argb += (pixels[pixel + 1] & 0xff); // blue
			argb += (pixels[pixel + 2] & 0xff) << 8; // green
			argb += (pixels[pixel + 3] & 0xff) << 16; // red
			*/
			argb += (pixels[pixel] & 0xff) << 16; // red
			argb += (pixels[pixel + 1] & 0xff) << 8; // green
			argb += (pixels[pixel + 2] & 0xff); // blue
			argb += (pixels[pixel + 3] & 0xff) << 24; // alpha
			
			
			

			//result[row][col] = argb;
			result[row][col] = argb <= -16700000 ? 1 : 0;
			col++;
			if (col == width && pixel < pixels.length - 4) {
				col = 0;
				row++;
				result[row] = new Array(width);
			}
		}
		$scope.binaryData = result;

	};

	//Render 3D model with three.js
	$scope.draw3dModel = function(){
		console.log("draw it now!" );
		init($scope.binaryData);
		render();
		$scope.ready = true;
		console.log("It works here");
	};
}]);


var scene;
var camera;
var renderer;


var init = function(binaryData) {
var cubeX = 1;
var cubeY = 1;
var cubeZ = 50;   

scene = new THREE.Scene();
scene.position.x = -700;
scene.position.y = -250;
scene.position.z = -100;

scene.position.z = -400;
scene.rotation.x = 0.15;

camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000 );
/*
camera.position.x = 0;
camera.position.y = 0;
camera.position.z =  600;
*/

camera.position.x = 0; 
camera.position.y = -600;
camera.position.z =  730;
camera.rotation.x = 0.6;//0.6
camera.rotation.y = 0;
camera.rotation.z = 0; 


//camera.up = new THREE.Vector3(0,0,1);
//camera.lookAt(new THREE.Vector3(0,0,0));
 
var directionalLight = new THREE.DirectionalLight( 0x00ff00, 1 );
directionalLight.position.set( 0, 1, 0 );
scene.add( directionalLight );

var geometry = new THREE.PlaneGeometry( 8192, 8192, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
var plane = new THREE.Mesh( geometry, material );
scene.add( plane );

renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight ); 
document.body.appendChild( renderer.domElement );


//var texture = THREE.ImageUtils.loadTexture('resource/block.jpg');
var mats = [];
mats.push(new THREE.MeshBasicMaterial( { color: 0xbcbfa4} ));//RIGHT:dark white
mats.push(new THREE.MeshBasicMaterial({color: 0xbcbfa4})); //LEFT: dark white
mats.push(new THREE.MeshBasicMaterial({color: 0xbcbfa4}));//Back: dark white
mats.push(new THREE.MeshBasicMaterial({color: 0xd0d3b7}));//Front: white
mats.push(new THREE.MeshBasicMaterial({color: 0x5b5b5b}));//TOP: Grey
mats.push(new THREE.MeshBasicMaterial({color: 0x0000}));//Bottom:black
var faceMaterial = new THREE.MeshFaceMaterial(mats);

//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


var geometry = new THREE.BoxGeometry( cubeX, cubeY, cubeZ );
//var material = new THREE.MeshBasicMaterial( { color: 0xd0d3b7, wireframe: false, wireframeLinewidth: 10, map:texture} );
material = faceMaterial;
var controls = new THREE.OrbitControls( camera, renderer.domElement );


var blockMap = binaryData;

//var length = blockMap.length;
for (var row = 0; row < blockMap.length; row++) {
	for (var col = 0; col < blockMap[row].length; col++) {
		if (blockMap[row][col] > 0){
			var cube = new THREE.Mesh( geometry, material );
			cube.position.x = row;
			cube.position.y = col;
			scene.add( cube );
		}
	}
}

};


var render = function () {
	requestAnimationFrame( render );
	/*
	console.log(camera.position);
	console.log("[cam - POS - ROT")
	console.log(camera.rotation);
	console.log("]CAM---------SCENE[");
	console.log(scene.position);
	console.log("scene - POS - ROT]")
	console.log(scene.rotation);
	*/
	renderer.render(scene, camera);
};








