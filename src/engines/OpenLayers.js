OpenLayers.Layer.Buildings = OpenLayers.Class(OpenLayers.Layer, {

    CLASS_NAME: 'OpenLayers.Layer.Buildings',

    name: 'OSM Buildings',
    attribution: OSMBuildings.ATTRIBUTION,

    isBaseLayer: false,
    alwaysInRange: true,

    initialize: function (options) {
        options.projection = 'EPSG:900913';
        OpenLayers.Layer.prototype.initialize(this.name, options);
        this.osmb = new OSMBuildings(options.url);
    },

    updateOrigin: function () {
        var
            origin = this.map.getLonLatFromPixel(new OpenLayers.Pixel(0, 0)),
            res = this.map.getResolution(),
            x = ~~((origin.lon - this.maxExtent.left) / res),
            y = ~~((this.maxExtent.top - origin.lat) / res)
        ;
        this.osmb.setOrigin(x, y);
    },

    setMap: function (map) {
        if (!this.map) {
            OpenLayers.Layer.prototype.setMap(map);
            this.osmb.createCanvas(this.div);
            var newSize = this.map.getSize();
            this.osmb.setSize(newSize.w, newSize.h);
            this.osmb.setZoom(this.map.getZoom());
            this.updateOrigin();
            this.osmb.loadData();
        }
    },

    removeMap: function (map) {
        this.osmb.destroyCanvas();
        OpenLayers.Layer.prototype.removeMap(map);
    },

    onMapResize: function () {
        OpenLayers.Layer.prototype.onMapResize();
        var newSize = this.map.getSize();
        this.osmb.setSize(newSize.w, newSize.h);
        this.osmb.render();
    },

    moveTo: function (bounds, zoomChanged, dragging) {
        var result = OpenLayers.Layer.prototype.moveTo(bounds, zoomChanged, dragging);
        if (!dragging) {
            var offsetLeft = parseInt(this.map.layerContainerDiv.style.left, 10);
            var offsetTop = parseInt(this.map.layerContainerDiv.style.top, 10);
            this.div.style.left = -offsetLeft + 'px';
            this.div.style.top = -offsetTop + 'px';
        }

        if (zoomChanged){
//            this.osmb.setZoom(this.map.getZoom());
//            if (this.osmb.rawData) {
//                this.osmb.data = this.osmb.scaleData(osmb.rawData);
//            }
            this.osmb.onZoomEnd({ zoom: this.map.getZoom() });
        }

        this.updateOrigin();
        DX = 0;
        DY = 0;
        this.osmb.setCamOffset(DX, DY);
        this.osmb.render();
        this.osmb.onMoveEnd({});
        return result;
    },

    DX: 0,
    DY: 0,

// rel values. make them abs
    moveByPx: function (dx, dy) {
        DX += dx;
        DY += dy;
        var result = OpenLayers.Layer.prototype.moveByPx(dx, dy);
        this.osmb.setCamOffset(DX, DY);
        this.osmb.render();
        return result;
    }
});
