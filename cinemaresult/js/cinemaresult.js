/**
 * Created by Administrator on 2015/11/16.
 */
$(function(){
    var searchname=location.search.substring(1).split("=")[1];
    var name=decodeURIComponent(searchname);
    var love_cinema=null;
    (function getSearchResult(){
        $(".resulttop").find("span").text(name);
        searchCinemaResults(searchname,name);
    })();

    //搜索影院结果
    function searchCinemaResults(searchname,cinemaname){
        var url="http://api.map.baidu.com/telematics/v3/movie?qt=search_cinema&wd="+searchname+"&location="+localStorage.getItem("city")+"&output=json&ak=OzH20ZxCHP2Au64y1Csmk61K";
        $.ajax({
            url:url,
            dataType:"jsonp",
            success:function(json){
                console.log(json);
                if(json["error"]==-3){
                    var resultcon=$(".resultcontainer");
                    resultcon.text("抱歉，没有找到与“"+cinemaname+"”的更多相关结果，请您检查输入或者尝试其他关键字");
                    resultcon.css({
                        background:"url('"+PATH+"common/img/searchoff.jpg') no-repeat center",
                        "background-size":"100% 100%",
                        height:"400px"
                    });
                    $("#next").addClass("disabled");
                    $(".loading").fadeOut();
                } else if(json["error"]==0){
                    var panelproto=getEleById("panelproto");
                    var resultnum=json["result"].length;
                    for(var i=0;i<resultnum;i++){
                        var $newpanel=$(panelproto).eq(0).clone(true);
                        $newpanel.addClass("cinema_panel");
                        $newpanel.attr("id","");
                        $newpanel.find(".cinemaname").text(json["result"][i]["name"]);
                        $newpanel.find(".c_id").text(json["result"][i]["uid"]);
                        $newpanel.find(".cinema_address").text(json["result"][i]["address"]);
                        $newpanel.find(".cinema_tel").text(json["result"][i]["telephone"]);
                        $newpanel.find(".cinema_rating").text(json["result"][i]["rating"]);
                        var movienum=json["result"][i]["movies"].length;
                        if(movienum>0){
                            var $moviebox=$newpanel.find(".moviebox");
                            $moviebox.width(170*movienum);
                            var movieboxhtml="";
                            for(var b=0;b<movienum;b++){
                                movieboxhtml+="<div class='movieposter'><img src='"+json["result"][i]["movies"][b]["movie_picture"]+"'/></div>"
                            }

                            $moviebox.html(movieboxhtml);
                            $moviebox.find(".movieposter").eq(0).addClass("activemovie");
                            showMovieInfo($newpanel,json,i,0);
                        }
                        else{
                            $newpanel.find(".showcaseheader").html("<h3>暂无热映电影</h3>");
                            $newpanel.find(".movieshowcase").hide();
                            $newpanel.find(".movieinfo").hide();
                            $newpanel.find(".table-responsive").hide();
                        }
                        var comment_list=json["result"][i]["review"];
                        var comment_num=comment_list.length;
                        $newpanel.find(".comment_count").text(comment_num);
                        var page_count=Math.ceil(comment_num/4);
                        for(var a=0;a<page_count;a++){
                            $newpanel.find(".pagination").append('<li class="page"><a>'+(a+1)+'</a></li>');
                        }
                        $(".resultcontainer").append($newpanel);
                        $newpanel.find(".page").on("click",{comment_list:comment_list,panel:$newpanel},function(e){
                           $(this).addClass("active").siblings().removeClass("active");
                            var page=$(this).text();
                            var review= e.data.comment_list;
                            var panel=e.data.panel;
                            panel.find(".comment_list").html("");
                            for(var m=(page-1)*4;m<(page-1)*4+4;m++){
                                if(review[m]){
                                    var content='<li class="list-group-item">';
                                    content+='<p class="comment">'+review[m].content+'</p>';
                                    content+='<span class="comment_date">'+review[m].date+'</span></li>';
                                    panel.find(".comment_list").append(content);
                                }
                            }
                        }).eq(0).click();
                    }
                    $(".cinema_panel").each(function(index){
                        var $this=$(this);
                        $this.find(".movieposter").each(function(i){
                            var $that=$(this);
                            $that.on("click",function(){
                                $(".infoloading").show();
                                $that.siblings().removeClass("activemovie").end().addClass("activemovie");
                                $.ajax({
                                    url:"http://api.map.baidu.com/telematics/v3/movie?qt=search_cinema&wd="+searchname+"&location="+localStorage.getItem("city")+"&output=json&ak=OzH20ZxCHP2Au64y1Csmk61K",
                                    dataType:"jsonp",
                                    success:function(json){
                                        showMovieInfo($this,json,index,i);
                                        $(".infoloading").fadeOut();
                                    }
                                });
                            });
                        });
                    });
                    $(".rightcontrol").each(function(index){
                        var $this=$(this);
                        $this.on("click",function(){
                            var $moviebox=$this.siblings(".moviebox");
                            var boxwidth=$moviebox.width();
                            var currentleft=Number($moviebox.position().left);
                            var showcasewidth=$this.parent().outerWidth();
                            if(-currentleft < Number(boxwidth-showcasewidth)-170){
                                $moviebox.animate({
                                    left:currentleft-170
                                },300);
                            }
                        });

                    });
                    $(".leftcontrol").each(function(index){
                        var $this=$(this);
                        $this.on("click",function(){
                            var $moviebox=$this.siblings(".moviebox");
                            var currentleft=$moviebox.position().left;
                            if(currentleft<0){
                                $moviebox.animate({
                                    left:currentleft+170
                                });
                            }
                        });
                    });
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
                    ajaxSubmit(PATH+'php/cinema.php',{act:"add",cinemas:json["result"]},"json",function(data){
                        console.log(data);
                    });
                }
                $(".loading").fadeOut();

            }
        })
    }
//展示电影信息
    function showMovieInfo(panel,json,resultindex,movieindex){
        panel.find(".moviescore").text(json["result"][resultindex]["movies"][movieindex]["movie_score"]);
        panel.find(".moviename").text(json["result"][resultindex]["movies"][movieindex]["movie_name"]);
        panel.find(".moviereleasedate").text(json["result"][resultindex]["movies"][movieindex]["movie_release_date"]);
        panel.find(".movielength").text(json["result"][resultindex]["movies"][movieindex]["movie_length"]+"分钟");
        panel.find(".movietag").text(json["result"][resultindex]["movies"][movieindex]["movie_tags"]);
        panel.find(".movienation").text(json["result"][resultindex]["movies"][movieindex]["movie_nation"]);
        panel.find(".movietype").text(json["result"][resultindex]["movies"][movieindex]["movie_type"]);
        panel.find(".moviedirector").text(json["result"][resultindex]["movies"][movieindex]["movie_director"]);
        panel.find(".moviestarring").text(json["result"][resultindex]["movies"][movieindex]["movie_starring"]);
        panel.find(".moviedescription").text(json["result"][resultindex]["movies"][movieindex]["movie_description"]);
        var timetablenum=json["result"][resultindex]["movies"][movieindex]["time_table"].length;
        if(timetablenum>0){
            var datehtml="";
            var timehtml="";
            for(var a=0;a<timetablenum;a++){
                datehtml+="<td>"+json["result"][resultindex]["movies"][movieindex]["time_table"][a]['date']+"</td>";
                timehtml+="<td>"+json["result"][resultindex]["movies"][movieindex]["time_table"][a]['time']+"</td>";
            }
            panel.find(".moviedate").html(datehtml);
            panel.find(".movietime").html(timehtml);
        }
        else{
            panel.find(".moviedate").text("没有找到"+json["result"][resultindex]["movies"][movieindex]["movie_name"]+"的排片日期");
        }
    }
});



