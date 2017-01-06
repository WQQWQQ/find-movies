/**
 * Created by Administrator on 2016/3/28.
 */
var PATH="http://localhost:80/FindMovies/";
var is_login=false;
function ajaxSubmit(url, param,datatype, success) {
    $.ajax({
        url: url,
        data: param,
        dataType:datatype,
        type:'POST',
        success: function(data) {
            success(data);
        }
    });
}

function getCookie(c_name){
    if (document.cookie.length>0){
        var c_start=document.cookie.indexOf(c_name + "=");
        if (c_start!=-1) {
            c_start=c_start + c_name.length+1;
            var c_end=document.cookie.indexOf(";",c_start);
            if (c_end==-1){
                c_end=document.cookie.length;
            }
            return decodeURIComponent(document.cookie.substring(c_start,c_end));
        }
    }
    return "";
}

function setCookie(c_name,value,expiredays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=c_name+ "=" +encodeURIComponent(value)+";path=/"+ ((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
}


(function showErweima(){
    var qqer=getEleById("qqer");
    var qq=getEleById("qq");
    $(qq).on("click",function(){
        qqer.style.display="block";
        weixiner.style.display="none";
    });
    var weixin=getEleById("weixin");
    var weixiner=getEleById("weixiner");
    $(weixin).on("click",function(){
        weixiner.style.display="block";
        qqer.style.display="none";
    });
    function hideErweima(){
        this.style.display="none";
    }
    $(weixiner).on("click",hideErweima);
    $(qqer).on("click",hideErweima);
})();

(function fixedSearchBar(){
    $(window).scroll(function(){
        if($(window).scrollTop()>=50){
            $(".topbar").css({
                position:"fixed",
                top:0,
                height: "110px",
                "width":"100%",
                "background-color": "rgba(0,0,0,.5)",
                "background":"none\9",
                "-ms-filter": "progid:DXImageTransform.Microsoft.gradient(startcolorstr=#7F000000,endcolorstr=#7F000000)",
                filter: "progid:DXImageTransform.Microsoft.gradient(startcolorstr=#7F000000,endcolorstr=#7F000000)"
            });
        }
        else if($(window).scrollTop()<50){
            $(".topbar").css({
                height: "110px",
                position:"static",
                "background-color":"#f0f0f0",
                "-ms-filter": "progid:DXImageTransform.Microsoft.gradient(startcolorstr=#FFf0f0f0,endcolorstr=#FFf0f0f0)",
                filter: "progid:DXImageTransform.Microsoft.gradient(startcolorstr=#FFf0f0f0,endcolorstr=#FFf0f0f0)"
            })
        }
    })
})();

(function checkHasCookie(){
    var fm_name=getCookie("fm_name");
    var fm_uid=getCookie("fm_uid");
    if(fm_name!='' && fm_uid!=''){
        ajaxSubmit(PATH+"php/login.php",{act:"free",uid:fm_uid,name:fm_name},"json",function(data){
            checkIsLogin();
            return;
        });
    }else {
        checkIsLogin();
    }
})();

function checkIsLogin(){
    ajaxSubmit(PATH+"php/me.php",{},"json",function(data){
        console.log(data);
        if(data.status=="Yes"){
            $(".navbar-user").show();
            $(".navbar-login").hide();
            $("#fm_name").text(data.data.username);
            is_login=true;
        }else{
            if(data.type==3){
                $(".navbar-user").hide();
                $(".navbar-login").show();
                is_login=false;
            }
        }
    });
}

$("#collect").on("click",function(){
    if(is_login){
        location.href=PATH+'collect/collect.html';
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

(function login(){
    $("#login").on("click",function(){
        if($("#username").val()==''){
            layer.msg("请输入用户名",{time:2000});
        }else if($("#password").val()==''){
            layer.msg("请输入密码",{time:2000});
        }else {
            var param={
                username:$("#username").val(),
                password:$("#password").val(),
                act:"login",
                rem:$("#remember").prop("checked")
            };
            ajaxSubmit(PATH+"php/login.php",param,"json",function(data){
                if(data.status=="Yes"){
                    layer.msg(data.info,{time:2000},function(){
                        location.reload();
                    });
                }else{
                    if(data.type==3){
                        layer.confirm(data.info, {
                            btn: ['前往注册页面','继续以游客身份访问'] //按钮
                        }, function(){
                            location.href=PATH+"register/register.html";
                        }, function(){
                            layer.closeAll();
                            $('#loginModel').modal('hide');
                        });
                    }else if(data.type==4){
                        layer.msg(data.info,{time:2000});
                        $("#password").focus();
                    }
                }
                return;
            });

        }
    });
})();


(function logout(){
    $("#logout").on("click",function(){
        ajaxSubmit(PATH+"php/login.php", {act:"logout"},"json", function(data){
            console.log(data);
            if(data.status=="Yes"){
                layer.msg(data.info,{time:2000},function(){
                    location.href=PATH+"main/main.html";
                });
            }
        });
    });
})();

(function changeSearchItem(){
    $("#movieitem").on("click",function(){
        $("#currentitem").html("电影"+" <span class='caret'></span>");
        $("#searchtext").attr("placeholder","电影名称");
    });
    $("#cinemaitem").on("click",function(){
        $("#currentitem").html("影院"+" <span class='caret'></span>");
        $("#searchtext").attr("placeholder","影院名称");
    });
})();

(function searchMovieOrCinema(){
    var searchbtn=getEleById("search");
    $(searchbtn).on("click",function(){
        var searchtext=getEleById("searchtext").value;
        if(searchtext!="" && /电影/.test($("#currentitem").text())){
            location.href=PATH+"movieresult/movieresult.html?moviename="+encodeURIComponent(searchtext)+"&page=1";
        }
        else if(searchtext!="" && /影院/.test($("#currentitem").text())){
            location.href=PATH+"cinemaresult/cinemaresult.html?cinemaname="+encodeURIComponent(searchtext);
        }
    });
    $(document).on("click",".piccover",function(){
        location.href=PATH+"movieresult/movieresult.html?moviename="+encodeURIComponent($(this).parents(".moviewrap").find(".moviename").text())+"&page=1";
    })
})();

function getEleById(id){
    return document.getElementById(id);
}
