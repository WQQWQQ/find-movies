/**
 * Created by Administrator on 2016/4/4.
 */
$(function(){
   ajaxSubmit(PATH+"php/movie.php",{act:"mycollect"},"json",function(data){
       console.log(data);
       if(data.status=="Yes"){
           var movies=data.data;
           for(var i= 0,len=movies.length;i<len;i++){
               var content='<div class="col-sm-4 col-md-3 "><div class="thumbnail" data-id="'+movies[i].movie_id+'">';
               content+='<img width="100%" src="'+movies[i].movie_pic+'" alt="'+movies[i].moviename+'">';
               content+='<div class="caption">';
               content+='<h4 class="textoverflow moviename">'+movies[i].moviename+'</h4>';
               content+='<p class="text-muted textoverflow">'+movies[i].movie_msg+'</p>';
               content+='<p><a class="btn btn-info btn-sm detail" data-toggle="modal" data-target="#movieModal" role="button">查看详情</a> <a class="btn btn-sm btn-danger m_cancel" role="button">取消收藏</a></p>';
               content+=' </div></div></div>';
               $("#movie .row").append(content);
           }
           $(".thumbnail img").each(function(){
              $(this).height($(this).width()*1.4);
               $(this).on("click",function(){
                   var movie_name=$(this).parents(".thumbnail").find(".moviename").text();
                   location.href=PATH+"movieresult/movieresult.html?moviename="+encodeURIComponent(movie_name)+"&page=1";
               })
           });
           $(".detail").each(function(index){
               $(this).on("click",function(e){
                   var movieModal=getEleById("movieModal");
                   $(movieModal).find(".moviename").text(movies[index]["moviename"]);
                   $(movieModal).find(".movietype").text(movies[index]["movie_type"]);
                   $(movieModal).find(".movietag").text(movies[index]["movie_tag"]);
                   $(movieModal).find(".moviedate").text(movies[index]["movie_date"]);
                   $(movieModal).find(".moviecountry").text(movies[index]["movie_country"]);
                   $(movieModal).find(".moviedirector").text(movies[index]["movie_director"]);
                   $(movieModal).find(".moviestar").text(movies[index]["movie_star"]);
                   $(movieModal).find(".movietime").text(movies[index]["movie_length"]+"分钟");
                   $(movieModal).find(".moviemsg").text(movies[index]["movie_msg"]);
                   $(movieModal).find(".moviescore").text(movies[index]["movie_score"]);
               }) ;
           });


           $(".m_cancel").on("click",function(){
               var $this=$(this);
               var id=$this.parents(".thumbnail").data("id");
               layer.confirm("确定要取消收藏该电影吗", {
                   btn: ['憋废话，删！','不好意思手贱']
               }, function(){
                   layer.closeAll();
                   ajaxSubmit(PATH+"php/movie.php", {act:"delete",m_id:id},"json", function(data){
                       console.log(data);
                       if(data.status=="Yes"){
                           layer.msg(data.info,{time:2000},function(){
                               location.reload();
                           });
                       }
                   });

               }, function(){
                   layer.closeAll();
               });
           });

       }else{
           var $moviecon=$("#movie");
           $moviecon.text("您还没有收藏电影呢，赶快去收藏吧~");
           $moviecon.css({
               background:"url('"+PATH+"common/img/searchoff.jpg') no-repeat center",
               "background-size":"100% 100%",
               height:"400px"
           });
       }



   }) ;
   ajaxSubmit(PATH+"php/cinema.php",{act:"mycollect"},"json",function(data){
       console.log(data);
       if(data.status=="Yes"){
           var cinemas=data.data;
           for(var i= 0,len=cinemas.length;i<len;i++){
               var content=' <div class="panel panel-info" data-id="'+cinemas[i].uid+'"> <div class="panel-heading">';
               content+='<span class="panel-title">'+cinemas[i].cinemaname+'</span><span class=" glyphicon glyphicon-remove c_cancel" title="取消收藏"></span>';
               content+='</div> <div class="panel-body">';
               content+='<div class="addressdiv col-md-6"><span class="ficon icon-address"></span>地址：<span class="cinema_address">'+cinemas[i].address+'</span>';
               content+='</div> <div class="teldiv col-md-4">';
               content+='<span class="ficon icon-phone"></span>电话：<span class="cinema_tel">'+cinemas[i].phone+'</span>';
               content+='</div> <div class="ratediv col-md-2">';
               content+='<span class="ficon icon-thumbs-up"></span>评级：<span class="cinema_rating">'+cinemas[i].score+'</span>';
               content+='</div> </div></div>';
               $("#cinema").append(content);
           }
           $(".panel").on("click",function(){
               var cinema_name=$(this).find(".panel-title").text();
               location.href=PATH+"cinemaresult/cinemaresult.html?cinemaname="+encodeURIComponent(cinema_name);
           });
           $(".c_cancel").on("click",function(e){
               e.stopPropagation();
               var $this=$(this);
               var id=$this.parents(".panel").data("id");
               layer.confirm("确定要取消收藏影院吗", {
                   btn: ['憋废话，删！','不好意思手贱']
               }, function(){
                   layer.closeAll();
                   ajaxSubmit(PATH+"php/cinema.php", {act:"delete",c_id:id},"json", function(data){
                       console.log(data);
                       if(data.status=="Yes"){
                           layer.msg(data.info,{time:2000},function(){
                               $this.parents(".panel").remove();
                               if($(".panel").length==0){
                                   var $cinemacon=$("#cinema");
                                   $cinemacon.text("您还没有收藏影院呢，赶快去收藏吧~");
                                   $cinemacon.css({
                                       background:"url('"+PATH+"common/img/searchoff.jpg') no-repeat center",
                                       "background-size":"100% 100%",
                                       height:"400px"
                                   });
                               }
                           });
                       }
                   });

               }, function(){
                   layer.closeAll();
               });
           });
       }else{
           var $cinemacon=$("#cinema");
           $cinemacon.text("您还没有收藏影院呢，赶快去收藏吧~");
           $cinemacon.css({
               background:"url('"+PATH+"common/img/searchoff.jpg') no-repeat center",
               "background-size":"100% 100%",
               height:"400px"
           });
       }

   }) ;
});