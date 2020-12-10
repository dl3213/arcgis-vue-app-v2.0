<template>
  <div id="arcgis" @click="mapClick">
    <div class="resClass" style v-show="resFlag">
      <div>
        <ul>
          <li v-for="item in queryRes" :key="item.attributes.OBJECTID">
            <a
              href="#"
              @click="toItem(item)"
            >{{item.attributes.OBJECTID}} ---- {{item.attributes.用地名称}}</a>
          </li>
        </ul>
      </div>
      <div id="echartsBox" class="echarts" style="height:100%;width:100%">
        <div ref="echarts" style="height:380px;width:480px;position: relative;"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { loadCss, loadModules } from "esri-loader";
import { Vue, Component, Watch } from "vue-property-decorator";
// 引入基本模板
let echarts = require("echarts/lib/echarts");
// 引入饼图组件
require("echarts/lib/chart/pie");
// 引入组件
require("echarts/lib/component/tooltip");
require("echarts/lib/component/toolbox");
require("echarts/lib/component/title");

@Component({
  name: "Arcgis"
})
export default class ArcGIS extends Vue {
  private myChart: any;
  private base: string[] = [
    "topo",
    "streets",
    "satellite",
    "hybrid",
    "dark-gray",
    "gray",
    "national-geographic",
    "oceans",
    "osm",
    "terrain",
    "dark-gray-vector",
    "gray-vector",
    "streets-vector",
    "streets-night-vector",
    "streets-navigation-vecto",
    "topo-vector",
    "streets-relief-vector"
  ];

  private resFlag: boolean = false;
  private queryRes: any = [];
  private baseMap: any = {
    // 底图配置对象
    basemap: "topo-vector" //from arcgis
    //spatialReference: new SpatialReference({ wkid: 4326 }) //默认
  };

  private featureLayerURL: string =
    "http://data.marsgis.cn/arcgis/rest/services/mars/guihua/MapServer/0";

  public view: any = {};

  private mapViewConfig: any = {
    center: [117.273, 31.663], //初始中心
    zoom: 14 //初始缩放
  };

  private gisView: any = null;
  private map: any = null;
  private gisAPI: any = {}; //gis 构造函数,所有模块引用处
  private ArcGIS: any = {}; // gis 实例
  private layers: any = null; //mapConfig.layers //图层
  private layersInstance: any = {};
  private inputPt: any = [];
  private totalDis: number = 0;
  private totalLenGraphic: any = null;
  private defaultFont: any = null;
  private defaultMarkSymbol: any = null;
  private graphicsLayer: any = null;
  private geoArr: any = [];
  private spatialReference: any = null;

  private geometryUrl: string =
    "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer";

  private gisModules: string[] = [
    //arcgisJS 模块引用
    "esri/Basemap",
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/SpatialReference",
    "esri/layers/FeatureLayer",
    "esri/widgets/BasemapToggle",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand",
    "esri/layers/WMTSLayer",
    "esri/layers/GeoJSONLayer",
    "esri/layers/WebTileLayer",
    "esri/config",
    "esri/core/urlUtils",
    "esri/widgets/CoordinateConversion",
    "esri/widgets/Sketch",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Locate",
    "esri/widgets/Track",
    "esri/widgets/Compass",
    "esri/geometry/geometryEngine", //!
    "esri/widgets/Search",
    "esri/symbols/TextSymbol",
    "esri/symbols/Font",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/tasks/support/LengthsParameters",
    "esri/tasks/GeometryService",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/tasks/support/Query",
    "esri/tasks/QueryTask"
  ]; //gis模块

  mounted() {
    //挂载钩子函数
    this.createMap(); //GIS初始化
    this.myChart = echarts.init((this as any).$refs.echarts);
  }
  beforeDestroy() {
    //容器销毁之前
    if ((this as any).view) {
      // destroy the map view
      (this as any).view.container = null;
    }
  }

  createMap() {
    //
    // 延迟加载所需的ArcGIS API for JavaScript模块和CSS(可选)
    loadModules(this.gisModules, {
      //加载模块
      // version: "3.31",//api版本
      //css: true,//css可选
      // url: "http://127.0.0.1:9001/4.13/init.js" //api引用资源为本地服务提供
    })
      .then(this.getAPI) //模块处理
      .then(this.init) //地图初始化
      .catch(err => {
        //错误抛出
        console.log(err);
      });
  }

  getAPI(args: any) {
    //根据模块引用名进行同名装载
    for (let k in args) {
      let name = this.gisModules[k].split("/").pop();
      this.gisAPI[name] = args[k];
    }
  }

  init() {
    //地图初始化
    const vueT = this; //4函数内部

    //跨域
    //this.gisAPI.config.defaults.io.alwaysUseProxy= false;
    this.gisAPI.urlUtils.addProxyRule({
      urlPrefix: "http://127.0.0.1:9000",
      proxyUrl: "http://localhost:9000"
    });

    let view: any;

    //天地图切片
    var tiledLayer = new this.gisAPI.WebTileLayer({
      urlTemplate:
        "http://{subDomain}.tianditu.gov.cn/DataServer?T=vec_w&x={col}&y={row}&l={level}&tk=313cd4b28ed520472e8b43de00b2de56",
      subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]
    });

    //天地图注记
    var tiledLayer_poi = new this.gisAPI.WebTileLayer({
      urlTemplate:
        "http://{subDomain}.tianditu.gov.cn/DataServer?T=cva_w&x={col}&y={row}&l={level}&tk=313cd4b28ed520472e8b43de00b2de56",
      subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]
    });

    //底图
    const map = new this.gisAPI.Map({
      basemap: {
        //将以上地图加入底图
        baseLayers: [tiledLayer, tiledLayer_poi]
      }
    });

    //视图view
    this.view = new this.gisAPI.MapView({
      container: this.$el, //页面元素挂载
      map: map, //加入地图
      ...this.mapViewConfig //视图初始配置
    });

    view = this.view;
    this.map = map;
    this.spatialReference = view.spatialReference;

    //低图选择器
    var basemapGallery = new this.gisAPI.BasemapGallery({
      view: view, //挂载视图
      container: document.createElement("div") //元素
    });
    var bgExpand = new this.gisAPI.Expand({
      view: view,
      content: basemapGallery
    });
    view.ui.add(bgExpand, "top-right"); //加入视图的右上部分

    // //添加点(位于图层graphicsLayer)
    // var point = {
    //    type: "point",
    //    longitude: 117.961,
    //    latitude: 32.47
    //  };

    //  var simpleMarkerSymbol = {
    //    type: "simple-marker",
    //    color: [226, 119, 40],  // orange
    //    outline: {
    //      color: [255, 255, 255], // white
    //      width: 1
    //    }
    //  };

    //  var pointGraphic = new this.gisAPI.Graphic({
    //    geometry: point,
    //    symbol: simpleMarkerSymbol,
    // attributes: attributes,
    // popupTemplate: popupTemplate
    //  });
    //  graphicsLayer.add(pointGraphic);

    //  //添加线(位于图层graphicsLayer)
    //   var simpleLineSymbol = {
    //    type: "simple-line",
    //    color: [226, 119, 40], // orange
    //    width: 2
    //  };

    //  var polyline = {
    //    type: "polyline",
    //    paths: [
    //      [117.961, 32.470],
    //      [118.971, 32.470],
    //      [118.991, 34.470]
    //    ]
    //  };

    //  var polylineGraphic = new this.gisAPI.Graphic({
    //    geometry: polyline,
    //    symbol: simpleLineSymbol
    //  })

    //  graphicsLayer.add(polylineGraphic);
    //  //添加多边形(位于图层graphicsLayer)
    //   var polygon = {
    //    type: "polygon",
    //    rings: [
    //       [118.991, 34.470],
    //       [119.991, 34.470],
    //       [120.991, 35.470],
    //       [120.991, 36.470],
    //       [121.991, 34.470]
    //    ]
    //  };

    //  var simpleFillSymbol = {
    //    type: "simple-fill",
    //    color: [227, 139, 79, 0.8],  // orange, opacity 80%
    //    outline: {
    //      color: [255, 255, 255],
    //      width: 1
    //    }
    //  };

    //  var polygonGraphic = new this.gisAPI.Graphic({
    //    geometry: polygon,
    //    symbol: simpleFillSymbol
    //  });

    //  graphicsLayer.add(polygonGraphic);

    //自带显示经纬度组件
    // var coordinateConversionWidget = new this.gisAPI.CoordinateConversion({
    //    view: view
    //  });
    //  view.ui.add(coordinateConversionWidget, "bottom-right");

    //显示经纬度组件
    let coordsWidget = document.createElement("div"); //组件挂载元素
    coordsWidget.id = "coordsWidget";
    coordsWidget.className = "esri-widget esri-component";
    coordsWidget.style.padding = "7px 15px 5px";

    view.ui.add(coordsWidget, "bottom-right"); //挂载位置
    //组件内部逻辑
    view.watch("stationary", function(isStationary: any) {
      //this.showCoordinates(view.center);
      var coords =
        "Lat/Lon " +
        view.center.latitude.toFixed(3) +
        " " +
        view.center.longitude.toFixed(3) +
        " | Scale 1:" +
        Math.round(view.scale * 1) / 1 +
        " | Zoom " +
        view.zoom;
      coordsWidget.innerHTML = coords;
    });
    view.on("pointer-move", function(evt: any) {
      //this.showCoordinates(view.toMap({ x: evt.x, y: evt.y }));
      var pt = view.toMap({ x: evt.x, y: evt.y });
      var coords =
        "纬度(Lat)/经度(Lon) " +
        pt.latitude.toFixed(3) +
        " " +
        pt.longitude.toFixed(3) +
        " | 比例(Scale) 1:" +
        Math.round(view.scale * 1) / 1 +
        " | 放大(Zoom) " +
        view.zoom;
      coordsWidget.innerHTML = coords;
    });

    //定位
    var locate = new this.gisAPI.Locate({
      view: view,
      useHeadingEnabled: false, //指示小部件是否将自动旋转到用户的方向。 设置为false可禁用此行为。
      goToOverride: function(view: any, options: any) {
        options.target.scale = 1500;
        return view.goTo(options.target);
      }
    });

    view.ui.add(locate, "top-left");

    //追踪
    var track = new this.gisAPI.Track({
      view: view,
      graphic: new this.gisAPI.Graphic({
        symbol: {
          type: "simple-marker",
          size: "12px",
          color: "green",
          outline: {
            color: "#efefef",
            width: "1.5px"
          }
        }
      }),
      useHeadingEnabled: false
    });

    view.ui.add(track, "top-left");

    //罗盘
    var compass = new this.gisAPI.Compass({
      view: view
    });
    view.ui.add(compass, "top-left");

    // 要素查询
    var search = new this.gisAPI.Search({
      view: view
    });

    view.ui.add(search, "top-right");

    //绘制缓冲
    // var activeGraphic;
    // var bufferGraphic;
    // view.on("pointer-move", function(event) {
    //   vueT.findNearestGraphic(event).then(function(graphic) {
    //     if (graphic) {
    //       activeGraphic = graphic;
    //       var buffer = geometryEngine.geodesicBuffer(
    //         activeGraphic.geometry,
    //         0.25,
    //         "miles"
    //       );
    //       drawBuffer(buffer);
    //     }
    //   });
    // });

    // // Typical usage
    // var WMTSLayer = new this.gisAPI.WMTSLayer({
    //   url: "http://t0.tianditu.gov.cn/vec_c/wmts?tk=313cd4b28ed520472e8b43de00b2de56", // url to the service
    //   activeLayer: {
    //     id: "SRTM_Color_Index"
    //   }
    // });
    // this.map.add(WMTSLayer)

    //图层1
    // const layer1 = new this.gisAPI.FeatureLayer({
    //   url: this.layers[0].url,
    //   outFields: this.layers[0].outFields,
    //   popupTemplate: this.layers[0].popupTemplate
    // });
    // this.map.add(layer1);

    const popupTrails1 = {
      title: "{用地名称}",
      content:
        "<b>用地编号:</b> {用地编号}<br><b>用地名称:</b> {用地名称}<br> <b>面积:</b> {Shape_Area}<br> <b>规划用地:</b> {规划用地}<br>"
    };
    const layer2 = new this.gisAPI.FeatureLayer({
      url: this.featureLayerURL,
      outFields: ["*"],
      popupTemplate: popupTrails1
    });
    this.map.add(layer2);

    // //geojson
    // const popupTrails2 = {
    //   title: "{name}",
    //   content: function() {
    //     return "name: {name} <br> code: {adcode}.";
    //   }
    // };
    // const geoJSONLayer = new this.gisAPI.GeoJSONLayer({
    //   url: "https://geo.datav.aliyun.com/areas_v2/bound/450000_full.json",
    //   popupTemplate: popupTrails2
    // });
    // this.map.add(geoJSONLayer); // adds the layer to the map

    //图形图层4绘制
    this.graphicsLayer = new this.gisAPI.GraphicsLayer({
      id: "graphicsLayer"
    });
    this.map.add(this.graphicsLayer);

    // 绘制widget
    let sketch = new this.gisAPI.Sketch({
      view: view,
      layer: this.graphicsLayer
    });
    view.ui.add(sketch, "top-right");
    //绘制样式设置
    let fillColor = [255, 255, 255, 0.5]; //填充色
    let stroke = {
      color: [255, 0, 0],
      width: 1
    }; 
    // 覆盖所有默认符号的颜色和大小
    let pointSymbol = sketch.viewModel.pointSymbol;
    pointSymbol.color = fillColor;
    pointSymbol.outline = stroke;
    pointSymbol.size = 8;
    let polylineSymbol = sketch.viewModel.polylineSymbol;
    polylineSymbol.color = stroke.color;
    polylineSymbol.width = stroke.width;
    let polygonSymbol = sketch.viewModel.polygonSymbol;
    polygonSymbol.color = fillColor;
    polygonSymbol.outline = stroke;
    //绘制事件监听
    sketch.on("create", function(event: any) {
      vueT.sketchTools(event);
    });

    // //添加多边形(位于图层graphicsLayer)
    // var polygon = {
    //     type: "polygon",
    //     rings: [
    //         [118.991, 34.47],
    //         [119.991, 34.47],
    //         [120.991, 35.47],
    //         [120.991, 36.47],
    //         [121.991, 34.47]
    //     ]
    // };

    // var simpleFillSymbol = {
    //     type: "simple-fill",
    //     color: [227, 139, 79, 0.8], // orange, opacity 80%
    //     outline: {
    //         color: [255, 255, 255],
    //         width: 1
    //     }
    // };

    // var polygonGraphic = new this.gisAPI.Graphic({
    //     geometry: polygon,
    //     symbol: simpleFillSymbol
    // });

    // this.graphicsLayer.add(polygonGraphic);

    //清除
    let clearBtn = document.createElement("button"); //组件挂载元素
    clearBtn.id = "clear";
    clearBtn.className = "esri-widget esri-component";
    clearBtn.style.padding = "7px 15px 5px";
    let newText = document.createTextNode("清除");
    clearBtn.appendChild(newText);
    clearBtn.onclick = function() {
      vueT.geoArr = [];
      vueT.resFlag = false;
      vueT.graphicsLayer.removeAll();
      console.log("removeAll");
    };

    view.ui.add(clearBtn, "top-right"); //挂载位置

    this.defaultFont = new this.gisAPI.Font({
      size: "15px",
      weight: "bold"
    });
    this.defaultMarkSymbol = new this.gisAPI.SimpleMarkerSymbol({
      style: "circle",
      color: "red",
      size: "7px",
      outline: {
        color: [255, 0, 0],
        width: 1
      }
    });

    view.ui._removeComponents(["attribution"]); //去掉logo

    // var highlight;
    // view.whenLayerView(geoJSONLayer).then(function(featureLayerView) {
    //   view.on("pointer-move", function(event){
    //     view.hitTest(event).then(function(response){
    //       // Only return features for the feature layer
    //       var feature = response.results.filter(function (result) {
    //        return result.graphic.layer === featureLayer;
    //       })[0].graphic;
    //       if (highlight) {
    //        highlight.remove();
    //       }
    //       // Highlight feature
    //       highlight = featureLayerView.highlight(feature);
    //     });
    //   });
    // });

    //  var sqlExpressions = ["TRL_ID = 0", "TRL_ID > 0",  "USE_BIKE = 'Yes'", "USE_BIKE = 'No'", "ELEV_GAIN < 1000", "ELEV_GAIN > 1000", "TRL_NAME = 'California Coastal Trail'"];

    // var selectFilter = document.createElement("select");
    // selectFilter.setAttribute("class", "esri-widget esri-select");
    // selectFilter.setAttribute("style", "width: 275px; font-family: Avenir Next W00; font-size: 1em;");

    // sqlExpressions.forEach(function(sql){
    //   var option = document.createElement("option");
    //   option.value = sql;
    //   option.innerHTML = sql;
    //   selectFilter.appendChild(option);
    // });

    // view.ui.add(selectFilter, "top-right");
  }
  toItem(item: any) {
    console.log(item);
    // let centerPoint = item.geometry.getCentroid();
    this.view.goTo(item.geometry);
    let geoGraphic = this.gisAPI.Graphic({
      geometry: item.geometry,
      symbol: {
        type: "simple-line", // autocasts as SimpleLineSymbol()
        color: [255, 0, 0],
        width: 4
      }
    });
    this.graphicsLayer.removeAll();
    this.graphicsLayer.add(geoGraphic);
  }
  mapClick(ev: any) {
    //事件委托?
    //console.log(ev)
    //console.log(this.view)
    //console.log("[" + ev.mapPoint.longitude + ", " + ev.mapPoint.latitude + "]");
    //地图单击事件
    // this.view.on("click", ev => {
    //   // you must overwrite default click-for-popup
    //   // behavior to display your own popup
    //   this.view.popup.autoOpenEnabled = false;
    //   //var lat = Math.round(ev.mapPoint.latitude * 1000) / 1000; //纬度
    //   //var lon = Math.round(ev.mapPoint.longitude * 1000) / 1000; //经度
    //   //console.log("[" + lon + ", " + lat + "]");
    //   console.log("[" + ev.mapPoint.longitude + ", " + ev.mapPoint.latitude + "]");
    // });
  }
  // showCoordinates(pt: any) {
  //   var coords =
  //     "Lat/Lon " +
  //     pt.latitude.toFixed(3) +
  //     " " +
  //     pt.longitude.toFixed(3) +
  //     " | Scale 1:" +
  //     Math.round(view.scale * 1) / 1 +
  //     " | Zoom " +
  //     view.zoom;
  //   coordsWidget.innerHTML = coords;
  // }
  sketchTools(ev: any) {
    let view = this.view;
    let _this: any = this; //this.$refs
    //绘制工具事件

    //图层空间查询
    if (ev.state == "complete") {
      let geo2query = ev.graphic.geometry;
      let queryTask = new this.gisAPI.QueryTask({
        url: this.featureLayerURL
      });

      let query = new this.gisAPI.Query();
      query.returnGeometry = true;
      query.outFields = ["*"];
      query.geometry = geo2query;

      queryTask.execute(query).then(function(results: any) {
        // let idObject: any = document.getElementById('res');
        // if (idObject != null) { idObject.parentNode.removeChild(idObject); }

        console.log(results);
        if (results) {
          _this.resFlag = true;
          _this.queryRes = results.features;

          //
          let list: any[] = results.features;
          let groups: any[] = []; //分组结果

          for (let i = 0; i < list.length; i++) {
            let az = "";
            let flag: boolean = false;
            for (let j = 0; j < groups.length; j++) {
              if (
                groups[j][0].attributes.用地名称 == list[i].attributes.用地名称
              ) {
                flag = true;
                az = j + "";
                break;
              }
            }
            if (flag == true) {
              groups[az].push(list[i]);
              flag = false;
            } else if (flag == false) {
              let arr2 = new Array();
              arr2.push(list[i]);
              groups.push(arr2);
            }
          }
          console.log("get groups");
          console.log(groups);

          let inters = [];
          for (let i = 0; i < groups.length; i++) {
            let inter = [];
            for (let j = 0; j < groups[i].length; j++) {
              let int = _this.gisAPI.geometryEngine.intersect(
                groups[i][j].geometry,
                geo2query
              );
              inter.push(int);
            }
            inters.push(inter);
          }

          let areas = [];
          for (let i = 0; i < inters.length; i++) {
            let areai = 0;
            for (let j = 0; j < inters[i].length; j++) {
              if (inters[i][j]) {
                let area = _this.gisAPI.geometryEngine.geodesicArea(
                  inters[i][j]
                );
                areai += parseFloat(area);
              }
            }
            areas.push(areai);
          }

          console.log("fin");
          console.log([groups, inters, areas]);
          let finRes = [groups, inters, areas];

          // 指定图表的配置项和数据
          let data: any = {
            legendData: [],
            seriesData: [],
            selected: {}
          };
          for (let i = 0; i < finRes[0].length; i++) {
            let item: any = {
              name: finRes[0][i][0].attributes.用地名称,
              value: finRes[2][i]
              // le
            };
            data.legendData.push(item.name);
            data.seriesData.push(item);
          }
          console.log(data);

          let option = {
            title: {
              text:
                "绘制地类面积" +
                finRes[2].reduce((prev, curr, idx, arr) => {
                  return prev + curr;
                }) +
                "平方米",
              subtext: "单位(平方米)"
            },
            toolbox: {
              show: true,
              feature: {
                saveAsImage: {
                  show: true
                },
                restore: {
                  show: true
                }
              }
            },
            tooltip: {
              trigger: "item",
              formatter: "{c}平方米 ({d}%)",
              textStyle: {
                fontSize: 15
              }
            },
            series: [
              {
                name: "地类",
                type: "pie",
                radius: 60,
                // center: ['50%', '50%'],
                data: data.seriesData,
                animation: true,
                encode: {
                  itemName: "地类",
                  value: "面积"
                },
                label: {
                  normal: {
                    position: "inner",
                    textStyle: {
                      fontSize: 17
                    },
                    formatter(params: any) {
                      // console.log(params);
                      return (
                        params.name + ":" + params.value.toFixed(3) + "平方米"
                      );
                    }
                  }
                }
                // left: 0,
                // right: '66.6667%',
                // top: 0,
                // bottom: 0
              }
            ]
          };

          // 使用刚指定的配置项和数据显示图表。
          _this.myChart.setOption(option);
        }
        // console.log(_this.$refs);

        // // let resArea: any = document.createElement("div"); //组件挂载元素
        // // resArea.id = "res";
        // // resArea.className = "esri-widget esri-component";
        // // resArea.style.padding = "7px 15px 5px";
        // results.features.forEach((item: any) => {
        //     // let liNode: any = document.createTextNode(item.attributes.OBJECTID); //item.attributes.OBJECTID
        //     // resArea.appendChild(liNode);
        //     // let resArea: any = document.createElement("li");
        //     // _this.$refs.appendChild(resArea)
        // });

        // // _this.view.ui.add(resArea, "top-right"); //挂载位置
      });
    }

    switch (ev.tool) {
      case "polyline": //绘制线事件--计算长度
        {
          this.handleLengthMeasure(ev);
        }
        break;
      case "point": //绘制点事件
        {
          // this.handleAreaMeasure(ev);
        }
        break;

      default:
        //默认事件 --计算面积
        this.handleAreaMeasure(ev);
        break;
    }

    if (ev.state == "complete") {
      // console.log(this.geoArr);
      // console.log(this.graphicsLayer.graphics);
    }
  }
  //计算长度
  handleLengthMeasure(evt: any) {
    if (evt.toolEventInfo && evt.toolEventInfo.type == "vertex-add") {
      var pt = {
        type: "point",
        x: evt.toolEventInfo.added[0],
        y: evt.toolEventInfo.added[1],
        spatialReference: (this as any).view.spatialReference
      };
      this.handleLengthPt(pt);
    }
  }
  //线的点处理
  handleLengthPt(pt: any) {
    this.inputPt.push(pt);
    var textSymbol;
    if (this.inputPt.length == 1) {
      textSymbol = new (this as any).gisAPI.TextSymbol({
        text: "起点",
        font: this.defaultFont,
        color: [255, 0, 0],
        xoffset: 0,
        yoffset: -20
      });
      (this as any).graphicsLayer.add(
        new (this as any).gisAPI.Graphic({ geometry: pt, symbol: textSymbol })
      );
    }
    (this as any).graphicsLayer.add(
      new (this as any).gisAPI.Graphic({
        geometry: pt,
        symbol: this.defaultMarkSymbol
      })
    );
    if (this.inputPt.length >= 2) {
      // var params = new this.gisAPI.LengthsParameters();
      // var geoservice = new this.gisAPI.GeometryService(this.geometryUrl);
      //var geoEngine = new this.gisAPI.geometryEngine();

      // params.distanceUnit = this.gisAPI.GeometryService.UNIT_METER;
      // params.calculationType = "preserveShape";

      var p1: any = this.inputPt[this.inputPt.length - 2];
      var p2: any = this.inputPt[this.inputPt.length - 1];

      var polyline = new (this as any).gisAPI.Polyline({
        spatialReference: (this as any).view.spatialReference
      });

      polyline.addPath([
        [p1.x, p1.y],
        [p2.x, p2.y]
      ]);
      //console.log(this.gisAPI.geometryEngine.planarLength(polyline, "meters"));//planarLength（）使用投影坐标以及执行该计算时，不会考虑地球的曲率
      //console.log(this.gisAPI.geometryEngine.geodesicLength(polyline, "meters"));//geodesicLength（）在执行此计算时会考虑地球的曲率。因此，当使用空间参考为WGS84（wkid：4326）或Web Mercator的输入几何时，最好的做法是使用geodesicLength（）计算长度。

      var dis = (this as any).gisAPI.geometryEngine.planarLength(
        polyline,
        "meters"
      );
      this.totalDis += dis;
      var betweendis = dis + "米";

      var distext = new (this as any).gisAPI.TextSymbol({
        text: betweendis,
        font: this.defaultFont,
        color: [255, 0, 0],
        xoffset: 40,
        yoffset: -13
      });
      (this as any).graphicsLayer.add(
        new (this as any).gisAPI.Graphic({ geometry: p2, symbol: distext })
      );
      if (this.totalLenGraphic) {
        (this as any).graphicsLayer.remove(this.totalLenGraphic);
      }
      var total = this.totalDis; //Number.format(this.totalDis, { pattern: "#.000" });
      var totalSymbol = new (this as any).gisAPI.TextSymbol({
        text: "总长度：" + total + "米",
        font: this.defaultFont,
        color: [255, 0, 0],
        xoffset: 40,
        yoffset: -25
      });
      this.totalLenGraphic = (this as any).gisAPI.Graphic({
        geometry: p2,
        symbol: totalSymbol
      });
      (this as any).graphicsLayer.add(this.totalLenGraphic);

      // params.polylines = [polyline];

      // geoservice.lengths(params).then(function(distance) {
      //   console.log(distance)
      //   // var dis = parseFloat(
      //   //   Number.format(distance.lengths[0], { pattern: "#.000" })
      //   // );
      //   var dis = distance.length[0]
      //   console.log(dis)
      //   this.totalDis += dis;
      //   var betweendis = dis + "米";
      //   console.log(betweendis);

      //   var distext = new this.gisAPI.TextSymbol({
      //     text: betweendis,
      //     font: this.defaultFont,
      //     color: [255, 0, 0],
      //     xoffset: 40,
      //     yoffset: -3
      //   });
      //   this.graphicsLayer.add(
      //     new this.gisAPI.Graphic({ geometry: p2, symbol: distext })
      //   );
      //   if (this.totalLenGraphic) {
      //     this.graphicsLayer.remove(this.totalLenGraphic);
      //   }
      //   var total = number.format(this.totalDis, { pattern: "#.000" });
      //   var totalSymbol = new this.gisAPI.TextSymbol({
      //     text: "总长度：" + total + "米",
      //     font: this.defaultFont,
      //     color: [255, 0, 0],
      //     xoffset: 40,
      //     yoffset: -20
      //   });
      //   this.totalLenGraphic = new this.gisAPI.Graphic({
      //     geometry: p2,
      //     symbol: totalSymbol
      //   });
      //   this.graphicsLayer.add(this.totalLenGraphic);
      // });
    }
  }
  //计算面积
  handleAreaMeasure(evt: any) {
    if (evt.state == "complete") {
      let geometry = evt.graphic.geometry;
      // console.log(this.gisAPI.geometryEngine.planarArea(geometry, "square-meters"));//planarLength（）使用投影坐标以及执行该计算时，不会考虑地球的曲率
      // console.log(this.gisAPI.geometryEngine.geodesicArea(geometry, "square-meters"));//geodesicLength（）在执行此计算时会考虑地球的曲率。因此，当使用空间参考为WGS84（wkid：4326）或Web Mercator的输入几何时，最好的做法是使用geodesicLength（）计算长度。
      let result = (this as any).gisAPI.geometryEngine.geodesicArea(
        geometry,
        "square-meters"
      );
      var font = new (this as any).gisAPI.Font({
        size: "18px"
      });
      var areaRes = new (this as any).gisAPI.TextSymbol({
        text: result + "平方米", //number.format(result.areas[0], { pattern: "#.000" })
        font: font,
        color: [255, 0, 0]
      });
      var pt = new (this as any).gisAPI.Point({
        x: geometry.centroid.x,
        y: geometry.centroid.y,
        spatialReference: (this as any).view.spatialReference
      });
      (this as any).graphicsLayer.add(
        new (this as any).gisAPI.Graphic({ geometry: pt, symbol: areaRes })
      );

      // var params = new AreasAndLengthsParameters();
      // var geoservice = new GeometryService({ url: geometryUrl });
      // params.lengthUnit = GeometryService.UNIT_METER;
      // params.areaUnit = GeometryService.UNIT_SQUARE_METERS;
      // params.calculationType = "preserveShape";

      // geoservice.simplify([geometry]).then(function(simplifiedGeo) {
      //   params.polygons = simplifiedGeo;
      //   geoservice.areasAndLengths(params).then(function(result) {
      //     var font = new Font({
      //       size: "18px"
      //     });
      //     var areaRes = new TextSymbol({
      //       text:
      //         number.format(result.areas[0], { pattern: "#.000" }) + "平方米",
      //       font: font,
      //       color: [255, 0, 0]
      //     });
      //     var pt = new Point({
      //       x: geometry.centroid.x,
      //       y: geometry.centroid.y,
      //       spatialReference: view.spatialReference
      //     });
      //     graphicLyr.add(new Graphic({ geometry: pt, symbol: areaRes }));
      //     console.log(result);
      //   });
      // });
    }
  }

  @Watch("addLayer")
  addLayer() {}
}
</script>

<style scoped>
/* @import url("D:/4code/Z-Project/gis/4.13/esri/css/main.css"); */
#arcgis {
  width: 100%;
  height: 85%;
}

.resClass {
  width: 35%;
  height: 45%;
  background-color: #fff;
  position: absolute;
  z-index: 999999;
  top: 35%;
  right: 1%;
}
</style>