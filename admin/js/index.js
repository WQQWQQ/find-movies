
$(function(){
    var map_style=getCookie("map_style");
    $("#mapStyleModal").find("img").each(function(){
       if($(this).attr("alt")==map_style){
           $(this).addClass("activestyle");
       }
    });
    var map,currentcity;
    var info_window_tpl='<div style="margin-top: 20px;text-align: center"><label class="radio-inline"><input type="radio" name="inlineRadio" id="start_radio" value="option1" style="margin-top: 0">设为起点</label> <label class="radio-inline"> <input type="radio" name="inlineRadio" style="margin-top: 0" id="end_radio" value="option2">设为终点</label></div>';
    $("#locationbox").height($(window).height()-297);
    var center_lat=null,center_lng=null,radius=null;




    //地图初始化
    (function mapInit() {
        map = new BMap.Map("allmap", {enableMapClick: false});
        map.centerAndZoom(new BMap.Point(113.340106,23.138113), 13);
        localStorage.setItem("city",'广州');
        var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});
        var navigationControl = new BMap.NavigationControl({

            anchor: BMAP_ANCHOR_TOP_LEFT,

            type: BMAP_NAVIGATION_CONTROL_LARGE,

            enableGeolocation: true
        });
        map.addControl(navigationControl);
        map.addControl(new BMap.MapTypeControl());
        map.addControl(top_left_control);
        map.enableScrollWheelZoom(true);
        var trafficCtrl = new BMapLib.TrafficControl({
            showPanel: false
        });
        map.addControl(trafficCtrl);
        trafficCtrl.setAnchor(BMAP_ANCHOR_TOP_RIGHT);
        trafficCtrl.setOffset(new BMap.Size(140, 10));
        map.setMapStyle({style: map_style});
        map.disableDoubleClickZoom();
        resetMenu(map);
    })();

    //城市定位
    (function locate() {
        var geoc = new BMap.Geocoder();
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (r) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                var pt = r.point;
                map.panTo(pt);
                geoc.getLocation(pt, function (rs) {
                    var addComp = rs.addressComponents;
                    var city = addComp.city.substring(0, addComp.city.length - 1);
                    getEleById("cityname").innerHTML = city;
                    localStorage.setItem("city",city);
                })
            }
            else {
                layer.msg('定位失败',{time:2000});
            }
        }, {enableHighAccuracy: true})
    })();

    //更换城市
    (function changeCity() {
        var myCl = new BMapLib.CityList({container: "citylist_container", map: map});
        myCl.addEventListener("cityclick", function (e) {
            currentcity = e.name;
            getEleById("cityname").innerHTML = currentcity;
            localStorage.setItem("city",currentcity);
            $(getEleById("cityModal")).modal("hide");
            map.centerAndZoom(currentcity);
        });
    })();

    //查询兴趣点
    (function searchPOI() {
        var local = new BMap.LocalSearch(map, {
            renderOptions: {
                map: map,
                panel: "location",
            },
        });
        var search_top = getEleById("search-top");
        var searchtable = getEleById("searchtable");
        var locationpanel = getEleById("location");
        $(search_top).children().on("click", function () {
            layer.load(1, {
                shade: [0.2,'#333']
            });
            var text=$(this).children("span").text();
            if(center_lat==null && center_lng==null && radius==null){
                clearOverlay();
                local.search(text);
                local.disableFirstResultSelection();
                local.setMarkersSetCallback(function(searchResult){
                    markersSetCallback(locationpanel,text,searchResult);
                });
            }else if(center_lat!=null && center_lng!=null && radius!=null){
                var center=new BMap.Point(center_lng,center_lat);
                local.searchNearby(text,center,radius);
                local.disableFirstResultSelection();
                local.setMarkersSetCallback(function(searchResult){
                    markersSetCallback(locationpanel,text,searchResult);
                });
            }
        });
        $(searchtable).find("td").on("click", function () {
            layer.load(1, {
                shade: [0.2,'#333']
            });
            var hascircle=false;
            var overlays=map.getOverlays();
            var osLength=overlays.length;

            for(var i=0;i<osLength;i++){
                if(overlays[i].toString()=="[object Circle]"){
                    hascircle=true;
                    break;
                }
            }
            var text=$(this).text();
            if(center_lat==null && center_lng==null && radius==null){
                clearOverlay();
                local.search(text);
                local.disableFirstResultSelection();
                local.setMarkersSetCallback(function(searchResult){
                    markersSetCallback(locationpanel,text,searchResult);
                });
            }else if(center_lat!=null && center_lng!=null && radius!=null){
                var center=new BMap.Point(center_lng,center_lat);
                local.searchNearby(text,center,radius);
                local.disableFirstResultSelection();
                local.setMarkersSetCallback(function(searchResult){
                    markersSetCallback(locationpanel,text,searchResult);
                });
            }

        });
    })();

    //圆选查询
    (function circleSearch(){
        var circleCtrl=getEleById("circle");
        var editcircle=false;
        var drawingManager;
        $(circleCtrl).on("click",function(){
            var $this=$(this);
            var hascircle=false;
            var overlays=map.getOverlays();
            var osLength=overlays.length;
            for(var i=0;i<osLength;i++){
                if(overlays[i].toString()=="[object Circle]"){
                    hascircle=true;
                    break;
                }
            }
            if(hascircle){
                layer.msg("请删除已有缓冲区",{time:2000});

            }else{
                if(!editcircle){
                    editcircle=true;
                    var styleOptions = {
                        strokeColor:"#0fe088",
                        fillColor:"#0fe088",
                        strokeWeight: 3,
                        strokeOpacity: 0.8,
                        fillOpacity: 0.6,
                        strokeStyle: 'solid'
                    };
                    drawingManager = new BMapLib.DrawingManager(map, {
                        isOpen: true,
                        circleOptions: styleOptions
                    });
                    drawingManager.setDrawingMode(BMAP_DRAWING_CIRCLE);
                    $(this).css("background-color","#ff9a03");
                    drawingManager.addEventListener("circlecomplete",function(e,overlay){
                        deleteMenu(overlay);
                        center_lat=overlay.getCenter().lat;
                        center_lng=overlay.getCenter().lng;
                        radius=overlay.getRadius();
                        $this.css("background-color","#0f7e68");
                        editcircle=false;
                        drawingManager.close();
                    });
                }
                else if(editcircle){
                    drawingManager.close();
                    editcircle=false;
                    $(this).css("background-color","#0f7e68");
                }
            }



        });
    })();

    //自定义查找兴趣点
    (function searchMyPOI(){
        var searchPOI=getEleById("searchPOI");
        var locationpanel = getEleById("location");
        $(searchPOI).on("click",function(){
            layer.load(1, {
                shade: [0.2,'#333']
            });
            var text=getEleById("POItext").value;
            var local = new BMap.LocalSearch(map, {
                renderOptions: {
                    map: map,
                    panel: "location",
                }
            });
            var hascircle=false;
            var overlays=map.getOverlays();
            var osLength=overlays.length;
            for(var i=0;i<osLength;i++){
                console.log(overlays[i]);
                if(overlays[i].toString()=="[object Circle]"){
                    hascircle=true;
                }
            }
            if(center_lat==null && center_lng==null && radius==null){
                clearOverlay();
                local.search(text);
                local.disableFirstResultSelection();
                local.setMarkersSetCallback(function(searchResult){
                    markersSetCallback(locationpanel,text,searchResult);
                });
            }else if(center_lat!=null && center_lng!=null && radius!=null){
                var center=new BMap.Point(center_lng,center_lat);
                local.searchNearby(text,center,radius);
                local.disableFirstResultSelection();
                local.setMarkersSetCallback(function(searchResult){
                    markersSetCallback(locationpanel,text,searchResult);
                });
            }
        })
    })();

    //显示隐藏地图POI搜索
    (function toggleMapCtrl(){
        $(".mapCtrllabel").on("click",function(){
            $("#mapsearchmenu").slideToggle();
        })
    })();
    //显示隐藏左导航栏
    (function toggleSideBar(){
        var sidemenushow=true;
        var togglebtn=getEleById("togglesidenav");
        var sidenav=getEleById("sidenav");
        var wrapper=getEleById("wrapper");
        $(togglebtn).on("click",function(){
            if(sidemenushow){
                $(this).find('span').removeClass("glyphicon-chevron-left").addClass('glyphicon-chevron-right');
                $(this).add($(sidenav)).animate({
                    left:0+"px"
                },500);

                $(wrapper).animate({
                    "padding-left":0
                },500);
            }
            else{
                $(this).find('span').removeClass("glyphicon-chevron-right").addClass('glyphicon-chevron-left');
                $(this).add($(sidenav)).animate({
                    left:300+"px"
                },500);
                $(wrapper).animate({
                    "padding-left":300+"px"
                },500);
            }
            sidemenushow=!sidemenushow;
        })
    })();

    //地址解析
    (function searchPlace() {
        var searchbtn = getEleById("searchbtn");
        $(searchbtn).on("click", function () {
            var address = getEleById("address").value;
            currentcity=getEleById("cityname").innerHTML;
            if (address != "") {
                var myGeo = new BMap.Geocoder();
                myGeo.getPoint(address, function (point) {
                    console.log(point);
                    if (point) {
                        var pPoint = new BMap.Marker(point);
                        map.addOverlay(pPoint);
                        map.centerAndZoom(point, 15);
                        pPoint.setAnimation(BMAP_ANIMATION_BOUNCE);
                        var content='';
                        content+=info_window_tpl;
                        pPoint.addEventListener("click", function(e){
                            var searchInfoWindow=null;
                            searchInfoWindow = new BMapLib.SearchInfoWindow(map, content, {
                                title  :address,      //标题
                                width  : 290,             //宽度
                                height : 50,              //高度
                                panel  : "panel",         //检索结果面板
                                enableAutoPan : true,     //自动平移
                                enableCloseOnClick:true,
                                enableMessage:false,
                                searchTypes   :[
                                    BMAPLIB_TAB_SEARCH,   //周边检索
                                    BMAPLIB_TAB_TO_HERE,  //到这里去
                                    BMAPLIB_TAB_FROM_HERE //从这里出发
                                ]
                            });
                            searchInfoWindow.open(pPoint);
                            $("#start_radio").on("click",function(){
                                ac_bs.setInputValue(address);
                                ac_ts.setInputValue(address);
                                ac_ws.setInputValue(address);
                                ac_cs.setInputValue(address);
                            });
                            $("#end_radio").on("click",function(){
                                ac_be.setInputValue(address);
                                ac_te.setInputValue(address);
                                ac_we.setInputValue(address);
                                ac_ce.setInputValue(address);
                            });
                        });
                        deleteMenu(pPoint);
                    }
                    else {
                        alert("Sorry，您输入的地址无法解析");
                    }
                }, currentcity);
            }
        });
    })();

    //显示隐藏左工具栏
    (function toggleLeftTool(){
        var toolshow=false;
        $(".leftTmain").on("click",function(){
            if(!toolshow){
                leftPathRun();
                $("#leftPathMenu>.PathItem").css({
                       "display":"block"
                });
            }
            else if(toolshow){
                leftPathRun();
                setTimeout(function(){
                    $("#leftPathMenu>.PathItem").css({
                        "display":"none"
                    });
                },450);
            }
            toolshow=!toolshow;
        });
    })();

    //显示隐藏右工具栏
    (function toggleRightTool(){
        var toolshow=false;
        $(".rightTmain").on("click",function(){
            if(!toolshow){
                rightPathRun();
                $("#rightPathMenu>.PathItem").css({
                    "display":"block"
                });
            }
            else if(toolshow){
                rightPathRun();
                setTimeout(function(){
                    $("#rightPathMenu>.PathItem").css({
                        "display":"none"
                    });
                },450);
            }
            toolshow=!toolshow;
        });
    })();

    //天气查询
    (function weatherCtr() {
        $('#weatherModal').on("show.bs.modal", function () {
            $.ajax({
                url: "http://api.map.baidu.com/telematics/v3/weather?location="+localStorage.getItem("city")+"&output=json&ak=OzH20ZxCHP2Au64y1Csmk61K",
                dataType: "jsonp",
                success: function (json) {
                    var data = json;
                    $("#weather-city").text(data["results"][0]["currentCity"]);
                    $("#weather-date").text(data["date"]);
                    $("#weather-pm25").text("pm2.5: " + data["results"][0]["pm25"]);
                    $("#weathertable tr:first-child").children().each(function (index) {
                        $(this).text(data["results"][0]["weather_data"][index]["date"]);
                    });
                    $("#weathertable tr:nth-child(2)").children().each(function (index) {
                        $(this).text(data["results"][0]["weather_data"][index]["temperature"]);
                    });
                    $("#weathertable tr:nth-child(3)").children().each(function (index) {
                        $(this).html("<img src='" + data["results"][0]["weather_data"][index]["dayPictureUrl"] + "'/>");
                    });
                    $("#weathertable tr:nth-child(4)").children().each(function (index) {
                        $(this).html("<img src='" + data["results"][0]["weather_data"][index]["nightPictureUrl"] + "'/>");
                    });
                    $("#weathertable tr:nth-child(5)").children().each(function (index) {
                        $(this).text(data["results"][0]["weather_data"][index]["weather"]);
                    });
                    $("#weathertable tr:nth-child(6)").children().each(function (index) {
                        $(this).text(data["results"][0]["weather_data"][index]["wind"]);
                    });
                    $("#clothes tr:first-child").children("td:first-child").text(data["results"][0]["index"][0]["title"]);
                    $("#clothes tr:first-child").children("td:last-child").text(data["results"][0]["index"][0]["zs"]);
                    $("#clothes tr:last-child").children().each(function () {
                        $(this).text(data["results"][0]["index"][0]["des"])
                    });
                    $("#cold tr:first-child").children("td:first-child").text(data["results"][0]["index"][3]["title"]);
                    $("#cold tr:first-child").children("td:last-child").text(data["results"][0]["index"][3]["zs"]);
                    $("#cold tr:last-child").children().each(function () {
                        $(this).text(data["results"][0]["index"][3]["des"])
                    });
                    $("#sport tr:first-child").children("td:first-child").text(data["results"][0]["index"][4]["title"]);
                    $("#sport tr:first-child").children("td:last-child").text(data["results"][0]["index"][4]["zs"]);
                    $("#sport tr:last-child").children().each(function () {
                        $(this).text(data["results"][0]["index"][4]["des"])
                    });
                    $("#ray tr:first-child").children("td:first-child").text(data["results"][0]["index"][5]["title"]);
                    $("#ray tr:first-child").children("td:last-child").text(data["results"][0]["index"][5]["zs"]);
                    $("#ray tr:last-child").children().each(function () {
                        $(this).text(data["results"][0]["index"][5]["des"])
                    });
                }
            });
        });
    })();

    //全景图
    (function panoramaCtr() {
        var panoramaCtrl = getEleById("panoramaCtrl");
        var panoLayer = new BMap.PanoramaCoverageLayer();
        var defaultcursor=map.getDefaultCursor();
        var panoactive = false;
        var panorama = new BMap.Panorama('allmap');
        $(panoramaCtrl).on("click", function () {
            if (!panoactive) {
                map.addTileLayer(panoLayer);
                map.setDefaultCursor("url('admin/img/panorama.ico'),default");
                panoactive=true;
                $(this).css("background-color","#ff9a03");
                map.addEventListener("click", function (e) {
                    if(panoactive){
                        map.disableScrollWheelZoom();
                        panorama.show();
                        panorama.setOptions({
                            albumsControl: true
                        });
                        var lng = e.point.lng;
                        var lat = e.point.lat;
                        panorama.setPosition(new BMap.Point(lng,lat));
                        panorama.setPanoramaPOIType(BMAP_PANORAMA_POI_MOVIE); //��ӰԺ
                        panorama.setPov({pitch: 6, heading: 138});
                        panorama.setOptions({
                            albumsControlOptions: {
                                anchor: BMAP_ANCHOR_BOTTOM,
                                maxWidth: '60%',
                                imageHeight: 80
                            }
                        });

                    }
                });
            }
            else if(panoactive){
                panorama.hide();
                map.removeTileLayer(panoLayer);
                map.setDefaultCursor(defaultcursor);
                panoactive=false;
                $(this).css("background-color","#0f7e68");
                map.enableScrollWheelZoom();
            }
        });
    })();

    //距离量算
    (function measureDistance(){
        var ruler=getEleById("ruler");
        var myDis = new BMapLib.DistanceTool(map);
        var measure=false;
        $(ruler).on("click",function(){
            if(!measure){
                $(this).css("background-color","#ff9a03");
                myDis.open();
            }
            else{
                $(this).css("background-color","#0f7e68");
                myDis.close();
            }
            measure=!measure;
        });
        myDis.addEventListener("drawend",function(){
            $(ruler).css("background-color","#0f7e68");
            measure=false;
        });
    })();



    //查询公交路线
    (function searchBusRoute(){
        var busbtn=getEleById("bussearch");
        $(busbtn).on("click",function(){
            var transit = new BMap.TransitRoute(map, {
                renderOptions: {map: map,panel: "location"},
                policy: 0
            });
            var routePolicy = [BMAP_TRANSIT_POLICY_LEAST_TIME,BMAP_TRANSIT_POLICY_LEAST_TRANSFER,
                BMAP_TRANSIT_POLICY_LEAST_WALKING,BMAP_TRANSIT_POLICY_AVOID_SUBWAYS];
            var busstart=getEleById("busstart").value;
            var busend=getEleById("busend").value;
            if(busend!="" && busstart!=""){
                var policyindex=$("input[name='buspolicy']:checked").val();
                var route=routePolicy[policyindex];
                transit.setPolicy(route);
                transit.search(busstart,busend);
            }
        })
    })();

    //查询驾车路线
    (function searchCarRoute(){
        var carbtn=getEleById("carsearch");
        $(carbtn).on("click",function(){
            var driving = new BMap.DrivingRoute(map, {
                renderOptions:{map: map, autoViewport: true,panel:"location"},policy: 0
            });
            var routePolicy = [BMAP_DRIVING_POLICY_LEAST_TIME,BMAP_DRIVING_POLICY_LEAST_DISTANCE,
                BMAP_DRIVING_POLICY_AVOID_HIGHWAYS];
            var carstart=getEleById("carstart").value;
            var carend=getEleById("carend").value;
            if(carend!="" && carstart!=""){
                var policyindex=$("input[name='carpolicy']:checked").val();
                var route=routePolicy[policyindex];
                driving.setPolicy(route);
                driving.search(carstart,carend);
            }
        })
    })();

    //查询步行路线
    (function searchwalkRoute(){
        var walkbtn=getEleById("walksearch");
        $(walkbtn).on("click",function(){
            var walking = new BMap.WalkingRoute(map, {
                renderOptions: {map: map, panel: "location", autoViewport: true}
            });
            var walkstart=getEleById("walkstart").value;
            var walkend=getEleById("walkend").value;
            if(carend!="" && carstart!=""){
                walking.search(walkstart,walkend);
            }
        })
    })();

    //查询打车信息
    (function searchTaxiRoute(){
        var taxibtn=getEleById("taxisearch");
        $(taxibtn).on("click",function(){
            var driving = new BMap.DrivingRoute(map, {
                onSearchComplete:showTaxiInfo, renderOptions:{map: map, autoViewport: true}
            });
            var taxistart=getEleById("taxistart").value;
            var taxiend=getEleById("taxiend").value;
            if(taxistart!="" && taxiend!=""){
                driving.search(taxistart,taxiend);
            }
        })
    })();

    //更换地图样式
    (function changeMapStyle(){
        var stylediv=$(".style");
        stylediv.children().each(function(){
            $(this).on("click",function(){
                stylediv.children().removeClass("activestyle");
                $(this).addClass("activestyle");
                var mapstyle=$(this).attr("alt");
                setCookie("map_style",mapstyle);
                ajaxSubmit(PATH+"php/me.php",{map_style:mapstyle},"json",function(data){
                    if(data.status=="Yes"){
                        map.setMapStyle({
                            style:mapstyle
                        });
                    }
                });

            })
        })
    })();


    var ac_bs,ac_be,ac_cs,ac_ce,ac_ws,ac_we,ac_ts,ac_te;

    ac_bs = new BMap.Autocomplete({
        "input": "busstart",
        "location": map
    });
    ac_be = new BMap.Autocomplete({
        "input": "busend",
        "location": map
    });
    ac_cs = new BMap.Autocomplete({
        "input": "carstart",
        "location": map
    });
    ac_ce = new BMap.Autocomplete({
        "input": "carend",
        "location": map
    });
    ac_ws = new BMap.Autocomplete({
        "input": "walkstart",
        "location": map
    });
    ac_we = new BMap.Autocomplete({
        "input": "walkend",
        "location": map
    });
    ac_ts = new BMap.Autocomplete({
        "input": "taxistart",
        "location": map
    });
    ac_te = new BMap.Autocomplete({
        "input": "taxiend",
        "location": map
    });

    textAutoComplete("address",map);
    //textAutoComplete(ac_bs,"busstart","");
    //textAutoComplete(ac_be,"busend","");
    //textAutoComplete(ac_cs,"carstart","");
    //textAutoComplete(ac_ce,"carend","");
    //textAutoComplete(ac_ws,"walkstart","");
    //textAutoComplete(ac_we,"walkend","");
    //textAutoComplete(ac_ts,"taxistart","");
    //textAutoComplete(ac_te,"taxiend","");


//右键菜单
    function deleteMenu(overlay) {
        var overlaymenu = new BMap.ContextMenu();
        overlaymenu.addItem(new BMap.MenuItem("删除",removeOverlay.bind(overlay)));
        overlaymenu.addItem(new BMap.MenuItem("全部清除",clearOverlay));
        overlay.addContextMenu(overlaymenu);
    }

//重置地图
    function resetMenu(map){
        var mapmenu=new BMap.ContextMenu();
        mapmenu.addItem(new BMap.MenuItem("重置地图",function(){
            map.reset();
            map.clearOverlays();
            $("#location").css("display","none");
        }));
        map.addContextMenu(mapmenu);
    }

//文字补全
    function textAutoComplete(address,map) {
        var ac = new BMap.Autocomplete({
            "input": address,
            "location": map
        });
        //if(value!='' && value!=null){
        //
        //}

    }

//移除覆盖物
    function removeOverlay(e,ee,overlay){
        map.removeOverlay(overlay);
    }

//清除覆盖物
    function clearOverlay(e,ee){
        map.clearOverlays();
    }

    function markersSetCallback(locationpanel,text,searchResult){
        locationpanel.style.display = 'block';
        for(var g=0;g<map.getOverlays().length;g++){
            if(map.getOverlays()[g].toString()=='[object Marker]'){
                map.removeOverlay(map.getOverlays()[g]);
            }
        }
        var result_len=searchResult.length;
        for(var i=0;i<result_len;i++){
            var poi = new BMap.Point(searchResult[i].point.lng,searchResult[i].point.lat);
            var marker = new BMap.Marker(poi);
            var title;
            if(text=='影院'){
                var url=PATH+'cinemaresult/cinemaresult.html?cinemaname='+encodeURIComponent(searchResult[i].title);
                title='<a target="_blank" href="'+url+'">'+searchResult[i].title+'</a>'+'<a style="margin-left:10px" target="_blank" href="'+searchResult[i].detailUrl+'">详情</a>';
            }else{
                title=searchResult[i].title+'<a style="margin-left:10px" target="_blank" href="'+searchResult[i].detailUrl+'">详情</a>';
            }
            map.addOverlay(marker);
            var phonenum=searchResult[i].phoneNumber!=undefined?searchResult[i].phoneNumber:"无";
            var content=' <p  style="padding-top: 10px">地址：'+searchResult[i].address+'</p><span>电话号码：'+phonenum+'</span>';
            content+=info_window_tpl;
            (function(marker,title,content,searchResult){
                marker.addEventListener("click", function(e){
                    var searchInfoWindow=null;
                    searchInfoWindow = new BMapLib.SearchInfoWindow(map, content, {
                        title  :title,      //标题
                        width  : 290,             //宽度
                        height : 120,              //高度
                        panel  : "panel",         //检索结果面板
                        enableAutoPan : true,     //自动平移
                        enableCloseOnClick:true,
                        enableMessage:false,
                        searchTypes   :[
                            BMAPLIB_TAB_SEARCH,   //周边检索
                            BMAPLIB_TAB_TO_HERE,  //到这里去
                            BMAPLIB_TAB_FROM_HERE //从这里出发
                        ]
                    });
                    searchInfoWindow.open(marker);
                    $("#start_radio").on("click",function(){
                        ac_bs.setInputValue(searchResult.title);
                        ac_ts.setInputValue(searchResult.title);
                        ac_ws.setInputValue(searchResult.title);
                        ac_cs.setInputValue(searchResult.title);
                    });
                    $("#end_radio").on("click",function(){
                        ac_be.setInputValue(searchResult.title);
                        ac_te.setInputValue(searchResult.title);
                        ac_we.setInputValue(searchResult.title);
                        ac_ce.setInputValue(searchResult.title);
                    });
                });
            })(marker,title,content,searchResult[i]);
        }
        var overlay_num=map.getOverlays().length;
        for(var a=0;a<overlay_num;a++){
            if(map.getOverlays()[a].toString()=='[object Marker]'){
                deleteMenu(map.getOverlays()[a]);
            }
        }
        layer.closeAll();
    }


//打车信息
    function showTaxiInfo(rs){
        var alltr=$("#taxitable tr");
        alltr.eq(0).children().eq(1).text(rs.taxiFare.day.initialFare);
        alltr.eq(1).children().eq(1).text(rs.taxiFare.day.unitFare);
        alltr.eq(2).children().eq(1).text(rs.taxiFare.distance);
        alltr.eq(3).children().eq(1).text(rs.taxiFare.day.totalFare);
        alltr.eq(4).children().eq(1).text(rs.taxiFare.remark);
    }

});




