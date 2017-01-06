
$(function(){

    var love_movie=null;
    var param={
        filter_type:'',
        filter_tag:'',
        sort_type:'',
        order_type:''
    };
    var moremovieshow=false;
    var isfirst=true;

    //热映电影
    (function hotMovies(){
        ajaxSubmit("http://api.map.baidu.com/telematics/v3/movie?qt=hot_movie&location="+localStorage.getItem("city")+"&output=json&ak=OzH20ZxCHP2Au64y1Csmk61K",{},"jsonp",function(json){
            console.log(json);
            if(json.status=="Success"){
                var movies=json["result"]["movie"];
                var movienum=movies.length;
                $(".hotmovieheader h2 span").text(movienum);
                //$(".movie").each(function(index){
                //    $(this).find(".moviename").text(json["result"]["movie"][index]["movie_name"]);
                //    $(this).find(".movietime").text(json["result"]["movie"][index]["movie_length"]+"分钟");
                //    $(this).find(".movietype").text(" "+json["result"]["movie"][index]["movie_type"]);
                //    $(this).find(".movietag").html("<span class='ficon icon-tag'></span>"+json["result"]["movie"][index]["movie_tags"]);
                //    $(this).find(".moviemsg").html("<span class='ficon icon-quote-left'></span>"+json["result"]["movie"][index]["movie_message"]);
                //    $(this).find(".moviescore").text(json["result"]["movie"][index]["movie_score"]);
                //    $(this).find(".moreinfo").attr("data-movieindex",index);
                //    $(this).find(".m_id").text(json["result"]["movie"][index]["movie_id"]);
                //});
                //var movies=data.data;
                $(".moviecontainer").add(".morehotmovie").html("");
                for(var i= 0,len=movies.length;i<len;i++){
                    var content='<div class="movie col-md-4 col-sm-6 col-xs-12"> <span class="m_id hide">'+movies[i].movie_id+'</span>';
                    content+='<div class="moviewrap"><div class="moviepic">';
                    content+=' <a><img src="'+movies[i].movie_picture+'" alt=""/></a>';
                    content+='<div class="collect"><span class="ficon icon-heart"></span></div>';
                    content+='<span class="moviescore">'+movies[i].movie_score+'</span>';
                    content+=' <div class="piccover"></div>';
                    content+='</div> <div class="movieinfo" >';
                    content+='<h4 class="moviename">'+movies[i].movie_name+'</h4>';
                    content+='<h5><span class="movietime">'+movies[i].movie_length+'分钟</span> <span class="movietype">'+movies[i].movie_type+'</span></h5>';
                    content+='<h5 class="movietag"><span class="ficon icon-tag"></span>'+movies[i].movie_tags+'</h5>';
                    content+='<p class="moviemsg"><span class="ficon icon-quote-left"></span>'+movies[i].movie_message+'</p>';
                    content+='<a class="btn btn-primary btn-sm moreinfo" data-movieindex="'+i+'" data-toggle="modal" data-target="#movieModal">了解更多</a></div> </div> </div>';
                    if(i<9){
                        $(".moviecontainer").append(content);
                    }else{
                        $(".morehotmovie").append(content).hide();
                    }
                }
                $(".loading").fadeOut();
                $("#wrapper").fadeIn();
                $(".moreinfo").on("click",function(){
                    var index=$(this).attr("data-movieindex");
                    var movieModal=getEleById("movieModal");
                    $(movieModal).find(".moviename").text(json["result"]["movie"][index]["movie_name"]);
                    $(movieModal).find(".movietype").text(json["result"]["movie"][index]["movie_type"]);
                    $(movieModal).find(".movietag").text(json["result"]["movie"][index]["movie_tags"]);
                    $(movieModal).find(".moviedate").text(json["result"]["movie"][index]["movie_release_date"]);
                    $(movieModal).find(".moviecountry").text(json["result"]["movie"][index]["movie_nation"]);
                    $(movieModal).find(".moviedirector").text(json["result"]["movie"][index]["movie_director"]);
                    $(movieModal).find(".moviestar").text(json["result"]["movie"][index]["movie_starring"]);
                    $(movieModal).find(".movietime").text(json["result"]["movie"][index]["movie_length"]+"分钟");
                    $(movieModal).find(".moviemsg").text(json["result"]["movie"][index]["movie_message"]);
                    $(movieModal).find(".moviescore").text(json["result"]["movie"][index]["movie_score"]);
                });
                checkCollect();
                ajaxSubmit(PATH+'php/movie.php',{act:"add",movies:json["result"]["movie"]},"json",function(data){
                    console.log(data);
                });
            }

        });

    })();


    function checkCollect(){
        if(is_login){
            ajaxSubmit(PATH+'php/movie.php',{act:"mylove"},"json",function(data){
                if(data.status=="Yes"){
                    love_movie=data.data;
                    $(".movie").each(function(){
                        var $this=$(this);
                        if(love_movie.indexOf($this.find(".m_id").text())>=0 && !$this.find(".collect").hasClass("love_movie")){
                            $this.find(".collect").addClass("love_movie");
                        }
                    })
                }
            });
        }
    }


    //查询更多热映电影
    (function moreHotMovies(){
        $(".morediv").on("click",function(){
            if(!moremovieshow){
                $(".morehotmovie").slideDown();
                $(".morediv").children("span").text("收起");
                $(this).find(".glyphicon").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
                moremovieshow=true;
            }else{
                $(".morehotmovie").slideUp();
                $(".morediv").children("span").text("更多");
                $(this).find(".glyphicon").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
                moremovieshow=false;
            }
        });
    })();


    //收藏电影
    (function collectMovies(){
        $(document).on("click",".collect",function(){
            var $this=$(this);
            if(is_login){
                var m_id=$this.parents(".movie").find(".m_id").text();
                ajaxSubmit(PATH+"php/movie.php",{act:"collect",m_id:m_id},"json",function(data){
                    console.log(data);
                    if(data.status=="Yes"){
                        $this.addClass("love_movie");
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
    })();

    $(".default_btn").on("click",function(){
        param.sort_type="";
        param.order_type='';
        $(".score_btn").html('按评分'+ '<span class="caret"></span>');
        $(".date_btn").html('按上映日期'+ '<span class="caret"></span>');
        moremovieshow=false;
        isfirst=false;
        $(".morehotmovie").slideUp();
        $(".morediv").children("span").text("更多");
        $("#showmore").find("span").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
        ajaxSubmit(PATH+"php/hot_movie.php",param,"json",function(data){
            console.log(data);
            if(data.status=="Yes"){
                var movies=data.data;
                var $moviecon=$(".moviecontainer");
                $moviecon.add(".morehotmovie").html("");
                var len=movies.length;
                if(len>0){
                    $moviecon.css({
                        "background":"none",
                        height:"auto"
                    });
                    $(".morediv").show();
                    for(var i= 0;i<len;i++){
                        var content='<div class="movie col-md-4 col-sm-6 col-xs-12"> <span class="m_id hide">'+movies[i].movie_id+'</span>';
                        content+='<div class="moviewrap"><div class="moviepic">';
                        content+=' <a><img src="'+movies[i].movie_pic+'" alt=""/></a>';
                        content+='<div class="collect"><span class="ficon icon-heart"></span></div>';
                        content+='<span class="moviescore">'+movies[i].movie_score+'</span>';
                        content+=' <div class="piccover"></div>';
                        content+='</div> <div class="movieinfo" >';
                        content+='<h4 class="moviename">'+movies[i].movie_name+'</h4>';
                        content+='<h5><span class="movietime">'+movies[i].movie_length+'分钟</span> <span class="movietype">'+movies[i].movie_type+'</span></h5>';
                        content+='<h5 class="movietag">'+movies[i].movie_tags+'</h5>';
                        content+='<p class="moviemsg">'+movies[i].movie_msg+'</p>';
                        content+='<a class="btn btn-primary btn-sm moreinfo" data-movieindex="'+i+'" data-toggle="modal" data-target="#movieModal">了解更多</a></div> </div> </div>';
                        if(i<9){
                            $moviecon.append(content);
                        }else{
                            $(".morehotmovie").append(content).hide();
                        }
                    }
                    checkCollect();
                    $(".moreinfo").on("click",function(){
                        var index=$(this).attr("data-movieindex");
                        var movieModal=getEleById("movieModal");
                        $(movieModal).find(".moviename").text(movies[index]["movie_name"]);
                        $(movieModal).find(".movietype").text(movies[index]["movie_type"]);
                        $(movieModal).find(".movietag").text(movies[index]["movie_tags"]);
                        $(movieModal).find(".moviedate").text(movies[index]["movie_date"]);
                        $(movieModal).find(".moviecountry").text(movies[index]["movie_nation"]);
                        $(movieModal).find(".moviedirector").text(movies[index]["movie_director"]);
                        $(movieModal).find(".moviestar").text(movies[index]["movie_star"]);
                        $(movieModal).find(".movietime").text(movies[index]["movie_length"]+"分钟");
                        $(movieModal).find(".moviemsg").text(movies[index]["movie_msg"]);
                        $(movieModal).find(".moviescore").text(movies[index]["movie_score"]);
                    });
                }else{
                    $moviecon.html('<span style="margin-left: 20px;">抱歉，没有找到与该查询条件符合的电影，请您尝试其他查询条件</span>');
                    $moviecon.css({
                        background:"url('"+PATH+"common/img/searchoff.jpg') no-repeat center",
                        "background-size":"100% 100%",
                        height:"400px"
                    });
                    $(".morediv").hide();
                }

            }
        });
    });

    (function sortMovies(){
        $(".sort").on("click",function(){
            param.sort_type=$(this).data("type");
            if(param.sort_type=="score"){
                $(".score_btn").html("按评分"+$(this).text()+'<span class="caret"></span>');
                $(".date_btn").html("按上映日期"+'<span class="caret"></span>');
            }else if(param.sort_type=="date"){
                $(".date_btn").html("按上映日期"+$(this).text()+'<span class="caret"></span>');
                $(".score_btn").html("按评分"+'<span class="caret"></span>');
            }
            param.order_type=$(this).data("order");
            moremovieshow=false;
            isfirst=false;
            $(".morehotmovie").slideUp();
            $(".morediv").children("span").text("更多");
            $("#showmore").find("span").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
           ajaxSubmit(PATH+"php/hot_movie.php",param,"json",function(data){
                console.log(data);
               if(data.status=="Yes"){
                   var movies=data.data;
                   var $moviecon=$(".moviecontainer");
                   $moviecon.add(".morehotmovie").html("");
                   var len=movies.length;
                   if(len>0){
                       $moviecon.css({
                           "background":"none",
                           height:"auto"
                       });
                       $(".morediv").show();
                       for(var i= 0;i<len;i++){
                           var content='<div class="movie col-md-4 col-sm-6 col-xs-12"> <span class="m_id hide">'+movies[i].movie_id+'</span>';
                           content+='<div class="moviewrap"><div class="moviepic">';
                           content+=' <a><img src="'+movies[i].movie_pic+'" alt=""/></a>';
                           content+='<div class="collect"><span class="ficon icon-heart"></span></div>';
                           content+='<span class="moviescore">'+movies[i].movie_score+'</span>';
                           content+=' <div class="piccover"></div>';
                           content+='</div> <div class="movieinfo" >';
                           content+='<h4 class="moviename">'+movies[i].movie_name+'</h4>';
                           content+='<h5><span class="movietime">'+movies[i].movie_length+'分钟</span> <span class="movietype">'+movies[i].movie_type+'</span></h5>';
                           content+='<h5 class="movietag"><span class="ficon icon-tag"></span>'+movies[i].movie_tags+'</h5>';
                           content+='<p class="moviemsg"><span class="ficon icon-quote-left"></span>'+movies[i].movie_msg+'</p>';
                           content+='<a class="btn btn-primary btn-sm moreinfo" data-movieindex="'+i+'" data-toggle="modal" data-target="#movieModal">了解更多</a></div> </div> </div>';
                           if(i<9){
                               $moviecon.append(content);
                           }else{
                               $(".morehotmovie").append(content).hide();
                           }
                       }
                       checkCollect();
                       $(".moreinfo").on("click",function(){
                           var index=$(this).attr("data-movieindex");
                           var movieModal=getEleById("movieModal");
                           $(movieModal).find(".moviename").text(movies[index]["movie_name"]);
                           $(movieModal).find(".movietype").text(movies[index]["movie_type"]);
                           $(movieModal).find(".movietag").text(movies[index]["movie_tags"]);
                           $(movieModal).find(".moviedate").text(movies[index]["movie_date"]);
                           $(movieModal).find(".moviecountry").text(movies[index]["movie_nation"]);
                           $(movieModal).find(".moviedirector").text(movies[index]["movie_director"]);
                           $(movieModal).find(".moviestar").text(movies[index]["movie_star"]);
                           $(movieModal).find(".movietime").text(movies[index]["movie_length"]+"分钟");
                           $(movieModal).find(".moviemsg").text(movies[index]["movie_msg"]);
                           $(movieModal).find(".moviescore").text(movies[index]["movie_score"]);
                       });
                   }else{
                       $moviecon.html('<span style="margin-left: 20px;">抱歉，没有找到与该查询条件符合的电影，请您尝试其他查询条件</span>');
                       $moviecon.css({
                           background:"url('"+PATH+"common/img/searchoff.jpg') no-repeat center",
                           "background-size":"100% 100%",
                           height:"400px"
                       });
                       $(".morediv").hide();
                   }


               }
           });
        });
    })();
    (function filterByTag(){
        $(".filter_tag").on("click",function(){
            var $this=$(this);
            $this.parents(".dropdown-menu").siblings(".btn-info").html($this.text()+' <span class="caret"></span>');
            param.filter_tag=$this.text()=="全部分类"?"":$this.text();
            moremovieshow=false;
            isfirst=false;
            $(".morehotmovie").slideUp();
            $(".morediv").children("span").text("更多");
            $("#showmore").find("span").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
           ajaxSubmit(PATH+"php/hot_movie.php",param,"json",function(data){
                console.log(data);
               if(data.status=="Yes"){
                   var movies=data.data;
                   var $moviecon=$(".moviecontainer");
                   $moviecon.add(".morehotmovie").html("");
                   var len=movies.length;
                   if(len>0){
                       $moviecon.css({
                           "background":"none",
                           height:"auto"
                       });
                       $(".morediv").show();
                       for(var i= 0;i<len;i++){
                           var content='<div class="movie col-md-4 col-sm-6 col-xs-12"> <span class="m_id hide">'+movies[i].movie_id+'</span>';
                           content+='<div class="moviewrap"><div class="moviepic">';
                           content+=' <a><img src="'+movies[i].movie_pic+'" alt=""/></a>';
                           content+='<div class="collect"><span class="ficon icon-heart"></span></div>';
                           content+='<span class="moviescore">'+movies[i].movie_score+'</span>';
                           content+=' <div class="piccover"></div>';
                           content+='</div> <div class="movieinfo" >';
                           content+='<h4 class="moviename">'+movies[i].movie_name+'</h4>';
                           content+='<h5><span class="movietime">'+movies[i].movie_length+'分钟</span> <span class="movietype">'+movies[i].movie_type+'</span></h5>';
                           content+='<h5 class="movietag"><span class="ficon icon-tag"></span>'+movies[i].movie_tags+'</h5>';
                           content+='<p class="moviemsg"><span class="ficon icon-quote-left"></span>'+movies[i].movie_msg+'</p>';
                           content+='<a class="btn btn-primary btn-sm moreinfo" data-movieindex="'+i+'" data-toggle="modal" data-target="#movieModal">了解更多</a></div> </div> </div>';
                           if(i<9){
                               $moviecon.append(content);
                           }else{
                               $(".morehotmovie").append(content).hide();
                           }
                       }
                       checkCollect();
                       $(".moreinfo").on("click",function(){
                           var index=$(this).attr("data-movieindex");
                           var movieModal=getEleById("movieModal");
                           $(movieModal).find(".moviename").text(movies[index]["movie_name"]);
                           $(movieModal).find(".movietype").text(movies[index]["movie_type"]);
                           $(movieModal).find(".movietag").text(movies[index]["movie_tags"]);
                           $(movieModal).find(".moviedate").text(movies[index]["movie_date"]);
                           $(movieModal).find(".moviecountry").text(movies[index]["movie_nation"]);
                           $(movieModal).find(".moviedirector").text(movies[index]["movie_director"]);
                           $(movieModal).find(".moviestar").text(movies[index]["movie_star"]);
                           $(movieModal).find(".movietime").text(movies[index]["movie_length"]+"分钟");
                           $(movieModal).find(".moviemsg").text(movies[index]["movie_msg"]);
                           $(movieModal).find(".moviescore").text(movies[index]["movie_score"]);
                       });
                   }else{
                       $moviecon.html('<span style="margin-left: 20px;">抱歉，没有找到与该查询条件符合的电影，请您尝试其他查询条件</span>');
                       $moviecon.css({
                           background:"url('"+PATH+"common/img/searchoff.jpg') no-repeat center",
                           "background-size":"100% 100%",
                           height:"400px"
                       });
                       $(".morediv").hide();
                   }

               }
           });
        });
    })();
    (function filterByType(){
        $(".filter_type").on("click",function(){
            var $this=$(this);
            $this.parents(".dropdown-menu").siblings(".btn-info").html($this.text()+' <span class="caret"></span>');
            param.filter_type=$this.text()=="全部类型"?"":$this.text();
            moremovieshow=false;
            isfirst=false;
            $(".morehotmovie").slideUp();
            $(".morediv").children("span").text("更多");
            $("#showmore").find("span").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
           ajaxSubmit(PATH+"php/hot_movie.php",param,"json",function(data){
                console.log(data);
               if(data.status=="Yes"){
                   var movies=data.data;
                   var $moviecon=$(".moviecontainer");
                   $moviecon.add(".morehotmovie").html("");
                   var len=movies.length;
                   if(len>0){
                       $moviecon.css({
                           "background":"none",
                           height:"auto"
                       });
                       $(".morediv").show();
                       for(var i= 0;i<len;i++){
                           var content='<div class="movie col-md-4 col-sm-6 col-xs-12"> <span class="m_id hide">'+movies[i].movie_id+'</span>';
                           content+='<div class="moviewrap"><div class="moviepic">';
                           content+=' <a><img src="'+movies[i].movie_pic+'" alt=""/></a>';
                           content+='<div class="collect"><span class="ficon icon-heart"></span></div>';
                           content+='<span class="moviescore">'+movies[i].movie_score+'</span>';
                           content+=' <div class="piccover"></div>';
                           content+='</div> <div class="movieinfo" >';
                           content+='<h4 class="moviename">'+movies[i].movie_name+'</h4>';
                           content+='<h5><span class="movietime">'+movies[i].movie_length+'分钟</span> <span class="movietype">'+movies[i].movie_type+'</span></h5>';
                           content+='<h5 class="movietag"><span class="ficon icon-tag"></span>'+movies[i].movie_tags+'</h5>';
                           content+='<p class="moviemsg"><span class="ficon icon-quote-left"></span>'+movies[i].movie_msg+'</p>';
                           content+='<a class="btn btn-primary btn-sm moreinfo" data-movieindex="'+i+'" data-toggle="modal" data-target="#movieModal">了解更多</a></div> </div> </div>';
                           if(i<9){
                               $moviecon.append(content);
                           }else{
                               $(".morehotmovie").append(content).hide();
                           }
                       }
                       checkCollect();
                       $(".moreinfo").on("click",function(){
                           var index=$(this).attr("data-movieindex");
                           var movieModal=getEleById("movieModal");
                           $(movieModal).find(".moviename").text(movies[index]["movie_name"]);
                           $(movieModal).find(".movietype").text(movies[index]["movie_type"]);
                           $(movieModal).find(".movietag").text(movies[index]["movie_tags"]);
                           $(movieModal).find(".moviedate").text(movies[index]["movie_date"]);
                           $(movieModal).find(".moviecountry").text(movies[index]["movie_nation"]);
                           $(movieModal).find(".moviedirector").text(movies[index]["movie_director"]);
                           $(movieModal).find(".moviestar").text(movies[index]["movie_star"]);
                           $(movieModal).find(".movietime").text(movies[index]["movie_length"]+"分钟");
                           $(movieModal).find(".moviemsg").text(movies[index]["movie_msg"]);
                           $(movieModal).find(".moviescore").text(movies[index]["movie_score"]);
                       });
                   }else{
                       $moviecon.html('<span style="margin-left: 20px;">抱歉，没有找到与该查询条件符合的电影，请您尝试其他查询条件</span>');
                       $moviecon.css({
                           background:"url('"+PATH+"common/img/searchoff.jpg') no-repeat center",
                           "background-size":"100% 100%",
                           height:"400px"
                       });
                       $(".morediv").hide();
                   }


               }
           });
        });
    })();



});






