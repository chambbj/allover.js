var Pointspace = Pointspace || {};
Pointspace.viewer = {};

(function() {

    function windowInnerWidth() {
        return window.innerWidth;
    }
    function windowInnerHeight() {
        return window.innerHeight - 200;
    }

    var DEFAULT_POINT_SIZE = 2;
    var MIN_POINT_SIZE = 1;
    var MAX_POINT_SIZE = 10;
    var WIDTH = windowInnerWidth();
    var HEIGHT = windowInnerHeight();

    var windowHalfX = WIDTH / 2;
    var windowHalfY = HEIGHT / 2;

    var VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;


    this.run = function(url, container, options) {

        this.init(url, container, options);
        this.loadPoints();
        this.animate();

    };

    this.init = function(url, container, options) {

        var that = this;
        this.url = url;
        this.container = $(container);
        this.points = [];
        this.firstLoad = true;
        this.selectedColors = null;
        this.pointBuckets = [];
        this.scales = {
            height: null, intensity: null, pcid: null, classification: null
        };

        // defaults

        var defaultOptions = {
            stats: true,
            progressBar: true,
            buttonClass: 'btn'
        };
        if (typeof options === 'object') {
            options = $.extend(defaultOptions, options);
        } else {
            options = defaultOptions;
        }

        // internals

        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer();
        this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.controls = new THREE.QTControls(this.camera, this.container[0]);
        this.material = new THREE.ParticleBasicMaterial({
            depthTest: false,
            transparent: true,
            size: DEFAULT_POINT_SIZE,
            vertexColors: true //allows 1 color per particle
        });

        if (options.stats) {
            this.stats = new Stats();
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.top = '0px';
            this.container.append(this.stats.domElement);
        } else {
            this.stats = null;
        }

        if (options.progressBar) {
            this.progressBar = {
                wrapper: $('<div class="grid-progressBar-wrapper"></div>'),
                element: $('<div class="grid-progressBar" style="display: none;"></div>'),
                coloredBar: $('<div class="grid-progressBar-color"></div>'),
                statusText: $('<div class="grid-progressBar-status">Loading</div>')
            };
            this.progressBar.wrapper.insertAfter(this.container);
            this.progressBar.statusText.appendTo(this.progressBar.wrapper);
            this.progressBar.element.appendTo(this.progressBar.wrapper);
            this.progressBar.coloredBar.appendTo(this.progressBar.element);
        } else {
            this.progressBar = null;
        }

        this.colorControls = $('<div class="grid-colorControls">Colorize by: </div>');
        this.colorControls.insertAfter(this.container)
            .append($('<a data-colorize="imagery">Imagery</a>'))
            .append($('<a data-colorize="intensity">Intensity</a>'))
            .append($('<a data-colorize="height">Height</a>'))
            .append($('<a data-colorize="pcid">Pointcloud id</a>'))
            .append($('<a data-colorize="classification">Classification</a>'))
            .on('click', 'a', function(event) {
                var colorize = $(this).data('colorize');
                that.colorizePointsBy(colorize);
            })
            .find('a').addClass(options.buttonClass);


        this.resetViewButton = $("<a>Reset view</a>").addClass(options.buttonClass);
        this.pointSizeText = $("<span></span>")
            .attr('style', 'margin-left: 30px');
        this.pointSizeSlider = $("<div></div>")
            .attr('style', 'width: 200px; display: inline-block; margin: 0 20px')
            .slider({
                min: MIN_POINT_SIZE,
                max: MAX_POINT_SIZE,
                value: DEFAULT_POINT_SIZE,
                slide: function(event, ui) {
                    that.updatePointSize(ui.value);
                }
            });
        this.updatePointSize(DEFAULT_POINT_SIZE);
        container.on('keydown', function(event) { that.updatePointSizeWithKeys(event, that); });
        this.cameraControls = $('<div class="grid-cameraControls">Camera controls: </div>')
            .insertAfter(this.container)
            .append(this.resetViewButton)
            .append(this.pointSizeText)
            .append(this.pointSizeSlider);

        this.classificationLegend = $("<div></div>").attr('style', 'position: absolute; top: 0; right: 40px; padding-top: 10px;')
            .appendTo(container);


        window.addEventListener('resize', function() { that.resizeWindow(); }, false);
        this.setRequestAnimFrame();

    };

    this.animate = function() {
        this.renderer.setSize(WIDTH, HEIGHT);
        this.container.append(this.renderer.domElement);
        this.clock.start();

        (function animloop(){
            window.requestAnimFrame($.proxy(animloop, this));
            this.render();
        }.apply(this));
    };

    this.render = function() {
        this.renderer.render(this.scene, this.camera);
        this.controls.update(this.clock.getDelta());
        this.stats.update();
        if (Pointspace.boundingbox.initialized) {
            Pointspace.boundingbox.render();
        }
    };

    this.setRequestAnimFrame = function() {
        // @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        window.requestAnimFrame = (function(){
            return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function(callback, element) {
                    window.setTimeout(callback, 1000 / 60);
                };
        }());
    };

    this.loadPoints = function (pk) {
        var url = this.url;
        if (typeof pk !== 'undefined') { url += '?cache_key=' + pk; }

        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {
                if (!data.points) {
                    this.progressBar.wrapper.html("Loaded!");
                    var that = this;
                    setTimeout(function() { that.progressBar.wrapper.hide(); }, 5000);
                    return;
                }
                var points = data.points.split('\n');
                delete data.points;
                var headers = points.splice(0, 1)[0].split(',');
                for (var i = headers.length - 1; i >= 0; i--) {
                    headers[i] = headers[i].replace(/"/g, '');
                }
                this.pointloader(headers, points, data);
            },
            context: this
        });
    };

    this.pointloader = function(headers, rawpoints, data, rawpointcounter, pointBucket) {
        var that = this;
        var vector;
        if (typeof rawpointcounter === 'undefined') {
            rawpointcounter = 0;
        }
        if (typeof pointBucket === 'undefined') {
            pointBucket = {
                geometry: new THREE.Geometry(),
                intensities: [],
                pcids: [],
                classifications: [],
                colors: {
                    imagery: [],
                    intensity: [],
                    height: [],
                    pcid: [],
                    classification: []
                }
            };
        }
        var loadPercent = Math.round(rawpointcounter * 100 / rawpoints.length);
        this.progressBar.statusText.html("Loading slice " + (data.offset + 1) +
            " of " + data.decimation + ":");
        this.progressBar.element.show();
        this.progressBar.coloredBar.attr('style', 'width: ' + loadPercent + '%');
        var loadInterval = this.firstLoad ? rawpoints.length / 10 : 100;
        for (var i = 0; i < loadInterval && rawpoints.length > rawpointcounter; i++, rawpointcounter++) {
            var line = rawpoints[rawpointcounter];
            if (!line) { continue; }
            var rowvalues = line.split(',');
            var row = {};
            for (var j = rowvalues.length - 1; j >= 0; j--) {
                row[headers[j]] = parseFloat(rowvalues[j]);
            }

            vector = new THREE.Vector3(row.X, row.Y, row.Z);
            pointBucket.geometry.vertices.push(vector);

            if (this.firstLoad) {
                pointBucket.intensities.push(row.Intensity);
                pointBucket.pcids.push(row.PointSourceId);
                pointBucket.classifications.push(row.Classification);
            } else {
                this.pushColorsIntoPointBucket(pointBucket,{
                    height: row.Z,
                    intensity: row.Intensity,
                    pcid: row.PointSourceId,
                    classification: row.Classification
                });
            }

            var imageryColor = new THREE.Color();
            imageryColor.setRGB(row.Red / 256, row.Green / 256,
                row.Blue / 256);
            pointBucket.colors.imagery.push(imageryColor);

            if (row.Red !== 0 || row.Green !== 0 || row.Blue !== 0) {
                this.colorizedPoints = true;
            }
        }

        if (rawpoints.length > rawpointcounter) {
            setTimeout(function(){ that.pointloader(headers, rawpoints, data, rawpointcounter, pointBucket); }, 0);
            return;
        }

        // If it isn't the first load, the colors were set in the initial loop
        if (this.firstLoad) {
            this.setScalesFromPointBucket(pointBucket);

            for (var k = 0; k < pointBucket.geometry.vertices.length; k++) {
                this.pushColorsIntoPointBucket(pointBucket, {
                    height: pointBucket.geometry.vertices[k].z,
                    intensity: pointBucket.intensities[k],
                    pcid: pointBucket.pcids[k],
                    classification: pointBucket.classifications[k]
                });
            }
        }

        if (this.selectedColors === null) {
            if (this.colorizedPoints) {
                this.selectedColors = 'imagery';
            }
            else {
                // XXX Disable imagery button
                this.colorControls.find("[data-colorize=imagery]").attr('disabled', 'disabled');
                this.selectedColors = 'intensity';
            }
        }

        pointBucket.geometry.colors = pointBucket.colors[this.selectedColors];
        var particles = new THREE.ParticleSystem(pointBucket.geometry, this.material);
        this.scene.add(particles);

        this.pointBuckets.push(pointBucket);

        setTimeout(function() { that.loadPoints(data.pk); }, 0);
        this.progressBar.element.hide();
        this.progressBar.statusText.html("Getting next slice");

        if (!this.firstLoad) { return; }

        pointBucket.geometry.computeBoundingBox();
        var minx = pointBucket.geometry.boundingBox.min.x;
        var miny = pointBucket.geometry.boundingBox.min.y;
        var minz = pointBucket.geometry.boundingBox.min.z;
        var maxx = pointBucket.geometry.boundingBox.max.x;
        var maxy = pointBucket.geometry.boundingBox.max.y;
        var maxz = pointBucket.geometry.boundingBox.max.z;

        // Display axis
        var midx = (maxx - minx) / 2 + minx;
        var midy = (maxy - miny) / 2 + miny;
        var midz = (maxz - minz) / 2 + minz;


        this.controls.setInitialCenter(midx, midy, midz);

        this.resetViewButton.on('click', function() {
            that.controls.reset();
        });

        // Set up the scene's dimensions
        var xLineMat = new THREE.LineBasicMaterial({
            color: 0xcc0000, opacity: 0.5, linewidth: 1
        });
        var xLineGeom = new THREE.Geometry();
        xLineGeom.vertices.push(new THREE.Vector3(minx, midy, 0));
        xLineGeom.vertices.push(new THREE.Vector3(maxx, midy, 0));

        var yLineMat = new THREE.LineBasicMaterial({
            color: 0x0000cc, opacity: 0.5, linewidth: 1
        });
        var yLineGeom = new THREE.Geometry();
        yLineGeom.vertices.push(new THREE.Vector3(midx, miny, 0));
        yLineGeom.vertices.push(new THREE.Vector3(midx, maxy, 0));

        var zLineMat = new THREE.LineBasicMaterial({
            color: 0x00cc00, opacity: 0.5, linewidth: 1
        });
        var zLineGeom = new THREE.Geometry();
        zLineGeom.vertices.push(new THREE.Vector3(midx, midy, Math.min(0, minz)));
        zLineGeom.vertices.push(new THREE.Vector3(midx, midy, Math.max(0, maxz)));

        var xLine = new THREE.Line(xLineGeom, xLineMat);
        var yLine = new THREE.Line(yLineGeom, yLineMat);
        var zLine = new THREE.Line(zLineGeom, zLineMat);

        this.scene.add(xLine);
        this.scene.add(yLine);
        this.scene.add(zLine);

        Pointspace.boundingbox.init(this.container, this.scene, this.camera, pointBucket.geometry.boundingBox);

        this.firstLoad = false;
    };

    this.setScalesFromPointBucket = function(pointBucket) {
        // http://stackoverflow.com/questions/6299500/tersest-way-to-create-an-array-of-integers-from-1-20-in-javascript
        function range1(i, divisor)  {
            if (typeof(divisor) === 'undefined') {
                divisor = i;
            }
            return i>=0 ? range1(i-1, divisor).concat(i / 256):[];
        }
        var greyscale = range1(256);

        this.scales.height = d3.scale.quantile();
        this.scales.height.domain(pointBucket.geometry.vertices.map(function(v) { return v.z; }));
        this.scales.height.range(greyscale);

        this.scales.intensity = d3.scale.quantile();
        this.scales.intensity.domain(pointBucket.intensities);
        this.scales.intensity.range(greyscale);

        this.scales.pcid = d3.scale.category20();
        this.scales.classification = d3.scale.category20();
    };

    this.pushColorsIntoPointBucket = function(pointBucket, values) {
        var heightColor = new THREE.Color();
        var intensityColor = new THREE.Color();
        var pcidColor = new THREE.Color();
        var classificationColor = new THREE.Color();

        var heightColorValue = this.scales.height(values.height);
        var intensityColorValue = this.scales.intensity(values.intensity);
        var pcidColorValue = this.scales.pcid(values.pcid);
        var classificationColorValue = this.scales.classification(values.classification);

        heightColor.setRGB(heightColorValue, 0, 1 - heightColorValue);
        intensityColor.setRGB(intensityColorValue, intensityColorValue, intensityColorValue);
        this.setColorFromCssString(pcidColor, pcidColorValue);
        this.setColorFromCssString(classificationColor, classificationColorValue);

        pointBucket.colors.height.push(heightColor);
        pointBucket.colors.intensity.push(intensityColor);
        pointBucket.colors.pcid.push(pcidColor);
        pointBucket.colors.classification.push(classificationColor);
    };

    this.colorizePointsBy = function(key) {
        this.selectedColors = key;
        for (var i = this.pointBuckets.length - 1; i >= 0; i--) {
            var bucket = this.pointBuckets[i];
            bucket.geometry.colors = bucket.colors[key];
            bucket.geometry.colorsNeedUpdate = true;
        }
        if (this.selectedColors === 'classification') {
            this.updateClassificationLegend();
            this.classificationLegend.show();
        } else {
            this.classificationLegend.hide();
        }
    };

    this.updateClassificationLegend = function() {
        var value, color;
        var legend = $("<ul></ul>").attr('style', 'list-style: none')
            .append('<li><strong>Classification legend</strong></li>');
        for (var i = this.scales.classification.domain().length - 1; i >= 0; i--) {
            value = this.scales.classification.domain()[i];
            color = this.scales.classification(value);
            legend.append('<li><span class="grid-legendColor" ' +
                'style="height: 10px; width: 10px; display: inline-block; ' +
                'background-color: ' + color + '"></span> ' + value + '</li>');
        }
        this.classificationLegend.html(legend);
    };

    this.updatePointSize = function(value) {
        this.material.size = value;
        this.pointSizeText.html('Point size: ' + value);
    };

    this.updatePointSizeWithKeys = function(event, that) {
        var size;
        switch (event.which) {
            case 187: // equals
                size = that.material.size < MAX_POINT_SIZE ? that.material.size + 1 : MAX_POINT_SIZE;
                that.updatePointSize(size);
                that.pointSizeSlider.slider({ value: size });
                break;
            case 189: //
                size = that.material.size > MIN_POINT_SIZE ? that.material.size - 1 : MIN_POINT_SIZE;
                that.updatePointSize(size);
                that.pointSizeSlider.slider({ value: size });
                break;
        }
    };

    this.resizeWindow = function() {
        this.renderer.setSize(windowInnerWidth(), windowInnerHeight());
        this.camera.aspect = windowInnerWidth() / windowInnerHeight();
        this.camera.updateProjectionMatrix();
    };

    this.setColorFromCssString = function(color, cssColor) {
        color.setRGB(
            parseInt(cssColor.slice(1, 3), 16) / 256.0,
            parseInt(cssColor.slice(3, 5), 16) / 256.0,
            parseInt(cssColor.slice(5, 7), 16) / 256.0
        );
    };


}.apply(Pointspace.viewer));
