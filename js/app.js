angular.module('modelingApp',['ngMaterial'])

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
			argb += (pixels[pixel] & 0xff) << 16; // red
			argb += (pixels[pixel + 1] & 0xff) << 8; // green
			argb += (pixels[pixel + 2] & 0xff); // blue
			argb += (pixels[pixel + 3] & 0xff) << 24; // alpha
			
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
		$scope.binaryData  = $scope.optimizeDataset($scope.binaryData);

		console.log("draw it now!" );
		init($scope.binaryData);
		render();
		$scope.ready = true;
		console.log("It works here");

	};
	/*
		Optimize the dataset by reducing the number of cubes needed
	*/
	$scope.optimizeDataset = function(dataInput){
		/*
		var dataset = [[1,1,1,1,1],
					[1,1,1,1,1],
					[0,0,1,1,1],
					[1,1,1,0,1],
					[1,1,1,0,1]];	
					*/
		var dataset = dataInput;
		
		console.log("START!");
		/*
		for(var i = 0; i < dataset.length; i++) {
			console.log(dataset[i]);
		}*/
		
		var height = dataset.length;
		var width = dataset[0].length;
		var length = 1;
		var stack = [];
		var newStack = [];
		var head = {val:dataset[0][0],x:0,y:0};
		stack.push(head);
		
		//Optimize a square that the 'head' is currently in
		var optimizeSquare = function() {
			while (stack.length > 0) {
				var validSquare = true;
				for (var i = 0; i < stack.length; i++) {
					var item = stack[i];
					var x = item.x;
					var y = item.y;
					if (x + 1 < height && y + 1 < width && dataset[x + 1][y] != 0 &&
						dataset[x][y + 1] != 0 && dataset[x + 1][y + 1] != 0) {
						if (dataset[x][y+1] != "M") {
							dataset[x][y+1] = "M";
							newStack.push({val:dataset[x][y+1], x:x, y:y+1});
						}
						if (dataset[x+1][y] != "M") {
							dataset[x+1][y] = "M";
							newStack.push({val:dataset[x+1][y], x:x+1, y:y});
						}
						if (dataset[x+1][y+1] != "M") {
							dataset[x+1][y+1] = "M";
							newStack.push({val:dataset[x+1][y+1], x:x+1, y:y+1});
						}
					} else {
						validSquare = false;
						break;
					}
				}
				if (validSquare) {
					length++;
				} else {
					while (newStack.length > 0){
						var item = newStack.pop();
						dataset[item.x][item.y] = 1;
					}
				}
				dataset[head.x][head.y] = "L:"+length;
				stack = newStack;
				newStack = [];
				
			}//end while
			
			
		};
		
		//Find next possible head
		var findNextHead = function(){
			var foundHead = false;
			var i = head.x;
			var j = head.y;
			for (; i < height && !foundHead; i++) {
				for (; j < width && !foundHead; j++) {
					if (dataset[i][j] == 1) {
						head = {val:dataset[i][j],x:i,y:j};
						stack.push(head);
						length = 1;
						foundHead = true;
					} 
				}
				j = 0;
			}
			return foundHead;
			console.log("Start new Head at :" + head.x + " " + head.y);	
		};

		while (head.x < height || head.y < width) {
			optimizeSquare();			
			if (!findNextHead()) {
				console.log("Map Optimization completed!");
				break;
			}

		}

		return dataset;
	};
}]);


/*
	Three JS code that renders the 3D model
*/
var scene;
var camera;
var renderer;

var init = function(blockMap) {
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


var mats = [];
mats.push(new THREE.MeshBasicMaterial({color: 0xbcbfa4}));//RIGHT:dark white
mats.push(new THREE.MeshBasicMaterial({color: 0xbcbfa4})); //LEFT: dark white
mats.push(new THREE.MeshBasicMaterial({color: 0xbcbfa4}));//Back: dark white
mats.push(new THREE.MeshBasicMaterial({color: 0xd0d3b7}));//Front: white
mats.push(new THREE.MeshBasicMaterial({color: 0x5b5b5b}));//TOP: Grey
mats.push(new THREE.MeshBasicMaterial({color: 0x0000}));//Bottom:black
var faceMaterial = new THREE.MeshFaceMaterial(mats);

//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


//var geometry = new THREE.BoxGeometry( cubeX, cubeY, cubeZ );
//var material = new THREE.MeshBasicMaterial( { color: 0xd0d3b7, wireframe: false, wireframeLinewidth: 10, map:texture} );
material = faceMaterial;
var controls = new THREE.OrbitControls( camera, renderer.domElement );


for (var row = 0; row < blockMap.length; row++) {
	console.log(blockMap[row]);
	for (var col = 0; col < blockMap[row].length; col++) {
		
		if (blockMap[row][col] != 0 && blockMap[row][col] != "M"){
			var len = (blockMap[row][col].split(":"))[1];
			var geometry = new THREE.BoxGeometry( len, len, cubeZ );
			var cube = new THREE.Mesh( geometry, material );

			cube.position.x = row + len/2.0;
			cube.position.y = col + len/2.0;
			scene.add(cube);
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








