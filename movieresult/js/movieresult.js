
$(function(){
    var searchname=location.search.substring(1).split("&")[0].split("=")[1];
    var page=location.search.substring(1).split("&")[1].split("=")[1];
    var name=decodeURIComponent(searchname);
    var love_cinema=null;
    //查询电影或影院上映情况
    (function getSearchResult(){
        $(".resulttop").find("span").text(name);
        if(page==1){
            $("#previous").addClass("disabled");
        }
        searchMovieResults(searchname,name,page);
    })();

    //查询下一页结果
    (function nextPageResult(){
        var nextpage=getEleById("next");
        $(nextpage).on("click",function(){
            $("#previous").removeClass("disabled");
            page++;
            location.search="?moviename="+searchname+"&page="+page;
            searchMovieResults(searchname,name,page);
        });
    })();

    //查询首页结果
    (function firstPageResult(){
        var firstpage=getEleById("firstpage");
        $(firstpage).on("click",function(){
            location.search="?moviename="+searchname+"&page=1";
            $(".pager").children().removeClass("disabled").eq(1).addClass("disabled");
            searchMovieResults(searchname,name,1);

        });
    })();

    //查询上一页结果
    (function lastPageResult(){
        var lastpage=getEleById("previous");
        $(lastpage).on("click",function(){
            page--;
            location.search="?moviename="+searchname+"&page="+page;
            if(page==1){
                $(".pager").children().removeClass("disabled").eq(1).addClass("disabled");
            }
            searchMovieResults(searchname,name,page);
        });
    })();





    //查询电影上映情况
    function searchMovieResults(searchname,moviename,page){
        var url="http://api.map.baidu.com/telematics/v3/movie?qt=search_movie&wd="+searchname+"&location="+localStorage.getItem("city")+"&pn="+page+"&output=json&ak=OzH20ZxCHP2Au64y1Csmk61K";
        $.ajax({
            url:url,
            dataType:"jsonp",
            success:function(json){
                console.log(json);
                if(json["error"]==-3){
                    var resultcon=$(".resultcontainer");
                    resultcon.text("抱歉，没有找到与“"+moviename+"”的更多相关结果，请您检查输入或者尝试其他关键字");
                    resultcon.css({
                        background:"url('"+PATH+"common/img/searchoff.jpg') no-repeat center",
                        "background-size":"100% 100%",
                        height:"400px"
                    });
                    $("#next").addClass("disabled");
                    $(".loading").fadeOut();
                }else if(json["error"]==0){
                    var panelproto=getEleById("panelproto");
                    var resultnum=json["result"].length;
                    var panelhtml=$(".resultcontainer").html();
                    for(var i=0;i<resultnum;i++){
                        var $newpanel=$(panelproto).eq(0).clone(true);
                        $newpanel.attr("id","");
                        $newpanel.find(".c_id").text(json["result"][i]["uid"]);
                        $newpanel.find(".cinemaname").text(json["result"][i]["name"]);
                        $newpanel.find(".cinema_address").text(json["result"][i]["address"]);
                        $newpanel.find(".cinema_tel").text(json["result"][i]["telephone"]);
                        $newpanel.find(".cinema_rating").text(json["result"][i]["rating"]);
                        var timetablenum=json["result"][i]["time_table"].length;
                        if(timetablenum>0){
                            for(var a=0;a<timetablenum;a++){
                                var datehtml="<td>"+json["result"][i]["time_table"][a]["date"]+"</td>";
                                $newpanel.find(".moviedate").append(datehtml);
                                var timehtml="<td>"+json['result'][i]['time_table'][a]['time']+"</td>";
                                $newpanel.find(".movietime").append(timehtml);
                            }
                        }
                        else{
                            $newpanel.find(".moviedate").text("没有找到"+moviename+"的排片日期");
                        }
                        //$(".resultcontainer").append($newpanel);
                        panelhtml+="<div class='panel panel-success'>"+$newpanel.html()+"</div>";
                    }
                    $(".resultcontainer").html(panelhtml);

                    if(is_login){
                        ajaxSubmit(PATH+'php/cinema.php',{act:"mylove"},"json",function(data){
                            if(data.status=="Yes"){
                                love_cinema=data.data;
                                $(".panel").each(function(){
                                    var $this=$(this);
                                    if(love_cinema.indexOf($this.find(".c_id").text())>=0 && !$this.find(".c_collect").hasClass("love_cinema")){
                                        $this.find(".c_collect").addClass("love_cinema");
                                    }
                                })
                            }
                        });
                    }
                    $(".c_collect").on("click",function(){
                        var $this=$(this);
                        if(is_login){
                            var c_id=$this.parents(".panel").find(".c_id").text();
                            ajaxSubmit(PATH+"php/cinema.php",{act:"collect",c_id:c_id},"json",function(data){
                                console.log(data);
                                if(data.status=="Yes"){
                                    $this.addClass("love_cinema");
                                    layer.msg("收藏成功",{time:2000});
                                }else{
                                    if(data.type==3){
                                        layer.msg(data.info,{time:2000});
                                    }
                                }
                            }) ;
                        }else{
                            layer.confirm("您尚未登录", {
                                btn: ['登录','继续以游客身份访问']
                            }, function(){
                                layer.closeAll();
                                $("#loginModel").modal("show");
                            }, function(){
                                layer.closeAll();
                            });
                        }
                    });
                    $(".loading").fadeOut();
                    ajaxSubmit(PATH+'php/cinema.php',{act:"add",cinemas:json["result"]},"json",function(data){
                        console.log(data);
                    });
                }

            }
        });
    }
});


