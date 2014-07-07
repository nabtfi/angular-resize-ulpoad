"use strict";

angular.module('fileUpload', [ 'angularFileUpload' ]);

var MyCtrl = [ '$scope', '$http', '$timeout', '$upload',  function($scope, $http, $timeout, $upload) {
	$scope.fileReaderSupported = window.FileReader != null;
	$scope.uploadRightAway = true;
	$scope.resize = !!window.CanvasRenderingContext2D;  //resize only if canvas2D is supported
	$scope.options = {};   //array of options to resize : default is {resizeMaxHeight : 150, resizeMaxWidth : 150, resizeQuality: 0.7, resizeType : image/jpeg}
	$scope.angularVersion = '1.2.15';
	$scope.errorMsg = null;

	$scope.hasUploader = function(index) {
		return $scope.upload[index] != null;
	};

	$scope.abort = function(index) {
		$scope.upload[index].abort(); 
		$scope.upload[index] = null;
	};
	
	$scope.onFileSelect = function($files) {
		$scope.selectedFiles = [];
		$scope.progress = [];
		if ($scope.upload && $scope.upload.length > 0) {
			for (var i = 0; i < $scope.upload.length; i++) {
				if ($scope.upload[i] != null) {
					$scope.upload[i].abort();
				}
			}
		}
		$scope.upload = [];
		$scope.uploadResult = [];
		$scope.selectedFiles = $files;
		$scope.dataUrls = [];
		for ( var i = 0; i < $files.length; i++) {
			var $file = $files[i];
			if (window.FileReader && $file.type.indexOf('image') > -1) {
				// load image as base64 (for preview)
				var fileReader = new FileReader();
				fileReader.readAsDataURL($files[i]);
				var loadFile = function(fileReader, index) {
					fileReader.onload = function(e) {
						$timeout(function() {
							$scope.dataUrls[index] = e.target.result;
							console.log('image chargée en base64 '+index);
							if ($scope.resize) {
								console.log('src '+i+':');
								// convert loaded image from base64 to binary (for upload)
								var image = new Image();
								image.src = URL.createObjectURL($files[index]);
								console.log('load in binary image '+image.src);
								image.onload = function() { // une fois le chargement fini, on lance le resize
									console.log('start resizing image '+image);
									$scope.selectedFiles[index] = $scope.resizeImage(image, $scope.options);
									console.log('Start upload resized image '+index);
									$scope.progress[index] = 50;
									if ($scope.uploadRightAway) {
										$scope.start(index);
									}
								}
							}
							else
							{
								$scope.progress[index] = -1;
								if ($scope.uploadRightAway) {
									$scope.start(index);
								}								
							}
						});
					}
				}(fileReader, i);

			} else {
				$scope.error = 'Erreur sur le type photo : il faut un fichier JPEG.'
			}
		}
	};
	
	$scope.start = function(index) {
		$scope.progress[index] = 0;
		$scope.errorMsg = null;
			$scope.upload[index] = $upload.upload({
				url : 'upload.php',     // URL to the page that will manage the files uploaded
				method: 'POST',
				headers: {'my-header': 'my-header-value'},
				data : {
					myModel : $scope.myModel
				},
				file: $scope.selectedFiles[index],
				fileFormDataName: 'image-file'
			}).then(function(response) {
				$scope.uploadResult=response;
				$scope.avatarSrc = $scope.avatarSrc+'?rand='+Math.random();
			}, function(response) {
				if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
			}, function(evt) {
				// Math.min is to fix IE which reports 200% sometimes
				$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			}).xhr(function(xhr){
				xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
			});
	};

	$scope.resizeImage = function (origImage, options) {
        var maxHeight = options.resizeMaxHeight || 150;
        var maxWidth = options.resizeMaxWidth || 150;
        var quality = options.resizeQuality || 0.7;
        var type = options.resizeType || 'image/jpeg';

        var resizeAreaId = 'fileupload-resize-area';
        var canvas = document.getElementById(resizeAreaId);
        if (!canvas) {
        	console.log('creation new canvas');
            canvas = document.createElement('canvas');
            canvas.id = resizeAreaId;
            canvas.style.visibility = 'hidden';
            document.body.appendChild(canvas);
        }

        var height = origImage.height;
        var width = origImage.width;
        console.log('define canvas dimensions '+width+'/'+height);
        // calculate the width and height, constraining the proportions
        if (width > height) {
            if (width > maxWidth) {
                height = Math.round(height *= maxWidth / width);
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = Math.round(width *= maxHeight / height);
                height = maxHeight;
            }
        }

        console.log('nouvelles dimensions '+width+'/'+height);
        canvas.width = width;
        canvas.height = height;
        
        //draw image on canvas
        var ctx = canvas.getContext("2d");
        console.log('start draw image in canvas ');
        ctx.drawImage(origImage, 0, 0, width, height);
        
        // get the data from canvas as 70% jpg (or specified type).
        console.log('get canvas data in base64');
        var base64 = canvas.toDataURL(type, quality);
        console.log('convert base64 to binary');
        return $scope.dataURItoBlob(base64);;
        
    };

	$scope.dataURItoBlob = function (dataURI) {
        'use strict'
        var byteString, 
            mimestring 

        if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
            byteString = atob(dataURI.split(',')[1])
        } else {
            byteString = decodeURI(dataURI.split(',')[1])
        }

        mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0]

        var content = new Array();
        for (var i = 0; i < byteString.length; i++) {
            content[i] = byteString.charCodeAt(i)
        }

        return new Blob([new Uint8Array(content)], {type: mimestring});
    }
    
	$scope.resetInputFile = function() {
		var elems = document.getElementsByTagName('input');
		for (var i = 0; i < elems.length; i++) {
			if (elems[i].type == 'file') {
				elems[i].value = null;
			}
		}
	};
} ];
