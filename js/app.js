angular.module('modelingApp',['ngMaterial'])

.controller("MainCtrl", ['$scope', '$mdDialog', function($scope,$mdDialog) {
	$scope.fileName = "";
	$scope.imgData;
	$scope.binaryData;
	$scope.ready = false;

	$scope.showConfirm = function(ev) {
    	// Appending dialog to document.body to cover sidenav in docs app
    	var confirm = $mdDialog.confirm()
          .title('Would you like to to render this 3D model?')
          .textContent('The 3D model will be rendered in a few seconds...')
          .ariaLabel('Lucky day')
          .targetEvent(ev)
          .ok('Confirm')
          .cancel('Cancel');
	    $mdDialog.show(confirm).then(function() {
	      $scope.draw3dModel();
	    }, function() {
	    });
	 };

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

		document.getElementById('fileInput').click();
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

		console.log("Draw it now!" );
		init($scope.binaryData);
		render();
		$scope.ready = true;
		console.log("3D model is constructed.");

	};
	/*
		Optimize the dataset by reducing the number of cubes needed
	*/
	$scope.optimizeDataset = function(dataInput){
		var dataset = dataInput;
		
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

	//Camera location
	$scope.xPlus = function() {
		camera.position.x += 50;
	};
	$scope.xMinus = function() {
		camera.position.x -= 50;
	};

	$scope.yPlus = function() {
		camera.position.y += 50;
	};
	$scope.yMinus = function() {
		camera.position.y -= 50;
	};

	//Camera rotation:
	$scope.threeDPlus = function(){
		camera.rotation.x += 0.1;
	};
	$scope.threeDMinus = function(){
		camera.rotation.x -= 0.1;
	};
	$scope.rotate = function(){
		camera.rotation.z += Math.PI / 2;
	};
	


	//Mesh Depth
	$scope.depthPlus = function() {
		overalMesh.position.z += 100;
	};
	$scope.depthMinus = function() {
		overalMesh.position.z -= 100;
	};
	//Mesh scale
	$scope.scalePlus = function() {
		var scale = overalMesh.scale.x + 0.1;
		overalMesh.scale.set(scale, scale, scale)
	};
	$scope.scaleMinus = function() {
		var scale = overalMesh.scale.x - 0.1;
		overalMesh.scale.set(scale, scale, scale)
	};

	
}]);


/**
	Three JS code that renders the 3D model
**/
//Global objects
var scene;
var camera;
var renderer;
var overalMesh

/*
	Initialize the the scene with cubes merged into geometry.
*/
var init = function(blockMap) {
	var cubeX = 1;
	var cubeY = 1;
	var cubeZ = 25;   

	scene = new THREE.Scene();
	camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 20000 );

	camera.position.x = window.innerWidth/2;
	camera.position.y = window.innerHeight/2;
	camera.position.z = 100;

	var directionalLight = new THREE.DirectionalLight( 0x00ff00, 1 );
	directionalLight.position.set( 0, 1, 0 );
	scene.add( directionalLight );

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight); 

	document.body.appendChild( renderer.domElement );

	var mats = [];
	mats.push(new THREE.MeshBasicMaterial({color: 0xbcbfa4}));//RIGHT:dark white
	mats.push(new THREE.MeshBasicMaterial({color: 0xbcbfa4})); //LEFT: dark white
	mats.push(new THREE.MeshBasicMaterial({color: 0xbcbfa4}));//Back: dark white
	mats.push(new THREE.MeshBasicMaterial({color: 0xd0d3b7}));//Front: white
	mats.push(new THREE.MeshBasicMaterial({color: 0x5b5b5b}));//TOP: Grey
	mats.push(new THREE.MeshBasicMaterial({color: 0x0000}));//Bottom:black
	var faceMaterial = new THREE.MeshFaceMaterial(mats);

	var len = 0;
	var overalGeometry = new THREE.Geometry();
	for (var row = 0; row < blockMap.length; row++) {
		for (var col = 0; col < blockMap[row].length; col++) {
			if (blockMap[row][col] != 0 && blockMap[row][col] != "M"){
				len = (blockMap[row][col].split(":"))[1];
				var geometry = new THREE.BoxGeometry(len, len, cubeZ);
				var cube = new THREE.Mesh( geometry, faceMaterial );

				cube.position.x = row + len/2.0;
				cube.position.y = col + len/2.0;
				
				cube.updateMatrix();
				overalGeometry.merge(cube.geometry, cube.matrix);
			}
		}
	}
	overalMesh = new THREE.Mesh(overalGeometry, faceMaterial);
	scene.add(overalMesh);
	
	//var controls = new THREE.OrbitControls(camera, renderer.domElement );
};


var render = function () {
	requestAnimationFrame( render );
	renderer.render(scene, camera);
};








