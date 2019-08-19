import { Component, OnInit } from '@angular/core';

//OpenLayer
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
// import TileWMS from 'ol/source/TileWMS';
import Stamen from 'ol/source/Stamen';
import GeoJSON from 'ol/format/GeoJSON';
import FullScreen from 'ol/control/FullScreen';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';

// service
import { MapService } from 'src/app/services/map.service';
import { WmsService } from 'src/app/services/wms.service';

// Model Entity
import { Layers } from 'src/app/entity/layers';

// Enum
import { RepositoryApi } from 'src/app/enums/repository-api.enum';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  private map;
  private merge4km;
  private PrecMedia_Bacias_N1;
  private waterColor;
  private toner;
  private osm;
  private terrain;

  value: number = 0;
  val1: number = 100;
  testep: boolean = false;
  public features = [];
  private jsonObj: Layers[];
  setMap: string = 'osm';
  private data;

  private valueDateInit: Date;
  private selectedLayer: any;


  constructor(private mapService: MapService, private wmsService: WmsService) {

  }

  ngOnInit() {
    this.initLayer();
    this.initDataAgora();
    this.initilizeMap();
  }

  ngDocheck() {

  }

  ngAfterContentInit() {
  }

  initDataAgora() {
    var dataNow = new Date(Math.round(Date.now() / 3600000) * 3600000 - 3600000 * 3);
    var dia = dataNow.getDate();
    var mes = dataNow.getMonth();
    var ano = dataNow.getFullYear();
    this.data = ano + '-' + mes + '-' + dia
  }


  initilizeMap() {

    let interval = setInterval(() => {
      this.value = this.value + Math.floor(Math.random() * 10) + 1;
      if (this.value >= 100) {
        this.value = 100;
        this.testep = true;
        // this.messageService.add({severity: 'info', summary: 'Success', detail: 'Process Completed'});
        clearInterval(interval);
      } else if (this.value >= 10) {
        // this.map.addLayer(this.pcd);
      } else if (this.value >= 5) {
        // this.map.addLayer(this.prec4km);
      } else if (this.value >= 2) {
        // this.map.addLayer(this.estado);
        // this.map.addLayer(this.baciashidrografica);
      }
    }, 2000);


    var interaction = new DragRotateAndZoom();

    var control = new FullScreen();

    this.osm = new TileLayer({
      preload: Infinity,
      visible: true,
      title: "osm",
      baseLayer: true,
      source: new OSM(),
      layer: 'osm',
    });


    this.waterColor = new TileLayer(
      {
        preload: Infinity,
        visible: false,
        title: "Watercolor",
        baseLayer: true,
        source: new Stamen({
          layer: 'watercolor'
        })
      });


    this.toner = new TileLayer(
      {
        preload: Infinity,
        title: "Toner",
        baseLayer: true,
        visible: false,
        source: new Stamen({
          layer: 'toner'
        })
      });


    this.terrain = new TileLayer(
      {
        preload: Infinity,
        title: "terrain",
        baseLayer: true,
        visible: false,
        source: new Stamen({
          layer: 'terrain'
        })
      });

    var center = [-6124801.2015823, -1780692.0106836];
    var view = new View({
      center: center,
      zoom: 4,
      // projection: 'EPSG:4326'
    });


    var layers = [this.osm, this.waterColor, this.toner, this.terrain];

    this.map = new Map({
      target: 'map',
      layers: layers,
      // interactions: [interaction],
      controls: [control],
      view: view
    });

    this.map.on('singleclick', function (evt) {
    });


    this.map.on('singleclick', function (evt) {
      this.defaultMap();

      var viewResolution = /** @type {number} */ (view.getResolution());
      var viewProjection = /** @type {number} */ (view.getProjection());
      var url = this.features['an_merge_monthly'].getGetFeatureInfoUrl(
        evt.coordinate, viewResolution, viewProjection, 'EPSG:4326',
        { 'INFO_FORMAT': 'text/javascript', 'propertyName': 'formal_en' });

      console.log(url);

      if (url) {
        var parser = new GeoJSON();
        document.getElementById('info').innerHTML =
          '<iframe allowfullscreen src="' + url + '"></iframe>';
      }
    });


    // ------------------------------------------------------------------------------------


    function changeMap() {
      console.log(this.selectedLayer.name)
      // console.log('name');
    }
  }


  private legenda(featuresLayer) {

    var url = RepositoryApi.geoserverTerraMaLocal + "REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&legend_options=forceLabels:on&LAYER={{LAYER_NAME}}&STYLE={{STYLE_NAME}}";
    url = url.replace('{{LAYER_NAME}}', featuresLayer.workspace + ":" + featuresLayer.layername);
    url = url.replace('{{STYLE_NAME}}', featuresLayer.workspace + ":" + featuresLayer.layername + '_style');
    if (url) {
      var parser = new GeoJSON();
      document.getElementById('info').innerHTML =
        '<iframe allowfullscreen height="800" src="' + url + '"></iframe>';
    }
  }

  private legendaToAEM() {
    try {
      var url = RepositoryApi.geoserverTerraMaLocal + "REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&legend_options=forceLabels:on&LAYER={{LAYER_NAME}}&STYLE={{STYLE_NAME}}";
      url = url.replace('{{LAYER_NAME}}', this.selectedLayer.workspace + ":" + this.selectedLayer.layername);
      url = url.replace('{{STYLE_NAME}}', this.selectedLayer.workspace + ":" + this.selectedLayer.layername + '_style');
      if (url) {
        var parser = new GeoJSON();
        document.getElementById('info').innerHTML =
          '<iframe allowfullscreen height="800" src="' + url + '"></iframe>';
      }
    } catch (e) {
      console.log(e.message);
    }
  }


  private setLayerType(featuresLayer) {
    if (this.features[featuresLayer.name].getVisible() == true) {
      this.features[featuresLayer.name].setVisible(false);
    } else {
      this.features[featuresLayer.name].setVisible(true);
    }
  }


  initLayer() {
    this.mapService.listar(RepositoryApi.smh_api + "/viewslayer").toPromise()
      .then((data: any) => {
        this.jsonObj = data;
        data.forEach(element => {
          console.log(element.name)
          console.log(element.uri.substring(23) + "/wms?")
          console.log(element.uri.replace("admin:geoserver@", "") + "/wms?")
          this.features[element.name] = this.wmsService.camadas(element);
          this.map.addLayer(this.features[element.name]);
        });
      });
  }


  private setMapType() {
    switch (this.setMap) {
      case 'osm':
        this.osm.setVisible(true); this.waterColor.setVisible(false); this.toner.setVisible(false); this.terrain.setVisible(false);
        break;
      case 'GEBCO':
        this.osm.setVisible(false); this.waterColor.setVisible(false); this.toner.setVisible(false); this.terrain.setVisible(false);
        break;
      case 'Watercolor':
        this.osm.setVisible(false); this.waterColor.setVisible(true); this.toner.setVisible(false); this.terrain.setVisible(false);
        break;
      case 'Toner':
        this.osm.setVisible(false); this.waterColor.setVisible(false); this.toner.setVisible(true); this.terrain.setVisible(false);
        break;
      case 'Terrain':
        this.osm.setVisible(false); this.waterColor.setVisible(false); this.toner.setVisible(false); this.terrain.setVisible(true);
        break;
    }
  }

  private salvar() {

  }

  private activeLayer(featuresLayer) {

    var group = this.map.getLayerGroup();
    var gruplayers = group.getLayers();
    var layers = this.map.getLayers().getArray();
    for (var i = 5; i < layers.length; i++) {
      var element = gruplayers.item(i);
      var name = element.get('title');
      this.features[name].setZIndex(0);
    }

    if (this.features[featuresLayer.name].getZIndex() == null || this.features[featuresLayer.name].getZIndex() == "") {
      console.log(featuresLayer.name);
      this.features[featuresLayer.name].setZIndex(1);
    } else {
      // this.features[featuresLayer].setZIndex("");
    }
  }

  private activeLayerAnTemporalMunicipal() {
    try {
      if (this.features[this.selectedLayer.name].getVisible() == true) {
        this.features[this.selectedLayer.name].setVisible(false);
      } else {
        this.features[this.selectedLayer.name].setVisible(true);
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  setLayer() {
    console.log("setLayer");
    console.log(this.selectedLayer);
    this.features[this.selectedLayer.name].getSource().updateParams({ 'TIME': this.valueDateInit.getFullYear() + "-" + (this.valueDateInit.getMonth() + 1) });
  }

  defaultMap() {
    this.map.setView(new View({
      center: [-6124801.2015823, -1780692.0106836], zoom: 4
    }));
  }

  dellLayer() {
    this.map.removeLayer(this.merge4km);
    this.map.removeLayer(this.PrecMedia_Bacias_N1);
  }
}